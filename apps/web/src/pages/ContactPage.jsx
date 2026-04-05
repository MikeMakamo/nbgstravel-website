import React, { useState } from "react";
import { submitInquiry } from "../api.js";

export function ContactPage() {
  const [form, setForm] = useState({ fullName: "", phoneNumber: "", email: "", message: "" });
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await submitInquiry({
        inquiryType: "contact",
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        email: form.email,
        message: form.message,
        sourcePageUrl: window.location.href
      });
      setMessage("Thanks. Your inquiry has been received.");
      setForm({ fullName: "", phoneNumber: "", email: "", message: "" });
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="section page-hero">
      <div className="container two-column-section">
        <div>
          <span className="eyebrow">Contact</span>
          <h1>Tell us where you want to go, and we’ll help shape the journey.</h1>
        </div>
        <form className="inquiry-panel" onSubmit={handleSubmit}>
          <label>
            Name and surname
            <input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required />
          </label>
          <label>
            Phone number
            <input value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} required />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
          <label>
            Message
            <textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required />
          </label>
          <button type="submit" className="primary-button">
            Send message
          </button>
          {message ? <p className="form-message">{message}</p> : null}
        </form>
      </div>
    </section>
  );
}
