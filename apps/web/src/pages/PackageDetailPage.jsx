import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatCurrency } from "@nbgstravel/shared";
import { getPackage, getPackages } from "../api.js";
import { fallbackPackages } from "../data/fallback.js";
import { PackageBookingModal } from "../components/forms/PackageBookingModal.jsx";
import { getPackageVisual, liveMedia } from "../siteContent.js";
import { formatLocationHierarchy, getPrimaryLocationLabel } from "../utils/location.js";

const fallbackTripPolicy = [
  "All prices are indicative and correct at time of loading onto the NBGS Travel website and are subject to change due to currency fluctuations, rate increases, airfare increases and availability.",
  "A non-refundable deposit secures your booking.",
  "Confirmation is subject to payment and payment must be cleared in full before arrival.",
  "Instalment plans can be structured by NBGS Travel or tailored by arrangement."
];

const fallbackTerms = [
  "Cancellations between 90 days and 7 days prior to arrival may incur 50% of the total cost.",
  "Cancellations between 7 days and 48 hours prior to arrival may incur 75% of the total cost.",
  "Cancellations less than 48 hours prior to arrival may incur the full total cost.",
  "No-shows may be charged at full cost."
];

function getPricingModelLabel(pricingModel) {
  const labels = {
    per_person_sharing: "Per person sharing",
    per_couple: "Per couple",
    single_supplement: "Single supplement",
    child_rate: "Child rate",
    custom: "Custom quote"
  };

  return labels[pricingModel] || "Custom quote";
}

function getTravelDateLabel(pkg) {
  if (pkg?.adminMeta?.travelDateLabel) {
    return pkg.adminMeta.travelDateLabel;
  }

  if (!pkg?.has_fixed_travel_dates) {
    return "Own travel date";
  }

  if (pkg.fixed_travel_start_date && pkg.fixed_travel_end_date) {
    const start = new Date(pkg.fixed_travel_start_date);
    const end = new Date(pkg.fixed_travel_end_date);
    const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();

    if (sameMonth) {
      return `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString("en-ZA", {
        month: "short",
        year: "numeric"
      })}`;
    }

    return `${start.toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short"
    })} - ${end.toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })}`;
  }

  return "Specific travel date";
}

function getCategoryLabel(category) {
  const labels = {
    group_trip: "Group trip",
    package: "Package"
  };

  return labels[category] || category?.replace(/_/g, " ") || "Package";
}

function normalizeMediaUrl(mediaItem) {
  const value = mediaItem?.file_url || mediaItem?.file_path;
  if (!value) return null;
  return value;
}

