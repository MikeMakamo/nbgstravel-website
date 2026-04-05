import crypto from "node:crypto";
import { config } from "../config/env.js";
import { query } from "../db/pool.js";

function buildFallbackReviews() {
  return [
    {
      source_review_id: "seed-review-1",
      reviewer_name: "Satisfied Traveler",
      reviewer_avatar_url: null,
      rating: 5,
      review_text: "Professional planning, responsive communication, and memorable trips.",
      reviewed_at: new Date(),
      raw_payload_json: JSON.stringify({ fallback: true })
    }
  ];
}

async function fetchReviewsFromRemote() {
  if (!config.googleReviews.syncUrl) {
    return buildFallbackReviews();
  }

  const response = await fetch(config.googleReviews.syncUrl, {
    headers: config.googleReviews.apiKey
      ? {
          Authorization: `Bearer ${config.googleReviews.apiKey}`
        }
      : {}
  });

  if (!response.ok) {
    throw new Error(`Google reviews sync failed with status ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data.reviews) ? data.reviews : buildFallbackReviews();
}

export async function syncReviews() {
  const startedAt = new Date();

  try {
    const reviews = await fetchReviewsFromRemote();
    let inserted = 0;
    let updated = 0;

    for (const review of reviews) {
      const result = await query(
        `
          INSERT INTO reviews (
            source, source_review_id, reviewer_name, reviewer_avatar_url, rating, review_text, reviewed_at, is_visible, raw_payload_json, last_synced_at
          )
          VALUES (
            'google', :sourceReviewId, :reviewerName, :reviewerAvatarUrl, :rating, :reviewText, :reviewedAt, 1, :payload, NOW()
          )
          ON DUPLICATE KEY UPDATE
            reviewer_name = VALUES(reviewer_name),
            reviewer_avatar_url = VALUES(reviewer_avatar_url),
            rating = VALUES(rating),
            review_text = VALUES(review_text),
            reviewed_at = VALUES(reviewed_at),
            raw_payload_json = VALUES(raw_payload_json),
            last_synced_at = NOW()
        `,
        {
          sourceReviewId: review.source_review_id || review.reviewId || crypto.randomUUID(),
          reviewerName: review.reviewer_name || review.reviewer?.displayName || "Google Reviewer",
          reviewerAvatarUrl: review.reviewer_avatar_url || review.reviewer?.profilePhotoUrl || null,
          rating: review.rating || 5,
          reviewText: review.review_text || review.comment || "",
          reviewedAt: review.reviewed_at || review.createTime || new Date(),
          payload: JSON.stringify(review)
        }
      );

      if (result.insertId) {
        inserted += 1;
      } else {
        updated += 1;
      }
    }

    await query(
      `
        INSERT INTO review_sync_logs (
          source, status, started_at, finished_at, reviews_fetched_count, reviews_inserted_count, reviews_updated_count
        )
        VALUES ('google', 'success', :startedAt, NOW(), :fetchedCount, :insertedCount, :updatedCount)
      `,
      {
        startedAt,
        fetchedCount: reviews.length,
        insertedCount: inserted,
        updatedCount: updated
      }
    );
  } catch (error) {
    await query(
      `
        INSERT INTO review_sync_logs (
          source, status, started_at, finished_at, error_message
        )
        VALUES ('google', 'failed', :startedAt, NOW(), :errorMessage)
      `,
      {
        startedAt,
        errorMessage: error.message
      }
    );
    throw error;
  }
}
