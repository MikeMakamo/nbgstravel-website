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
      <div className="modal-card">
        <button type="button" className="modal-close" onClick={handleClose}>
          Close
        </button>
        <h3>Apply for {visa.title}</h3>
        <p>Complete the details below, then continue to secure `PayFast` checkout.</p>
        <div className="quote-card">
          <span>Application fee</span>
          <strong>{formatCurrency(visa.application_fee, visa.currency_code || "ZAR")}</strong>
        </div>
        <form className="stack-form" onSubmit={handleSubmit}>
          <label>
            Name and surname
            <input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required />
          </label>
          <label>
            Phone number
            <input value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} required />
          </label>
          <label>
            Nationality
            <input value={form.nationality} onChange={(event) => setForm({ ...form, nationality: event.target.value })} required />
          </label>
          <label>
            Number of persons
            <input
              type="number"
              min="1"
              value={form.numberOfPersons}
              onChange={(event) => setForm({ ...form, numberOfPersons: event.target.value })}
              required
            />
          </label>
          <label>
            Travelling date
            <input type="date" value={form.travelDate} onChange={(event) => setForm({ ...form, travelDate: event.target.value })} required />
          </label>
          <label>
            Returning date
            <input type="date" value={form.returnDate} onChange={(event) => setForm({ ...form, returnDate: event.target.value })} required />
          </label>
          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? "Processing..." : "Apply and continue to payment"}
          </button>
          {message ? <p className="form-message">{message}</p> : null}
        </form>
      </div>
    </div>
  );
}
