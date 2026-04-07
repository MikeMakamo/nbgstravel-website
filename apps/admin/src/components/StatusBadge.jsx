import React from "react";

export default function StatusBadge({ status }) {
  const normalized = String(status || "unknown").toLowerCase();
  return <span className={`status-badge status-badge--${normalized}`}>{formatStatus(normalized)}</span>;
}

function formatStatus(status) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
