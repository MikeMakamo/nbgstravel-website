import React from "react";

export default function StatCard({ label, value, detail }) {
  return (
    <article className="stat-card">
      <span className="stat-card__label">{label}</span>
      <strong className="stat-card__value">{value}</strong>
      {detail ? <p className="stat-card__detail">{detail}</p> : null}
    </article>
  );
}
