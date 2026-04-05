import React, { useEffect, useMemo, useRef, useState } from "react";
import { formatCurrency } from "@nbgstravel/shared";
import { createVisaPayfastIntent, submitAbandonedLead, submitVisaApplication } from "../../api.js";

function loadDraft(storageKey, initialState) {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? { ...initialState, ...JSON.parse(raw) } : initialState;
  } catch {
    return initialState;
  }
}

export function VisaApplicationModal({ open, onClose, visa }) {
  const storageKey = useMemo(() => `nbgs-visa-${visa?.id || "draft"}`, [visa?.id]);
  const [form, setForm] = useState(() =>
    loadDraft(storageKey, {
      fullName: "",
      phoneNumber: "",
      nationality: "",
      numberOfPersons: 1,
      travelDate: "",
      returnDate: ""
    })
  );
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (open) {
      submittedRef.current = false;
      localStorage.setItem(storageKey, JSON.stringify(form));
    }
  }, [form, open, storageKey]);

  if (!open || !visa) {
    return null;
  }

  async function handleClose() {
    if (!submittedRef.current && form.phoneNumber) {
      try {
        await submitAbandonedLead({
          leadType: "visa_application",
          visaOfferingId: visa.id,
          fullName: form.fullName,
          phoneNumber: form.phoneNumber,
          nationality: form.nationality,
          travelDate: form.travelDate || null,
          returnDate: form.returnDate || null,
          numberOfPersons: Number(form.numberOfPersons || 1),
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
      const application = await submitVisaApplication({
        visaOfferingId: visa.id,
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        nationality: form.nationality,
        numberOfPersons: Number(form.numberOfPersons || 1),
        travelDate: form.travelDate,
        returnDate: form.returnDate,
        sourcePageUrl: window.location.href
      });

      const paymentIntent = await createVisaPayfastIntent(application.visaApplicationId);
      submittedRef.current = true;
      localStorage.removeItem(storageKey);
      window.location.href = paymentIntent.redirectUrl;
    } catch (error) {
      setMessage(error.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card modal-card-wide">
        <div className="modal-topbar">
          <span className="modal-kicker">VISA SERVICE</span>
          <button type="button" className="modal-close" onClick={handleClose} aria-label="Close dialog">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="modal-split">
          <section className="modal-brand-panel">
            <p className="modal-panel-eyebrow">SECURE APPLICATION CHECKOUT</p>
            <h3 className="modal-title">Apply for {visa.title}</h3>
            <p className="modal-copy">
              Complete your application details below, then continue through secure PayFast checkout to reserve the
              service.
            </p>

            <div className="quote-card">
              <span>Application fee</span>
              <strong>{formatCurrency(visa.application_fee, visa.currency_code || "ZAR")}</strong>
            </div>

            <div className="modal-feature-stack">
              <div className="modal-feature-card">
                <strong>Visa type</strong>
                <span>{visa.title}</span>
              </div>
              <div className="modal-feature-card">
                <strong>Payment method</strong>
                <span>Secure PayFast checkout after submission.</span>
              </div>
            </div>

            <div className="modal-note-card">
              <span>Your form is saved while you type.</span>
              <strong>We can still follow up if you leave mid-way.</strong>
            </div>
          </section>

          <section className="modal-form-panel">
            <h4 className="modal-form-title">Application Details</h4>
            <p className="modal-form-copy">Fill in the traveler information to continue to payment.</p>
            <div className="modal-mobile-summary">
              <div className="quote-card">
                <span>Application fee</span>
                <strong>{formatCurrency(visa.application_fee, visa.currency_code || "ZAR")}</strong>
              </div>
            </div>

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
                <span className="field-label">Nationality</span>
                <input value={form.nationality} onChange={(event) => setForm({ ...form, nationality: event.target.value })} required />
              </label>
              <label className="modal-form-field">
                <span className="field-label">Number of persons</span>
                <input
                  type="number"
                  min="1"
                  value={form.numberOfPersons}
                  onChange={(event) => setForm({ ...form, numberOfPersons: event.target.value })}
                  required
                />
              </label>
              <label className="modal-form-field">
                <span className="field-label">Travelling date</span>
                <input type="date" value={form.travelDate} onChange={(event) => setForm({ ...form, travelDate: event.target.value })} required />
              </label>
              <label className="modal-form-field">
                <span className="field-label">Returning date</span>
                <input type="date" value={form.returnDate} onChange={(event) => setForm({ ...form, returnDate: event.target.value })} required />
              </label>
              <button type="submit" className="primary-button modal-submit" disabled={submitting}>
                {submitting ? "Processing..." : "Apply and continue to payment"}
              </button>
              {message ? <p className="form-message">{message}</p> : null}
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
