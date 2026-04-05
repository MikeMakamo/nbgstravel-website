import React from "react";
import { Link } from "react-router-dom";
import { liveMedia, servicesPageContent } from "../siteContent.js";

export function ServicesPage() {
  return (
    <>
      <section className="page-hero-banner image-hero">
        <img src={liveMedia.homeHero} alt="NBGS travel services" />
        <div className="image-hero-overlay">
          <h1>{servicesPageContent.heroTitle}</h1>
        </div>
      </section>

      <section className="services-page-section">
        <div className="container">
          <div className="services-intro-grid">
            <div className="services-intro-copy">
              <span className="package-meta">Learn More About Our Services</span>
              <h2>{servicesPageContent.introTitle}</h2>
            </div>

            <div className="services-intro-card">
              <p>{servicesPageContent.introCopy}</p>

              <div className="intro-cta-row services-intro-actions">
                {servicesPageContent.introActions.map((action) => (
                  <Link
                    key={action.label}
                    to={action.href}
                    className={action.variant === "accent" ? "accent-button" : "secondary-button"}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="services-detail-grid">
            {servicesPageContent.services.map((service, index) => (
              <article key={service.title} className="service-detail-card">
                <span className="service-detail-index">{String(index + 1).padStart(2, "0")}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>

          <div className="services-cta-strip">
            <div>
              <span className="package-meta">Need Help Planning?</span>
              <h3>Tell us what kind of trip support you need and we will guide the next step.</h3>
            </div>
            <div className="services-cta-actions">
              <Link to="/packages" className="secondary-button">
                View Packages
              </Link>
              <Link to="/contact" className="accent-button">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
