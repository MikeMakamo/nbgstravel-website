import React from "react";
import { Link } from "react-router-dom";

export function PaymentStatusPage({ status }) {
  const isSuccess = status === "success";

  return (
    <section className="section page-hero">
      <div className="container narrow-copy center-copy">
        <span className="eyebrow">Visa payment</span>
        <h1>{isSuccess ? "Payment flow completed" : "Payment flow cancelled"}</h1>
        <p>
          {isSuccess
            ? "Your visa application has been submitted and the payment process was completed. Our team will continue with the next steps."
            : "Your visa application was saved, but the payment step was cancelled. You can return to the visa page when you are ready."}
        </p>
        <Link to="/visa" className="primary-button">
          Back to visa page
        </Link>
      </div>
    </section>
  );
}