function splitTextList(value) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function PackageDetailPage() {
  const { slug } = useParams();
  const [pkg, setPkg] = useState(fallbackPackages.find((item) => item.slug === slug) || fallbackPackages[0]);
  const [catalog, setCatalog] = useState(fallbackPackages);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getPackage(slug)
      .then((data) => setPkg(data.package))
      .catch(() => {
        const fallback = fallbackPackages.find((item) => item.slug === slug);
        if (fallback) {
          setPkg(fallback);
        }
      });
  }, [slug]);

  useEffect(() => {
    getPackages()
      .then((data) => setCatalog(data.packages))
      .catch(() => setCatalog(fallbackPackages));
  }, []);

  const inclusions = useMemo(
    () =>
      pkg?.inclusions?.length
        ? pkg.inclusions.map((item) => item.item_text)
        : ["Accommodation", "Return transfers where specified", "Selected travel support", "Meal plan where specified"],
    [pkg]
  );

  const exclusions = useMemo(
    () =>
      pkg?.exclusions?.length
        ? pkg.exclusions.map((item) => item.item_text)
        : ["Travel insurance", "Personal items", "Meals and drinks not mentioned", "Activities not mentioned"],
    [pkg]
  );

  const galleryImages = useMemo(() => {
    const mediaItems =
      pkg?.media
        ?.map((item) => normalizeMediaUrl(item))
        .filter(Boolean)
        .slice(0, 6) || [];

    if (mediaItems.length) {
      return mediaItems;
    }

    const adminGallery = Array.isArray(pkg?.adminMeta?.gallery) ? pkg.adminMeta.gallery.filter(Boolean).slice(0, 6) : [];

    if (adminGallery.length) {
      return adminGallery;
    }

    return liveMedia.previousTrips.slice(0, 6);
  }, [pkg]);

  const tripStory = pkg?.adminMeta?.describeTrip || pkg?.full_description || pkg?.short_description || "Curated NBGS travel experience.";
  const summaryCopy = pkg?.adminMeta?.bio || pkg?.short_description || pkg?.full_description || "Curated NBGS travel experience.";
  const tripPolicyItems = useMemo(() => {
    const items = splitTextList(pkg?.adminMeta?.tripPolicy);
    return items.length ? items : fallbackTripPolicy;
  }, [pkg]);

  const similarTrips = useMemo(() => {
    const others = catalog.filter((item) => item.slug !== pkg?.slug);

    const ranked = others
      .map((item) => ({
        item,
        score:
          (item.continent && item.continent === pkg?.continent ? 2 : 0) +
          (item.package_category && item.package_category === pkg?.package_category ? 2 : 0) +
          (item.trip_type && item.trip_type === pkg?.trip_type ? 1 : 0)
      }))
      .sort((a, b) => b.score - a.score);

    const prioritized = ranked.filter((entry) => entry.score > 0).map((entry) => entry.item);
    const fallback = others.filter((item) => !prioritized.some((entry) => entry.slug === item.slug));

    return [...prioritized, ...fallback].slice(0, 3);
  }, [catalog, pkg]);

  const heroImage = pkg?.slug === "visit-zanzibar-2026" ? liveMedia.zanzibarHero : getPackageVisual(pkg);
  const primaryLocationLabel = getPrimaryLocationLabel(pkg);

  return (
    <>
      <section className="package-detail-hero-section">
        <div className="container package-detail-hero-grid">
          <div className="package-detail-visual">
            <img src={heroImage} alt={pkg.title} />
          </div>

          <div className="package-detail-summary">
            <span className="package-meta">{getCategoryLabel(pkg.package_category)}</span>
            <h1>{pkg.title}</h1>
            <p className="package-detail-summary-copy">{summaryCopy}</p>

            <div className="package-detail-stat-grid">
              <div className="package-detail-stat-card">
                <span>Location</span>
                <strong>{formatLocationHierarchy(pkg)}</strong>
              </div>
              <div className="package-detail-stat-card">
                <span>Travel Date</span>
                <strong>{getTravelDateLabel(pkg)}</strong>
              </div>
              <div className="package-detail-stat-card">
                <span>Package Type</span>
                <strong>{getPricingModelLabel(pkg.pricing_model)}</strong>
              </div>
              <div className="package-detail-stat-card">
                <span>Duration</span>
                <strong>{pkg.duration_label || "Trip details available"}</strong>
              </div>
            </div>

            <div className="package-detail-price-row">
              <div className="package-detail-price-card">
                <span>From</span>
                <strong>{formatCurrency(pkg.base_price, pkg.currency_code)}</strong>
                <small>{getPricingModelLabel(pkg.pricing_model)}</small>
              </div>

              {pkg.deposit_amount ? (
                <div className="package-detail-price-card package-detail-price-card-muted">
                  <span>Deposit</span>
                  <strong>{formatCurrency(pkg.deposit_amount, pkg.currency_code)}</strong>
                  <small>Entered by admin</small>
                </div>
              ) : null}
            </div>

            <div className="package-detail-action-row">
              <button className="accent-button" onClick={() => setOpen(true)}>
                Book Now
              </button>
              <Link to="/packages" className="secondary-button">
                Back to Packages
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="package-detail-section">
        <div className="container package-detail-body">
          <div className="package-detail-main">
            <article className="package-story-card">
              <span className="package-meta">About This Trip</span>
              <h2>{primaryLocationLabel === "Location" ? pkg.title : `${primaryLocationLabel} travel experience`}</h2>
              <p>{tripStory}</p>
            </article>

            <div className="inclusion-exclusion-grid package-detail-panels">
              <article className="package-detail-panel">
                <h3>Included in your package</h3>
                <ul className="package-bullets positive">
                  {inclusions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className="package-detail-panel">
                <h3>Excluded in your package</h3>
                <ul className="package-bullets negative">
                  {exclusions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
          </div>

          <aside className="package-detail-side-stack">
            <article className="package-side-card">
              <h3>Trip Policy</h3>
              <ul className="text-bullets">
                {tripPolicyItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="package-side-card">
              <h3>Terms &amp; Conditions</h3>
              <ul className="text-bullets">
                {fallbackTerms.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </aside>
        </div>
      </section>

      <section className="package-gallery-section">
        <div className="container">
          <div className="package-section-heading">
            <span className="package-meta">Previous Trips</span>
            <h2>Travel moments that reflect the NBGS experience</h2>
          </div>

          <div className="package-gallery-grid">
            {galleryImages.map((image, index) => (
              <div key={`${image}-${index}`} className={`package-gallery-card package-gallery-card-${index + 1}`}>
                <img src={image} alt={`${pkg.title} trip gallery ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {similarTrips.length ? (
        <section className="similar-trips-section">
          <div className="container">
            <div className="package-section-heading">
              <span className="package-meta">Similar Trips</span>
              <h2>You may also like</h2>
            </div>

            <div className="similar-trips-list">
              {similarTrips.map((trip) => (
                <Link key={trip.id} to={`/packages/${trip.slug}`} className="similar-trip-card">
                  <div className="similar-trip-image">
                    <img src={getPackageVisual(trip)} alt={trip.title} />
                  </div>

                  <div className="similar-trip-copy">
                    <span className="listing-type-chip">{getCategoryLabel(trip.package_category)}</span>
                    <h3>{trip.title}</h3>
                    <p>{formatLocationHierarchy(trip)}</p>
                    <div className="similar-trip-meta">
                      <strong>{formatCurrency(trip.base_price, trip.currency_code)}</strong>
                      <span>{getPricingModelLabel(trip.pricing_model)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <PackageBookingModal open={open} onClose={() => setOpen(false)} pkg={pkg} />
    </>
  );
}
