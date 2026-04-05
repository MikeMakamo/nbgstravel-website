import React from "react";
import { Link } from "react-router-dom";
import { aboutContent, liveMedia } from "../siteContent.js";

export function AboutPage() {
  return (
    <>
      <section className="page-hero-banner image-hero">
        <img src={liveMedia.introLeft} alt="NBGS Travel experiences" />
        <div className="image-hero-overlay">
          <h1>{aboutContent.heroTitle}</h1>
        </div>
      </section>

      <section className="about-page-section">
        <div className="container about-grid">
          <div className="about-copy">
            <span className="package-meta">{aboutContent.sectionKicker}</span>
            <h2>{aboutContent.heading}</h2>

            <div className="about-copy-stack">
              {aboutContent.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <p className="about-closing-line">{aboutContent.closingLine}</p>

            <div className="intro-cta-row about-cta-row">
              <Link to="/packages" className="accent-button">
                View Packages
              </Link>
              <Link to="/contact" className="secondary-button">
                Contact Us
              </Link>
            </div>
          </div>

          <aside className="about-side-panel">
            <img src={liveMedia.introRight} alt="NBGS Travel planning" className="about-side-image" />

            <div className="about-side-card">
              <h3>{aboutContent.highlightTitle}</h3>
              <ul className="about-highlights">
                {aboutContent.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
