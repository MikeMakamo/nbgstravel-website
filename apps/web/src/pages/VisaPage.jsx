import React, { useEffect, useState } from "react";
import { getVisas } from "../api.js";
import { VisaApplicationModal } from "../components/forms/VisaApplicationModal.jsx";
import { formatCurrency } from "@nbgstravel/shared";

const fallbackVisas = [
  {
    id: 1,
    title: "Dubai Visa",
    country: "United Arab Emirates",
    processing_time_label: "5 - 7 working days",
    application_fee: 1999,
    currency_code: "ZAR",
    description: "Tourist visa support with guided application handling."
  }
];

export function VisaPage() {
  const [visas, setVisas] = useState(fallbackVisas);
  const [selectedVisa, setSelectedVisa] = useState(null);

  useEffect(() => {
    getVisas()
      .then((data) => setVisas(data.visas))
      .catch(() => setVisas(fallbackVisas));
  }, []);

  return (
    <>
      <section className="section page-hero">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Visa Services</span>
            <h1>Structured visa applications with direct `PayFast` checkout.</h1>
          </div>
          <div className="visa-grid">
            {visas.map((visa) => (
              <article key={visa.id} className="visa-card">
                <span className="package-meta">{visa.country}</span>
                <h3>{visa.title}</h3>
                <p>{visa.description}</p>
                <div className="visa-card-footer">
                  <strong>{formatCurrency(visa.application_fee, visa.currency_code)}</strong>
                  <button className="primary-button" onClick={() => setSelectedVisa(visa)}>
                    Apply now
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <VisaApplicationModal open={Boolean(selectedVisa)} onClose={() => setSelectedVisa(null)} visa={selectedVisa} />
    </>
  );
}
