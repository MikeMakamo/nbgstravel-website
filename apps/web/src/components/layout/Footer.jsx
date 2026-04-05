import React from "react";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src="/assets/images/main logo.png" alt="NBGS Travel" className="footer-logo" />
          <p>Personalized travel and tailored experiences.</p>
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
      <div className="footer-copy">© 2025 NBGS TRAVELS</div>
    </footer>
  );
}
