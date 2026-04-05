import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HomeInquiryModal } from "../components/forms/HomeInquiryModal.jsx";
import { categoryCards, faqs, homeServices, liveMedia, manualReviews } from "../siteContent.js";

export function HomePage() {
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [showAllTrips, setShowAllTrips] = useState(false);
  const [reviewStartIndex, setReviewStartIndex] = useState(0);
  const [reviewsPerView, setReviewsPerView] = useState(3);
  const [expandedReviewId, setExpandedReviewId] = useState(null);

  useEffect(() => {
    function updateReviewViewport() {
      if (window.innerWidth <= 720) {
        setReviewsPerView(1);
        return;
      }

      if (window.innerWidth <= 1100) {
        setReviewsPerView(2);
        return;
      }

      setReviewsPerView(3);
    }

    updateReviewViewport();
    window.addEventListener("resize", updateReviewViewport);
    return () => window.removeEventListener("resize", updateReviewViewport);
  }, []);

  const displayedTrips = showAllTrips ? liveMedia.previousTrips : liveMedia.previousTrips.slice(0, 4);
  const maxReviewIndex = Math.max(manualReviews.length - reviewsPerView, 0);

  useEffect(() => {
    setReviewStartIndex((current) => Math.min(current, maxReviewIndex));
  }, [maxReviewIndex]);

  const visibleReviews = useMemo(
    () => manualReviews.slice(reviewStartIndex, reviewStartIndex + reviewsPerView),
    [reviewStartIndex, reviewsPerView]
  );

  return (
    <>
      <HomeInquiryModal open={isInquiryModalOpen} onClose={() => setIsInquiryModalOpen(false)} />

      <section className="hero-banner">
        <div className="hero-copy centered-hero-copy">
          <h1>Explore and see the world</h1>
          <p>make your life a little more colourful</p>
        </div>
        <div className="hero-image-strip">
          <img src={liveMedia.homeHero} alt="Explore and see the world" />
        </div>
      </section>

      <section className="intro-section">
        <div className="container intro-grid">
          <div className="intro-copy">
            <h2 className="intro-title-italic">Bespoke Traveling With NBGS TRAVEL</h2>
            <p>
              NBGS Travel is a South African travel agency that specializes in creating personalized vacations and
              activities to match your budget and preferences.
            </p>
            <div className="intro-cta-row">
              <button type="button" className="accent-button" onClick={() => setIsInquiryModalOpen(true)}>
                Plan My Trip
              </button>
              <Link to="/packages" className="secondary-button">
                View Packages
              </Link>
            </div>
            <div className="home-category-links">
              {categoryCards.map((card) => (
                <Link key={card.title} to={card.href} className="trip-mini-card">
                  <span>{card.kicker}</span>
                  <strong>{card.title}</strong>
                  <small>{card.subtitle}</small>
                </Link>
              ))}
            </div>
          </div>
          <div className="intro-collage">
            <img src={liveMedia.introLeft} alt="Travel planning" className="collage-large" />
            <img src={liveMedia.introRight} alt="Travel experiences" className="collage-small" />
            <img src="/assets/images/profile picture 1.jpg" alt="NBGS trip moments" className="collage-small" />
          </div>
        </div>
      </section>

      <section className="service-section">
        <div className="container">
          <h2 className="section-title service-simple-title">Get to know our travel services</h2>
          <div className="service-grid">
            {homeServices.map((service) => (
              <article key={service.title} className="service-card">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
          <div className="service-link-row">
            <Link to="/visa" className="service-section-button">
              Visa Services
            </Link>
          </div>
        </div>
      </section>

      <section className="continents-section">
        <div className="continents-section-header">
          <h2 className="section-title">Planning Your Journey Starts Here</h2>
        </div>
        <div className="continents-grid">
          {liveMedia.continents.map((continent, index) => (
            <Link key={continent.title} to="/packages" className={`continent-card continent-card-${index + 1}`}>
              <img src={continent.image} alt={continent.title} />
              <div className="continent-overlay">
                <strong>{continent.title}</strong>
                <span>{continent.subtitle}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="faq-section">
        <div className="container narrow-section">
          <h2 className="section-title">Common Questions:</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <details key={faq.question} open={index === 0} className="faq-item">
                <summary>
                  <span>{faq.question}</span>
                </summary>
                {faq.answer ? <p>{faq.answer}</p> : null}
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="reviews-section">
        <div className="container reviews-carousel-shell">
          <h2 className="section-title">What our clients have to say</h2>

          <div className="review-carousel">
            <button
              type="button"
              className="review-carousel-arrow review-carousel-arrow-left"
              onClick={() => setReviewStartIndex((current) => Math.max(current - 1, 0))}
              disabled={reviewStartIndex === 0}
              aria-label="Previous reviews"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m14 6-6 6 6 6" />
              </svg>
            </button>

            <div className="review-list" style={{ "--reviews-per-view": reviewsPerView }}>
              {visibleReviews.map((review) => {
                const isExpanded = expandedReviewId === review.id;

                return (
                  <article key={review.id} className="review-card review-carousel-card">
                    <div className="review-avatar-wrap">
                      <div className="review-avatar" style={{ backgroundColor: review.avatar_tone }}>
                        {review.avatar_letter}
                      </div>
                      <span className="review-google-badge" aria-hidden="true">
                        <span className="review-google-g">G</span>
                      </span>
                    </div>

                    <strong>{review.reviewer_name}</strong>
                    <span className="review-age">{review.review_age}</span>

                    <div className="review-meta-row">
                      <div className="review-stars">
                        {Array.from({ length: review.rating || 5 }, (_, index) => (
                          <span key={index}>★</span>
                        ))}
                      </div>
                      <span className="review-verified" aria-label="Verified review">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 2 9.9 4.1 7 3.6 6.5 6.5 3.6 7l.5 2.9L2 12l2.1 2.1-.5 2.9 2.9.5.5 2.9 2.9-.5L12 22l2.1-2.1 2.9.5.5-2.9 2.9-.5-.5-2.9L22 12l-2.1-2.1.5-2.9-2.9-.5-.5-2.9-2.9.5L12 2Zm-1 13-3-3 1.4-1.4 1.6 1.6 4-4L16.4 9 11 15Z" />
                        </svg>
                      </span>
                    </div>

                    <p className={`review-text${isExpanded ? " is-expanded" : ""}`}>{review.review_text}</p>

                    <button
                      type="button"
                      className="review-read-more"
                      onClick={() => setExpandedReviewId(isExpanded ? null : review.id)}
                    >
                      {isExpanded ? "Read less" : "Read more"}
                    </button>
                  </article>
                );
              })}
            </div>

            <button
              type="button"
              className="review-carousel-arrow review-carousel-arrow-right"
              onClick={() => setReviewStartIndex((current) => Math.min(current + 1, maxReviewIndex))}
              disabled={reviewStartIndex >= maxReviewIndex}
              aria-label="Next reviews"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m10 6 6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <section className="previous-trips-section">
        <div className="container">
          <h2 className="section-title">Previous Trips</h2>
          <div className="previous-trips-grid">
            {displayedTrips.map((image, index) => (
              <div key={`${image}-${index}`} className={`trip-photo trip-photo-${(index % 5) + 1}${index >= 4 ? " trip-photo-reveal" : ""}`}>
                <img src={image} alt={`NBGS previous trip ${index + 1}`} />
              </div>
            ))}
          </div>
          {liveMedia.previousTrips.length > 4 ? (
            <div className="gallery-action-row">
              <button
                type="button"
                className={`gallery-more-button${showAllTrips ? " is-open" : ""}`}
                onClick={() => setShowAllTrips((current) => !current)}
              >
                {showAllTrips ? "Show Less" : "More"}
                <span className="gallery-more-icon" aria-hidden="true">
                  +
                </span>
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
