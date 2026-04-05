import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { formatCurrency } from "@nbgstravel/shared";
import { getPackage } from "../api.js";
import { fallbackPackages } from "../data/fallback.js";
import { PackageBookingModal } from "../components/forms/PackageBookingModal.jsx";
import { getPackageVisual, liveMedia } from "../siteContent.js";

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

export function PackageDetailPage() {
  const { slug } = useParams();
  const [pkg, setPkg] = useState(fallbackPackages.find((item) => item.slug === slug) || fallbackPackages[0]);
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

  const inclusions = useMemo(
    () =>
      pkg?.inclusions?.length
        ? pkg.inclusions.map((item) => item.item_text)
        : [
            "Accommodation",
            "Return transfers where specified",
            "Selected travel support",
            "Meal plan where specified"
          ],
    [pkg]
  );

  const exclusions = useMemo(
    () =>
      pkg?.exclusions?.length
        ? pkg.exclusions.map((item) => item.item_text)
        : ["Travel insurance", "Personal items", "Meals and drinks not mentioned", "Activities not mentioned"],
    [pkg]
  );

  return (
    <>
      <section className="package-hero-banner">
        <img src={pkg.slug === "visit-zanzibar-2026" ? liveMedia.zanzibarHero : getPackageVisual(pkg)} alt={pkg.title} />
        <div className="package-hero-overlay">
          <div className="container">
            <h1>{pkg.title}</h1>
            <p>
              {pkg.has_fixed_travel_dates && pkg.fixed_travel_start_date && pkg.fixed_travel_end_date
                ? `Travel between ${pkg.fixed_travel_start_date} - ${pkg.fixed_travel_end_date}`
                : pkg.short_description}
            </p>
          </div>
        </div>
      </section>

      <section className="package-detail-section">
        <div className="container package-info-grid">
          <div className="package-summary-card">
            <h2>{pkg.title}</h2>
            <div className="summary-lines">
              <p>
                <strong>Date:</strong> {pkg.has_fixed_travel_dates ? "Own Dates" : "Flexible Dates"}
              </p>
              <p>
                <strong>Fee:</strong> {formatCurrency(pkg.base_price, pkg.currency_code)}
              </p>
              <p>
                <strong>{pkg.quoted_from_label || "Quote"}:</strong> {pkg.pricing_model === "per_couple" ? "Per Couple" : "Per Person"}
              </p>
              {pkg.has_fixed_travel_dates ? (
                <p>
                  <strong>Travel Dates:</strong> {pkg.fixed_travel_start_date} - {pkg.fixed_travel_end_date}
                </p>
              ) : null}
              {pkg.deposit_amount ? (
                <p>
                  <strong>Non-Refundable Deposit Fee:</strong> {formatCurrency(pkg.deposit_amount, pkg.currency_code)}
                </p>
              ) : null}
            </div>
            <button className="accent-button" onClick={() => setOpen(true)}>
              BOOK NOW
            </button>
          </div>

          <div className="inclusion-exclusion-grid">
            <article>
              <h3>Included in your package</h3>
              <ul className="package-bullets positive">
                {inclusions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article>
              <h3>excluded in your package</h3>
              <ul className="package-bullets negative">
                {exclusions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>

        <div className="container long-copy-layout">
          <div>
            <h2>Trip Policy</h2>
            <ul className="text-bullets">
              {fallbackTripPolicy.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2>TERMS AND CONDITIONS</h2>
            <ul className="text-bullets">
              {fallbackTerms.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <PackageBookingModal open={open} onClose={() => setOpen(false)} pkg={pkg} />
    </>
  );
}
