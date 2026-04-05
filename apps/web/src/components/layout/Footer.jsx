import React from "react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
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
      <div className="footer-copy">
        <span>&copy; {currentYear} NBGS TRAVEL</span>
        <span className="footer-copy-separator">|</span>
        <span>Powered by MACMOTECHZA</span>
      </div>
    </footer>
  );
}
