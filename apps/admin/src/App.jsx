import React, { useEffect, useState } from "react";
import {
  createPackage,
  createVisa,
  getAbandonedLeads,
  getBookings,
  getMe,
  getPackages,
  getSummary,
  getVisaApplications,
  getVisas,
  login
} from "./api.js";

const tokenStorageKey = "nbgs-admin-token";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem(tokenStorageKey) || "");
  const [admin, setAdmin] = useState(null);
  const [summary, setSummary] = useState(null);
  const [packages, setPackages] = useState([]);
  const [visas, setVisas] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [abandonedLeads, setAbandonedLeads] = useState([]);
  const [loginForm, setLoginForm] = useState({ email: "admin@nbgstravel.local", password: "admin123" });
  const [packageForm, setPackageForm] = useState({
    title: "",
    packageCategory: "package",
    destination: "",
    country: "",
    continent: "",
    tripType: "",
    durationLabel: "",
    basePrice: "",
    pricingModel: "per_person_sharing",
    quotedFromLabel: "From",
    depositAmount: "",
    hasFixedTravelDates: false,
    fixedTravelStartDate: "",
    fixedTravelEndDate: "",
    shortDescription: "",
    fullDescription: "",
    status: "draft"
  });
  const [visaForm, setVisaForm] = useState({
    title: "",
    country: "",
    processingTimeLabel: "",
    applicationFee: "",
    description: "",
    status: "draft"
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    Promise.all([getMe(token), getSummary(token), getPackages(token), getVisas(token), getBookings(token), getVisaApplications(token), getAbandonedLeads(token)])
      .then(([meData, summaryData, packagesData, visasData, bookingsData, visaApplicationsData, abandonedLeadsData]) => {
        setAdmin(meData.admin);
        setSummary(summaryData.summary);
        setPackages(packagesData.packages);
        setVisas(visasData.visas);
        setBookings(bookingsData.bookings);
        setApplications(visaApplicationsData.applications);
        setAbandonedLeads(abandonedLeadsData.abandonedLeads);
      })
      .catch((error) => {
        setMessage(error.message);
        localStorage.removeItem(tokenStorageKey);
        setToken("");
      });
  }, [token]);

  async function handleLogin(event) {
    event.preventDefault();
    try {
      const data = await login(loginForm);
      localStorage.setItem(tokenStorageKey, data.token);
      setToken(data.token);
      setMessage("Logged in successfully.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleCreatePackage(event) {
    event.preventDefault();
    try {
      await createPackage(token, packageForm);
      const freshPackages = await getPackages(token);
      setPackages(freshPackages.packages);
      setMessage("Package created.");
      setPackageForm({
        title: "",
        packageCategory: "package",
        destination: "",
        country: "",
        continent: "",
        tripType: "",
        durationLabel: "",
        basePrice: "",
        pricingModel: "per_person_sharing",
        quotedFromLabel: "From",
        depositAmount: "",
        hasFixedTravelDates: false,
        fixedTravelStartDate: "",
        fixedTravelEndDate: "",
        shortDescription: "",
        fullDescription: "",
        status: "draft"
      });
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleCreateVisa(event) {
    event.preventDefault();
    try {
      await createVisa(token, visaForm);
      const freshVisas = await getVisas(token);
      setVisas(freshVisas.visas);
      setMessage("Visa offering created.");
      setVisaForm({
        title: "",
        country: "",
        processingTimeLabel: "",
        applicationFee: "",
        description: "",
        status: "draft"
      });
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (!token) {
    return (
      <div className="admin-shell login-shell">
        <form className="panel login-panel" onSubmit={handleLogin}>
          <h1>NBGSTRAVEL Admin</h1>
          <p>Use the seeded super admin account to access the dashboard.</p>
          <label>
            Email
            <input value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} />
          </label>
          <label>
            Password
            <input
              type="password"
              value={loginForm.password}
              onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
            />
          </label>
          <button type="submit">Login</button>
          {message ? <p className="message">{message}</p> : null}
        </form>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <h1>NBGSTRAVEL Control Room</h1>
          <p>
            {admin?.first_name} {admin?.last_name} | {admin?.role}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem(tokenStorageKey);
            setToken("");
            setAdmin(null);
          }}
        >
          Logout
        </button>
      </header>

      {message ? <p className="message">{message}</p> : null}

      <section className="stats-grid">
        <article className="panel">
          <span>Active bookings</span>
          <strong>{summary?.activeBookings || 0}</strong>
        </article>
        <article className="panel">
          <span>Visa applications</span>
          <strong>{summary?.activeVisaApplications || 0}</strong>
        </article>
        <article className="panel">
          <span>Abandoned leads</span>
          <strong>{summary?.abandonedLeads || 0}</strong>
        </article>
        <article className="panel">
          <span>Visible reviews</span>
          <strong>{summary?.visibleReviews || 0}</strong>
        </article>
      </section>

      <section className="admin-grid">
        <article className="panel">
          <h2>Create package</h2>
          <form className="stack" onSubmit={handleCreatePackage}>
            <input placeholder="Title" value={packageForm.title} onChange={(event) => setPackageForm({ ...packageForm, title: event.target.value })} required />
            <input
              placeholder="Category"
              value={packageForm.packageCategory}
              onChange={(event) => setPackageForm({ ...packageForm, packageCategory: event.target.value })}
              required
            />
            <input placeholder="Destination" value={packageForm.destination} onChange={(event) => setPackageForm({ ...packageForm, destination: event.target.value })} />
            <input placeholder="Country" value={packageForm.country} onChange={(event) => setPackageForm({ ...packageForm, country: event.target.value })} />
            <input placeholder="Continent" value={packageForm.continent} onChange={(event) => setPackageForm({ ...packageForm, continent: event.target.value })} />
            <input placeholder="Trip type" value={packageForm.tripType} onChange={(event) => setPackageForm({ ...packageForm, tripType: event.target.value })} />
            <input
              placeholder="Duration label"
              value={packageForm.durationLabel}
              onChange={(event) => setPackageForm({ ...packageForm, durationLabel: event.target.value })}
            />
            <input type="number" placeholder="Base price" value={packageForm.basePrice} onChange={(event) => setPackageForm({ ...packageForm, basePrice: event.target.value })} required />
            <select value={packageForm.pricingModel} onChange={(event) => setPackageForm({ ...packageForm, pricingModel: event.target.value })}>
              <option value="per_person_sharing">Per person sharing</option>
              <option value="per_couple">Per couple</option>
              <option value="single_supplement">Single supplement</option>
              <option value="child_rate">Child rate</option>
              <option value="custom">Custom</option>
            </select>
            <textarea
              placeholder="Short description"
              value={packageForm.shortDescription}
              onChange={(event) => setPackageForm({ ...packageForm, shortDescription: event.target.value })}
            />
            <button type="submit">Create package</button>
          </form>
        </article>

        <article className="panel">
          <h2>Create visa offering</h2>
          <form className="stack" onSubmit={handleCreateVisa}>
            <input placeholder="Title" value={visaForm.title} onChange={(event) => setVisaForm({ ...visaForm, title: event.target.value })} required />
            <input placeholder="Country" value={visaForm.country} onChange={(event) => setVisaForm({ ...visaForm, country: event.target.value })} required />
            <input
              placeholder="Processing time"
              value={visaForm.processingTimeLabel}
              onChange={(event) => setVisaForm({ ...visaForm, processingTimeLabel: event.target.value })}
            />
            <input type="number" placeholder="Application fee" value={visaForm.applicationFee} onChange={(event) => setVisaForm({ ...visaForm, applicationFee: event.target.value })} required />
            <textarea placeholder="Description" value={visaForm.description} onChange={(event) => setVisaForm({ ...visaForm, description: event.target.value })} />
            <button type="submit">Create visa</button>
          </form>
        </article>
      </section>

      <section className="table-grid">
        <article className="panel">
          <h2>Packages</h2>
          <ul className="record-list">
            {packages.map((pkg) => (
              <li key={pkg.id}>
                <strong>{pkg.title}</strong>
                <span>{pkg.status}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="panel">
          <h2>Visa offerings</h2>
          <ul className="record-list">
            {visas.map((visa) => (
              <li key={visa.id}>
                <strong>{visa.title}</strong>
                <span>{visa.status}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="panel">
          <h2>Package bookings</h2>
          <ul className="record-list">
            {bookings.map((booking) => (
              <li key={booking.id}>
                <strong>{booking.full_name}</strong>
                <span>{booking.package_title}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="panel">
          <h2>Visa applications</h2>
          <ul className="record-list">
            {applications.map((application) => (
              <li key={application.id}>
                <strong>{application.full_name}</strong>
                <span>{application.visa_title}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="panel">
          <h2>Unfinished forms</h2>
          <ul className="record-list">
            {abandonedLeads.map((lead) => (
              <li key={lead.id}>
                <strong>{lead.phone_number}</strong>
                <span>{lead.lead_type}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
