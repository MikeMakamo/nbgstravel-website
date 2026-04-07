import React from "react";
import { brandAssets, travelGalleryAssets } from "../assets.js";

const highlights = [
  {
    title: "Package control",
    description: "Create and track travel packages, group trips, and the pricing details your team needs."
  },
  {
    title: "Visa operations",
    description: "Receive visa applications, follow payment progress, and keep everything in one place."
  },
  {
    title: "Lead recovery",
    description: "See abandoned forms and fresh inquiries quickly so your agents can follow up faster."
  }
];

export default function LoginScreen({ loginForm, setLoginForm, onSubmit, message, isSubmitting }) {
  const heroImage = travelGalleryAssets[1] || travelGalleryAssets[0];
  const featureImage = travelGalleryAssets[2] || travelGalleryAssets[0];

  return (
    <div className="login-view">
      <section className="login-showcase">
        <div className="login-showcase__backdrop">
          <img src={heroImage} alt="NBGS Travel experience" />
        </div>
        <div className="login-showcase__overlay" />

        <div className="login-showcase__content">
          <div className="login-showcase__brand">
            <div className="login-showcase__logo-shell">
              <img className="login-showcase__logo" src={brandAssets.mainLogo} alt="NBGS Travel" />
            </div>
            <div>
              <p className="eyebrow">Admin Suite</p>
              <h1>Run packages, visas, and customer leads from one control room.</h1>
            </div>
          </div>

          <p className="login-showcase__summary">
            A cleaner space for the NBGS Travel team to manage daily bookings, visa requests, and unfinished forms without digging
            through WordPress screens.
          </p>

          <div className="login-highlight-list">
            {highlights.map((item) => (
              <article key={item.title} className="login-highlight-card">
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </article>
            ))}
          </div>

          <div className="login-showcase__feature">
            <div className="login-showcase__feature-image">
              <img src={featureImage} alt="NBGS curated travel" />
            </div>
            <div className="login-showcase__feature-copy">
              <span className="eyebrow eyebrow--dark">Live travel desk</span>
              <strong>Packages, bookings, and visa workspaces built for day-to-day team use.</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="login-form-shell">
        <form className="panel login-card" onSubmit={onSubmit}>
          <div className="section-heading">
            <span className="eyebrow">Welcome back</span>
            <h2>NBGSTRAVEL Control Room</h2>
            <p>Log in to manage the live travel catalog, visa applications, and lead activity.</p>
          </div>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={loginForm.email}
              onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
              placeholder="admin@nbgstravel.co.za"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={loginForm.password}
              onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
              placeholder="Enter your password"
              required
            />
          </label>

          <button className="button button--primary button--block" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Enter dashboard"}
          </button>

          <p className="helper-copy">Seeded local access uses the super admin account configured for this project.</p>
          {message ? <p className="message-banner message-banner--inline">{message}</p> : null}
        </form>
      </section>
    </div>
  );
}
