import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPackages } from "../api.js";
import { fallbackPackages } from "../data/fallback.js";
import { formatCurrency } from "@nbgstravel/shared";
import { getPackageVisual, liveMedia } from "../siteContent.js";

export function GroupTripsPage() {
  const [packages, setPackages] = useState(fallbackPackages);

  useEffect(() => {
    getPackages()
      .then((data) => setPackages(data.packages))
      .catch(() => setPackages(fallbackPackages));
  }, []);

  const groupTrips = useMemo(
    () => packages.filter((pkg) => (pkg.package_category || "").toLowerCase().includes("group")),
    [packages]
  );

  return (
    <>
      <section className="page-hero-banner image-hero">
        <img src={liveMedia.packagesHero} alt="Group trips" />
        <div className="image-hero-overlay">
          <h1>Int'l Group Trips</h1>
        </div>
      </section>

      <section className="packages-listing-section">
        <div className="container">
          <div className="package-listing-grid">
            {groupTrips.map((pkg) => (
              <Link key={pkg.id} to={`/packages/${pkg.slug}`} className="listing-card">
                <img src={getPackageVisual(pkg)} alt={pkg.title} />
                <div className="listing-card-overlay">
                  <span className="listing-badge">NBGS Trips</span>
                  <h3>{pkg.title}</h3>
                  <p>{formatCurrency(pkg.base_price, pkg.currency_code)}</p>
                  <small>
                    {pkg.destination} {pkg.country ? `| ${pkg.country}` : ""}
                  </small>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
