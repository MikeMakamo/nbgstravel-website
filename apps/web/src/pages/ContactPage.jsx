import React, { useState } from "react";
import { submitInquiry } from "../api.js";
import { contactPageContent } from "../siteContent.js";

const socialIcons = {
  Facebook: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.5 22v-8.1h2.7l.4-3.2h-3.1V8.6c0-.9.2-1.5 1.5-1.5H16.7V4.2c-.3 0-1.2-.2-2.4-.2-2.4 0-4.1 1.5-4.1 4.2v2.4H7.5v3.2h2.7V22h3.3Z" />
    </svg>
  ),
  Instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.6 3h8.8A4.6 4.6 0 0 1 21 7.6v8.8a4.6 4.6 0 0 1-4.6 4.6H7.6A4.6 4.6 0 0 1 3 16.4V7.6A4.6 4.6 0 0 1 7.6 3Zm0 1.9A2.7 2.7 0 0 0 4.9 7.6v8.8a2.7 2.7 0 0 0 2.7 2.7h8.8a2.7 2.7 0 0 0 2.7-2.7V7.6a2.7 2.7 0 0 0-2.7-2.7H7.6Zm9.4 1.4a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.9a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Z" />
    </svg>
  ),
  WhatsApp: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3a8.8 8.8 0 0 0-7.6 13.4L3 21l4.7-1.2A8.8 8.8 0 1 0 12 3Zm0 15.8c-1.3 0-2.5-.3-3.6-1l-.3-.2-2.8.7.8-2.7-.2-.3a6.9 6.9 0 1 1 6.1 3.5Zm3.8-5.2c-.2-.1-1.2-.6-1.4-.7-.2-.1-.3-.1-.5.1l-.7.8c-.1.1-.3.2-.5.1a5.8 5.8 0 0 1-2.9-2.6c-.1-.2 0-.3.1-.5l.5-.6.1-.3-.1-.3-.6-1.4c-.1-.3-.3-.3-.5-.3h-.4c-.1 0-.3.1-.4.2-.4.4-.7 1-.7 1.6 0 .6.4 1.2.5 1.4.1.2 1.1 1.8 2.8 2.6 1.6.8 1.9.7 2.3.7.4 0 1.2-.5 1.4-.9.2-.4.2-.8.1-.9-.1-.1-.3-.1-.5-.2Z" />
    </svg>
  )
};

function ContactInfoIcon({ type }) {
  if (type === "phone") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.6 10.8c1.7 3.3 3.4 5 6.7 6.7l2.2-2.2c.3-.3.7-.4 1-.3 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.3 0 .7-.3 1l-2.1 2.3Z" />
      </svg>
    );
  }

  if (type === "email") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5h16c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2Zm0 2v.2l8 5.3 8-5.3V7H4Zm16 10V9.6l-7.4 4.9a1 1 0 0 1-1.1 0L4 9.6V17h16Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a7 7 0 0 1 7 7c0 4.8-5.4 11.8-6.2 12.8a1 1 0 0 1-1.6 0C10.4 20.8 5 13.8 5 9a7 7 0 0 1 7-7Zm0 9.5A2.5 2.5 0 1 0 12 6.5a2.5 2.5 0 0 0 0 5Z" />
    </svg>
  );
}

export function ContactPage() {
  const [form, setForm] = useState({ fullName: "", phoneNumber: "", email: "", message: "" });
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await submitInquiry({
        inquiryType: "contact",
        fullName: form.fullName,
        phoneNumber: form.phoneNumber || null,
        email: form.email,
        message: form.message || null,
        sourcePageUrl: window.location.href
      });
      setMessage("Thanks. Your message has been received and our team will contact you shortly.");
      setForm({ fullName: "", phoneNumber: "", email: "", message: "" });
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <>
      <section className="contact-page-hero">
        <div className="container contact-page-hero-inner">
          <div className="contact-page-hero-copy">
            <span className="package-meta">{contactPageContent.heroTitle}</span>
            <h1>{contactPageContent.introTitle}</h1>
            <p>{contactPageContent.introCopy}</p>
          </div>
        </div>
      </section>

      <section className="contact-page-section">
        <div className="container">
          

          <div className="contact-layout-grid">
            <div className="contact-map-card">
              <iframe
                src={contactPageContent.mapEmbedUrl}
                title={contactPageContent.address}
                aria-label={contactPageContent.address}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <form className="contact-form-card" onSubmit={handleSubmit}>
              <h3>Submit a Request</h3>

              <label className="contact-form-field">
                <span className="field-label">Name and surname</span>
                <input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required />
              </label>

              <label className="contact-form-field">
                <span className="field-label">Email address</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  required
                />
              </label>

              <label className="contact-form-field">
                <span className="field-label">Phone number</span>
                <input value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} />
              </label>

              <label className="contact-form-field contact-form-field-full">
                <span className="field-label">Message</span>
                <textarea
                  value={form.message}
                  onChange={(event) => setForm({ ...form, message: event.target.value })}
                  maxLength={180}
                  rows={6}
                  placeholder="Enter your message..."
                />
              </label>

              <button type="submit" className="primary-button contact-form-submit">
                Send Message
              </button>
              {message ? <p className="form-message">{message}</p> : null}
            </form>
          </div>

          <div className="contact-info-grid">
            <article className="contact-info-card">
              <div className="contact-info-icon">
                <ContactInfoIcon type="phone" />
              </div>
              <h3>Make a Call</h3>
              <p>{contactPageContent.phoneNumbers.join(" | ")}</p>
            </article>

            <article className="contact-info-card">
              <div className="contact-info-icon">
                <ContactInfoIcon type="email" />
              </div>
              <h3>Send Email</h3>
              <p>
                <a href={`mailto:${contactPageContent.email}`}>{contactPageContent.email}</a>
              </p>
            </article>

            <article className="contact-info-card">
              <div className="contact-info-icon">
                <ContactInfoIcon type="location" />
              </div>
              <h3>Visit Us</h3>
              <p>{contactPageContent.address}</p>
            </article>
          </div>

          <div className="contact-social-row">
            {contactPageContent.socials.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noreferrer" className="contact-social-link">
                <span className="contact-social-icon">{socialIcons[social.label]}</span>
                <span>{social.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
