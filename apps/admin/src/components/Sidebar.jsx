import React from "react";
import { brandAssets } from "../assets.js";

export default function Sidebar({ admin, activeView, setActiveView, summary, onLogout }) {
  const items = [
    {
      id: "dashboard",
      label: "Dashboard",
      description: "Daily activity",
      count: safeCount(summary?.activeBookings) + safeCount(summary?.activeVisaApplications)
    },
    {
      id: "packages",
      label: "Packages",
      description: "Catalog and editing",
      count: safeCount(summary?.packages)
    },
    {
      id: "bookings",
      label: "Bookings",
      description: "Orders and follow-up",
      count: safeCount(summary?.activeBookings)
    },
    {
      id: "visas",
      label: "Visas",
      description: "Applications and payfast",
      count: safeCount(summary?.activeVisaApplications)
    },
    {
      id: "unfinished",
      label: "Unfinished forms",
      description: "Abandoned captures",
      count: safeCount(summary?.abandonedLeads)
    }
  ];

  return (
    <aside className="admin-sidebar">
      <button type="button" className="sidebar-brand sidebar-brand--logoonly" onClick={() => setActiveView("dashboard")}>
        <img className="sidebar-brand__logo" src={brandAssets.mainLogo} alt="NBGS Travel" />
      </button>

      <div className="sidebar-user">
        <p className="sidebar-user__name">{admin?.first_name || admin?.firstName} {admin?.last_name || admin?.lastName}</p>
        <p className="sidebar-user__role">{formatRole(admin?.role)}</p>
      </div>

      <div className="sidebar-quickstats">
        <div>
          <span>Packages live</span>
          <strong>{summary?.packages || 0}</strong>
        </div>
        <div>
          <span>Booking queue</span>
          <strong>{summary?.activeBookings || 0}</strong>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Admin sections">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar-nav__item ${isItemActive(item.id, activeView) ? "is-active" : ""}`}
            onClick={() => setActiveView(item.id)}
          >
            <div>
              <span className="sidebar-nav__label">{item.label}</span>
              <span className="sidebar-nav__description">{item.description}</span>
            </div>
            <span className="sidebar-nav__count">{item.count}</span>
          </button>
        ))}
      </nav>

      <button className="button button--ghost sidebar-logout" type="button" onClick={onLogout}>
        Logout
      </button>
    </aside>
  );
}

function safeCount(value) {
  return Number(value || 0);
}

function isItemActive(itemId, activeView) {
  if (itemId === "packages" && activeView === "packageEditor") {
    return true;
  }

  return itemId === activeView;
}

function formatRole(role) {
  return String(role || "admin")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
