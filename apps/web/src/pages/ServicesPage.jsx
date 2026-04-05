import React from "react";
import { homeServices, liveMedia } from "../siteContent.js";

export function ServicesPage() {
  return (
    <>
      <section className="page-hero-banner image-hero">
        <img src={liveMedia.homeHero} alt="NBGS services" />
        <div className="image-hero-overlay">
          <h1>Get to know our travel services</h1>
        </div>
      </section>
      <section className="service-section">
        <div className="container">
          <div className="service-grid">
            {homeServices.map((service) => (
              <article key={service.title} className="service-card">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
