import React, { useState } from "react";
import { subscribeNewsletter } from "../../api.js";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);

  async function handleNewsletterSubmit(event) {
    event.preventDefault();
    setIsSubmittingNewsletter(true);

    try {
      const data = await subscribeNewsletter({
        email: newsletterEmail,
        listSlug: "main-newsletter"
      });
      setNewsletterEmail("");
      setNewsletterMessage(data.message || "Thanks for subscribing.");
    } catch (error) {
      setNewsletterMessage(error.message || "Unable to save your email right now.");
    } finally {
      setIsSubmittingNewsletter(false);
    }
  }

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-newsletter-band">
          <div className="footer-newsletter-copy">
            <span className="footer-newsletter-kicker">Newsletter</span>
            <h3>Get NBGS travel updates first</h3>
            <p>Join our mailing list for travel deals, new group trip drops, and visa update notices.</p>
          </div>
          <form className="footer-newsletter-form" onSubmit={handleNewsletterSubmit}>
            <label className="footer-newsletter-field" htmlFor="footer-newsletter-email">
              <span className="sr-only">Email address</span>
              <input
                id="footer-newsletter-email"
                type="email"
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                placeholder="Enter your email address"
                required
              />
            </label>
            <button type="submit" className="footer-newsletter-button" disabled={isSubmittingNewsletter}>
              {isSubmittingNewsletter ? "Joining..." : "Join newsletter"}
            </button>
          </form>
          {newsletterMessage ? <p className="footer-newsletter-message">{newsletterMessage}</p> : null}
        </div>

        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/assets/images/main logo.png" alt="NBGS Travel" className="footer-logo" />
            <p>Personalized travel and tailored experiences.</p>
            <div className="footer-associations">
              <span className="footer-associations-label">Associated With</span>
              <div className="footer-associations-logos">
                <img
                  src="/assets/images/iata logo.png"
                  alt="IATA"
                  className="footer-association-logo footer-association-logo-iata"
                />
                <img
                  src="/assets/images/asata.png"
                  alt="ASATA"
                  className="footer-association-logo footer-association-logo-asata"
                />
              </div>
            </div>
          </div>
          <div>
            <h4>Services</h4>
            <ul>
              <li>Vacation Packages</li>
              <li>Travel Transportation</li>
              <li>Visa Services</li>
            </ul>
          </div>
          <div>
            <h4>Useful Links</h4>
            <ul>
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
              <li>Disclosures</li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li>8 Incubation Drive Riverside View, Fourways, Midrand, 2021</li>
              <li>info@nbgstravel.co.za</li>
              <li>+27645033461 | +27798377302</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-copy">
        <span>&copy; {currentYear} NBGS TRAVEL</span>
        <span className="footer-copy-separator">|</span>
        <span>Powered by MACMOTECHZA</span>
      </div>
    </footer>
  );
}
