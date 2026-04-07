import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPackages } from "../api.js";
import { fallbackPackages } from "../data/fallback.js";
import { getPackageVisual } from "../siteContent.js";

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

function getCategoryLabel(category) {
  const labels = {
    group_trip: "Group trip",
    package: "Package"
  };

  return labels[category] || category?.replace(/_/g, " ") || "Package";
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

function getTravelDateLabel(pkg) {
  if (pkg?.adminMeta?.travelDateLabel) {
    return pkg.adminMeta.travelDateLabel;
  }

  if (!pkg.has_fixed_travel_dates) {
    return "Own travel date";
  }

  return "Specific travel date";
}

export function PackagesPage() {
  const [packages, setPackages] = useState(fallbackPackages);
  const [filters, setFilters] = useState({
    search: "",
    continent: "all",
    category: "all",
    pricingModel: "all",
    travelDateMode: "all"
  });

  useEffect(() => {
    getPackages()
      .then((data) => setPackages(data.packages))
      .catch(() => setPackages(fallbackPackages));
  }, []);

  const filterOptions = useMemo(() => {
    const continents = [...new Set(packages.map((pkg) => pkg.continent).filter(Boolean))].sort();
    const categories = [...new Set(packages.map((pkg) => pkg.package_category).filter(Boolean))].sort();
    const pricingModels = [...new Set(packages.map((pkg) => pkg.pricing_model).filter(Boolean))].sort();

    return { continents, categories, pricingModels };
  }, [packages]);

  const filteredPackages = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();

    return packages.filter((pkg) => {
      const searchableText = [pkg.title, pkg.destination, pkg.country, pkg.continent, pkg.trip_type]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
      const matchesContinent = filters.continent === "all" || pkg.continent === filters.continent;
      const matchesCategory = filters.category === "all" || pkg.package_category === filters.category;
      const matchesPricingModel = filters.pricingModel === "all" || pkg.pricing_model === filters.pricingModel;
      const matchesTravelDateMode =
        filters.travelDateMode === "all" ||
        (filters.travelDateMode === "fixed" && Boolean(pkg.has_fixed_travel_dates)) ||
        (filters.travelDateMode === "own" && !pkg.has_fixed_travel_dates);

      return matchesSearch && matchesContinent && matchesCategory && matchesPricingModel && matchesTravelDateMode;
    });
  }, [filters, packages]);

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function resetFilters() {
    setFilters({
      search: "",
      continent: "all",
      category: "all",
      pricingModel: "all",
      travelDateMode: "all"
    });
  }

  return (
    <>
      <section className="packages-hero-compact">
        <div className="container packages-hero-compact-inner">
          <div className="packages-hero-copy">
            <span className="package-meta">Travel Packages</span>
            <h1>Find your next trip.</h1>
            <p>Browse destinations, compare package types, and filter quickly to what fits.</p>
          </div>

          <div className="packages-hero-stats">
            <div className="packages-hero-stat">
              <strong>{packages.length}</strong>
              <span>Available Packages</span>
            </div>
          </div>
        </div>
      </section>

      <section className="packages-listing-section">
        <div className="container">
          <div className="packages-toolbar">
            <div className="packages-toolbar-copy">
              <span className="package-meta">Travel Packages</span>
             
            </div>

            <div className="packages-filters-panel">
              <div className="packages-filter-grid">
                <label className="packages-filter-field packages-filter-field-search">
                  <span className="field-label">Search</span>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(event) => updateFilter("search", event.target.value)}
                    placeholder="Search destination or package"
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
                  <span className="field-label">Category</span>
                  <select value={filters.category} onChange={(event) => updateFilter("category", event.target.value)}>
                    <option value="all">All categories</option>
                    {filterOptions.categories.map((category) => (
                      <option key={category} value={category}>
                        {getCategoryLabel(category)}
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
                  <span className="field-label">Travel date</span>
                  <select
                    value={filters.travelDateMode}
                    onChange={(event) => updateFilter("travelDateMode", event.target.value)}
                  >
                    <option value="all">All travel dates</option>
                    <option value="own">Own travel date</option>
                    <option value="fixed">Specific travel date</option>
                  </select>
                </label>
              </div>

              <div className="packages-filter-footer">
                <p>
                  Showing <strong>{filteredPackages.length}</strong> package{filteredPackages.length === 1 ? "" : "s"}
                </p>
                <button type="button" className="packages-clear-button" onClick={resetFilters}>
                  Clear filters
                </button>
              </div>
            </div>
          </div>

          <div className="package-listing-grid">
            {filteredPackages.map((pkg) => (
              <Link key={pkg.id} to={`/packages/${pkg.slug}`} className="listing-card">
                <div className="listing-card-image-wrap">
                  <img src={getPackageVisual(pkg)} alt={pkg.title} />
                  <span className="listing-badge listing-badge-floating">{getNightsLabel(pkg.duration_label)}</span>
                </div>

                <div className="listing-card-overlay">
                  <div className="listing-card-head">
                    <span className="listing-type-chip">{getCategoryLabel(pkg.package_category)}</span>
                    <h3>{pkg.title}</h3>
                  </div>

                  <div className="listing-price-block">
                    <strong>{`From ${formatPrice(pkg.base_price, pkg.currency_code)}`}</strong>
                    <span>{getPricingModelLabel(pkg.pricing_model)}</span>
                  </div>

                  <div className="listing-card-meta">
                    <div className="listing-meta-row">
                      <span className="listing-meta-label">Location</span>
                      <span className="listing-meta-value">
                        {pkg.destination}
                        {pkg.country ? `, ${pkg.country}` : ""}
                      </span>
                    </div>

                    <div className="listing-meta-row">
                      <span className="listing-meta-label">Travel Date</span>
                      <span className="listing-meta-value">{getTravelDateLabel(pkg)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {!filteredPackages.length ? (
            <div className="packages-empty-state">
              <h3>No packages match these filters right now.</h3>
              <p>Try adjusting the filters or clearing them to browse the full package list again.</p>
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
