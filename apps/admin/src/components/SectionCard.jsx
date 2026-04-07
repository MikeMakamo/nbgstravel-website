import React from "react";

export default function SectionCard({ eyebrow, title, description, actions, className = "", children }) {
  return (
    <section className={`panel section-card ${className}`.trim()}>
      <header className="section-card__header">
        <div className="section-heading">
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className="section-card__actions">{actions}</div> : null}
      </header>
      {children}
    </section>
  );
}
