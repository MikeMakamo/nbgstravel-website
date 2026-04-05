import React, { useEffect, useMemo, useRef, useState } from "react";
import { formatCurrency } from "@nbgstravel/shared";
import { submitAbandonedLead, submitBooking } from "../../api.js";

function loadDraft(storageKey, initialState) {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? { ...initialState, ...JSON.parse(raw) } : initialState;
  } catch {
    return initialState;
  }
}

export function PackageBookingModal({ open, onClose, pkg }) {
  const storageKey = useMemo(() => `nbgs-package-${pkg?.id || "draft"}`, [pkg?.id]);
  const [form, setForm] = useState(() =>
    loadDraft(storageKey, {
      fullName: "",
      phoneNumber: "",
      email: "",
      preferredTravelDate: "",
      numberOfPersons: 1
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

  useEffect(() => {
    if (!open || !pkg) {
      return undefined;
    }

    const handleUnload = () => {
      if (!submittedRef.current && form.phoneNumber) {
        navigator.sendBeacon?.(
          `${process.env.VITE_API_URL || "http://localhost:4000/api"}/abandoned-leads`,
          new Blob(
            [
              JSON.stringify({
                leadType: "package_booking",
                packageId: pkg.id,
                fullName: form.fullName,
                phoneNumber: form.phoneNumber,
                email: form.email,
                preferredTravelDate: form.preferredTravelDate || null,
                numberOfPersons: Number(form.numberOfPersons || 1),
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
  }, [form, open, pkg, storageKey]);

  if (!open || !pkg) {
    return null;
  }

  const persons = Number(form.numberOfPersons || 1);
  const total = pkg.pricing_model === "per_couple" ? Math.ceil(persons / 2) * Number(pkg.base_price || 0) : persons * Number(pkg.base_price || 0);

  async function handleClose() {
    if (!submittedRef.current && form.phoneNumber) {
      try {
        await submitAbandonedLead({
          leadType: "package_booking",
          packageId: pkg.id,
          fullName: form.fullName,
          phoneNumber: form.phoneNumber,
          email: form.email,
          preferredTravelDate: form.preferredTravelDate || null,
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
      await submitBooking({
        packageId: pkg.id,
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        email: form.email,
        preferredTravelDate: form.preferredTravelDate || null,
        numberOfPersons: Number(form.numberOfPersons || 1),
        sourcePageUrl: window.location.href
      });
      submittedRef.current = true;
      localStorage.removeItem(storageKey);
      setMessage("Request received. An NBGS Travel agent will contact you shortly.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <button type="button" className="modal-close" onClick={handleClose}>
          Close
        </button>
        <h3>Book {pkg.title}</h3>
        <p>Complete the form below and our travel team will contact you with the next steps.</p>
        <div className="quote-card">
          <span>Live quote</span>
          <strong>{formatCurrency(total, pkg.currency_code || "ZAR")}</strong>
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
            Email
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
          {!pkg.has_fixed_travel_dates ? (
            <label>
              Preferred travel date
              <input
                type="date"
                value={form.preferredTravelDate}
                onChange={(event) => setForm({ ...form, preferredTravelDate: event.target.value })}
              />
            </label>
          ) : (
            <div className="info-pill">
              Fixed travel dates: {pkg.fixed_travel_start_date} to {pkg.fixed_travel_end_date}
            </div>
          )}
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
          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit request"}
          </button>
          {message ? <p className="form-message">{message}</p> : null}
        </form>
      </div>
    </div>
  );
}
