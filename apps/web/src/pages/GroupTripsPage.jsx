import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPackages } from "../api.js";
import { fallbackPackages } from "../data/fallback.js";
import { getPackageVisual } from "../siteContent.js";
import { formatLocationHierarchy, getLocationHierarchyParts } from "../utils/location.js";

function formatPrice(amount, currency = "ZAR") {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(Number(amount || 0));
}

function getPricingModelLabel(pricingModel) {
  const labels = {
    per_person_sharing: "Per person sharing",
    per_couple: "Per couple",
    single_supplement: "Single supplement",
    child_rate: "Child rate",
    custom: "Custom quote"
  };

  return labels[pricingModel] || "Custom quote";
}

function getNightsLabel(durationLabel) {
  if (!durationLabel) return "Trip details";

  const match = durationLabel.match(/(\d+)\s*nights?/i);
  if (match) {
    const count = Number(match[1]);
    return `${count} Night${count === 1 ? "" : "s"}`;
  }

  return durationLabel;
}

function formatTravelWindow(pkg) {
  if (pkg?.adminMeta?.travelDateLabel) {
    return pkg.adminMeta.travelDateLabel;
  }

  if (pkg.fixed_travel_start_date && pkg.fixed_travel_end_date) {
    const start = new Date(pkg.fixed_travel_start_date);
    const end = new Date(pkg.fixed_travel_end_date);
    const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();

    if (sameMonth) {
      return `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString("en-ZA", {
        month: "short",
        year: "numeric"
      })}`;
    }

    return `${start.toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short"
    })} - ${end.toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })}`;
  }

  return "Specific travel date";
}

function getMonthKey(pkg) {
  if (!pkg.fixed_travel_start_date) return "";

  const date = new Date(pkg.fixed_travel_start_date);
  return date.toLocaleDateString("en-ZA", {
    month: "long",
    year: "numeric"
  });
}

export function GroupTripsPage() {
  const [packages, setPackages] = useState(fallbackPackages);
  const [filters, setFilters] = useState({
    search: "",
    continent: "all",
    pricingModel: "all",
    month: "all"
  });

  useEffect(() => {
    getPackages()
      .then((data) => setPackages(data.packages))
      .catch(() => setPackages(fallbackPackages));
  }, []);

  const groupTrips = useMemo(
    () =>
      packages.filter(
        (pkg) =>
          (pkg.package_category || "").toLowerCase().includes("group") ||
          (pkg.trip_type || "").toLowerCase().includes("group")
      ),
    [packages]
  );

  const filterOptions = useMemo(() => {
    const continents = [...new Set(groupTrips.map((pkg) => pkg.continent).filter(Boolean))].sort();
    const pricingModels = [...new Set(groupTrips.map((pkg) => pkg.pricing_model).filter(Boolean))].sort();
    const months = [...new Set(groupTrips.map((pkg) => getMonthKey(pkg)).filter(Boolean))];

    return { continents, pricingModels, months };
  }, [groupTrips]);

  const filteredTrips = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();

    return groupTrips.filter((pkg) => {
      const searchableText = [pkg.title, pkg.destination, pkg.country, pkg.continent, ...getLocationHierarchyParts(pkg)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
      const matchesContinent = filters.continent === "all" || pkg.continent === filters.continent;
      const matchesPricingModel = filters.pricingModel === "all" || pkg.pricing_model === filters.pricingModel;
      const matchesMonth = filters.month === "all" || getMonthKey(pkg) === filters.month;

      return matchesSearch && matchesContinent && matchesPricingModel && matchesMonth;
    });
  }, [filters, groupTrips]);

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function resetFilters() {
    setFilters({
      search: "",
      continent: "all",
      pricingModel: "all",
      month: "all"
    });
  }

  return (
    <>
      <section className="packages-hero-compact">
        <div className="container packages-hero-compact-inner">
          <div className="packages-hero-copy">
            <span className="package-meta">Group Trips</span>
            <h1>Browse fixed-date group trips.</h1>
            <p>See upcoming departures, compare destinations, and choose the group travel experience that suits you.</p>
          </div>

          <div className="packages-hero-stats">
            <div className="packages-hero-stat">
              <strong>{groupTrips.length}</strong>
              <span>Group Trips</span>
            </div>
          </div>
        </div>
      </section>

      <section className="packages-listing-section">
        <div className="container">
          <div className="packages-toolbar">
            

            <div className="packages-filters-panel">
              <div className="packages-filter-grid packages-filter-grid-group">
                <label className="packages-filter-field packages-filter-field-search">
                  <span className="field-label">Search</span>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(event) => updateFilter("search", event.target.value)}
                    placeholder="Search destination or trip"
                  />
                </label>

                <label className="packages-filter-field">
                  <span className="field-label">Continent</span>
                  <select value={filters.continent} onChange={(event) => updateFilter("continent", event.target.value)}>
                    <option value="all">All continents</option>
                    {filterOptions.continents.map((continent) => (
                      <option key={continent} value={continent}>
                        {continent}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="packages-filter-field">
                  <span className="field-label">Price type</span>
                  <select
                    value={filters.pricingModel}
                    onChange={(event) => updateFilter("pricingModel", event.target.value)}
                  >
                    <option value="all">All price types</option>
                    {filterOptions.pricingModels.map((pricingModel) => (
                      <option key={pricingModel} value={pricingModel}>
                        {getPricingModelLabel(pricingModel)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="packages-filter-field">
                  <span className="field-label">Departure month</span>
                  <select value={filters.month} onChange={(event) => updateFilter("month", event.target.value)}>
                    <option value="all">All months</option>
                    {filterOptions.months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="packages-filter-footer">
                <p>
                  Showing <strong>{filteredTrips.length}</strong> group trip{filteredTrips.length === 1 ? "" : "s"}
                </p>
                <button type="button" className="packages-clear-button" onClick={resetFilters}>
                  Clear filters
                </button>
              </div>
            </div>
          </div>

          <div className="package-listing-grid">
            {filteredTrips.map((pkg) => (
              <Link key={pkg.id} to={`/packages/${pkg.slug}`} className="listing-card">
                <div className="listing-card-image-wrap">
                  <img src={getPackageVisual(pkg)} alt={pkg.title} />
                  <span className="listing-badge listing-badge-floating">{getNightsLabel(pkg.duration_label)}</span>
                </div>

                <div className="listing-card-overlay">
                  <div className="listing-card-head">
                    <span className="listing-type-chip">Group trip</span>
                    <h3>{pkg.title}</h3>
                  </div>

                  <div className="listing-price-block">
                    <strong>{`From ${formatPrice(pkg.base_price, pkg.currency_code)}`}</strong>
                    <span>{getPricingModelLabel(pkg.pricing_model)}</span>
                  </div>

                  <div className="listing-card-meta">
                    <div className="listing-meta-row">
                      <span className="listing-meta-label">Location</span>
                      <span className="listing-meta-value">{formatLocationHierarchy(pkg)}</span>
                    </div>

                    <div className="listing-meta-row">
                      <span className="listing-meta-label">Travel Date</span>
                      <span className="listing-meta-value">{formatTravelWindow(pkg)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {!filteredTrips.length ? (
            <div className="packages-empty-state">
              <h3>No group trips match these filters right now.</h3>
              <p>Try another month, destination, or clear the filters to view all current group departures.</p>
              <button type="button" className="accent-button" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
