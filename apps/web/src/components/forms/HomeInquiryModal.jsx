import React, { useEffect, useRef, useState } from "react";
import { submitAbandonedLead, submitInquiry } from "../../api.js";

const storageKey = "nbgs-home-inquiry";

function loadDraft() {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw
      ? {
          fullName: "",
          phoneNumber: "",
          email: "",
          message: "",
          ...JSON.parse(raw)
        }
      : { fullName: "", phoneNumber: "", email: "", message: "" };
  } catch {
    return { fullName: "", phoneNumber: "", email: "", message: "" };
  }
}

export function HomeInquiryModal({ open, onClose }) {
  const [form, setForm] = useState(() => loadDraft());
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    submittedRef.current = false;
    setForm(loadDraft());
    setMessage("");
  }, [open]);

  useEffect(() => {
    if (open) {
      localStorage.setItem(storageKey, JSON.stringify(form));
    }
  }, [form, open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleUnload = () => {
      if (!submittedRef.current && form.phoneNumber) {
        navigator.sendBeacon?.(
          `${process.env.VITE_API_URL || "http://localhost:4000/api"}/abandoned-leads`,
          new Blob(
            [
              JSON.stringify({
                leadType: "homepage_inquiry",
                fullName: form.fullName,
                phoneNumber: form.phoneNumber,
                email: form.email || null,
                partialForm: form,
                sourcePageUrl: window.location.href,
                abandonReason: "window_unload"
              })
            ],
            { type: "application/json" }
          )
        );
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [form, open]);

  if (!open) {
    return null;
  }

  async function handleClose() {
    if (!submittedRef.current && form.phoneNumber) {
      try {
        await submitAbandonedLead({
          leadType: "homepage_inquiry",
          fullName: form.fullName,
          phoneNumber: form.phoneNumber,
          email: form.email || null,
          partialForm: form,
          sourcePageUrl: window.location.href,
          abandonReason: "modal_closed"
        });
      } catch (error) {
        console.warn(error);
      }
    }

    onClose();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      await submitInquiry({
        inquiryType: "homepage",
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        email: form.email || null,
        message: form.message || null,
        sourcePageUrl: window.location.href
      });
      submittedRef.current = true;
      localStorage.removeItem(storageKey);
      setMessage("Your inquiry has been received. An NBGS Travel consultant will contact you shortly.");
      setForm({ fullName: "", phoneNumber: "", email: "", message: "" });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card modal-card-wide">
        <div className="modal-topbar">
          <span className="modal-kicker">NBGS TRAVEL</span>
          <button type="button" className="modal-close" onClick={handleClose} aria-label="Close dialog">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="modal-split">
          <section className="modal-brand-panel">
            <p className="modal-panel-eyebrow">PERSONALIZED TRAVEL PLANNING</p>
            <h3 className="modal-title">Plan Your Trip</h3>
            <p className="modal-copy">
              Share a few details and an NBGS Travel consultant will contact you to shape a trip around your dates,
              budget, and destination goals.
            </p>

            <div className="modal-feature-stack">
              <div className="modal-feature-card">
                <strong>Tailored recommendations</strong>
                <span>Packages and destinations matched to your preferences.</span>
              </div>
              <div className="modal-feature-card">
                <strong>Direct agent follow-up</strong>
                <span>No cold automation. A real consultant picks up your request.</span>
              </div>
            </div>

            <div className="modal-note-card">
              <span>No upfront payment for package inquiries.</span>
              <strong>We contact you first.</strong>
            </div>
          </section>

          <section className="modal-form-panel">
            <h4 className="modal-form-title">Start Your Inquiry</h4>
            <p className="modal-form-copy">Enter your details below and we’ll follow up with the next steps.</p>

            <form className="stack-form modal-form" onSubmit={handleSubmit}>
              <label className="modal-form-field">
                <span className="field-label">Name and surname</span>
                <input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required />
              </label>
              <label className="modal-form-field">
                <span className="field-label">Phone number</span>
                <input value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} required />
              </label>
              <label className="modal-form-field">
                <span className="field-label">Email</span>
                <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </label>
              <label className="modal-form-field modal-form-field-full">
                <span className="field-label">Tell us about your trip</span>
                <textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
              </label>
              <button type="submit" className="primary-button modal-submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Send Inquiry"}
              </button>
              {message ? <p className="form-message">{message}</p> : null}
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
