import React, { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@nbgstravel/shared";
import { getVisas } from "../api.js";
import { VisaApplicationModal } from "../components/forms/VisaApplicationModal.jsx";
import { visaPageContent } from "../siteContent.js";

function normalize(value = "") {
  return value.toLowerCase().trim();
}

export function VisaPage() {
  const [apiVisas, setApiVisas] = useState([]);
  const [selectedVisa, setSelectedVisa] = useState(null);

  useEffect(() => {
    getVisas()
      .then((data) => setApiVisas(data.visas || []))
      .catch(() => setApiVisas([]));
  }, []);

  const visas = useMemo(() => {
    return visaPageContent.visas.map((item) => {
      const match = apiVisas.find((visa) => {
        const normalizedTitle = normalize(visa.title);
        const normalizedCountry = normalize(visa.country);

        return item.apiAliases.some((alias) => normalize(alias) === normalizedTitle) || normalize(item.country) === normalizedCountry;
      });

      return {
        ...item,
        ...match,
        title: item.title,
        country: item.country,
        feeNote: item.feeNote,
        processingTimeLabel: item.processingTimeLabel,
        applicationFee: match?.application_fee ?? item.applicationFee,
        currencyCode: match?.currency_code ?? item.currencyCode,
        description: match?.description || item.description,
        imageUrl: item.imageUrl || `https://flagcdn.com/w640/${item.countryCode}.png`,
        canApply: Boolean(match?.id)
      };
    });
  }, [apiVisas]);

  return (
    <>
      <section className="visa-page-hero">
        <div className="container visa-page-hero-inner">
          <div className="visa-page-hero-copy">
            <span className="package-meta">{visaPageContent.heroTitle}</span>
            <h1>{visaPageContent.introTitle}</h1>
            <p>{visaPageContent.introCopy}</p>
          </div>

          <div className="visa-page-hero-note">
            <strong>{visaPageContent.paymentNote}</strong>
            <span>Secure PayFast checkout after application submission.</span>
          </div>
        </div>
      </section>

      <section className="visa-page-section">
        <div className="container">
          <div className="visa-grid visa-page-grid">
            {visas.map((visa) => (
              <article key={visa.title} className="visa-card visa-country-card">
                <div className="visa-country-image">
                  <img src={visa.imageUrl} alt={visa.country} />
                </div>

                <div className="visa-country-content">
                  <span className="package-meta">{visa.country}</span>
                  <h3>{visa.title}</h3>
                  <p className="visa-country-fee-note">{visa.feeNote}</p>
                  <p className="visa-country-processing">Processing time: {visa.processingTimeLabel}</p>
                  <strong className="visa-country-price">{formatCurrency(visa.applicationFee, visa.currencyCode || "ZAR")}</strong>

                  <button
                    className="primary-button visa-country-action"
                    onClick={() => (visa.canApply ? setSelectedVisa(visa) : null)}
                    disabled={!visa.canApply}
                  >
                    {visa.canApply ? "Apply Now" : "Unavailable"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="visa-terms-section">
        <div className="container">
          <div className="package-section-heading">
            <span className="package-meta">Visa Service Terms</span>
            <h2>What to know before applying</h2>
          </div>

          <div className="visa-terms-grid">
            {visaPageContent.terms.map((section) => (
              <article key={section.title} className="visa-terms-card">
                <h3>{section.title}</h3>
                <ul className="text-bullets">
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <VisaApplicationModal open={Boolean(selectedVisa)} onClose={() => setSelectedVisa(null)} visa={selectedVisa} />
    </>
  );
}
