import React, { useEffect, useState } from "react";
import {
  createPackage,
  createVisa,
  deletePackage,
  getAbandonedLeads,
  getBookings,
  getMe,
  getPackages,
  getSummary,
  getVisaApplications,
  getVisas,
  login,
  updateBookingStatus,
  updatePackage,
  uploadMedia
} from "./api.js";
import DataTable from "./components/DataTable.jsx";
import LoginScreen from "./components/LoginScreen.jsx";
import SectionCard from "./components/SectionCard.jsx";
import Sidebar from "./components/Sidebar.jsx";
import StatCard from "./components/StatCard.jsx";
import StatusBadge from "./components/StatusBadge.jsx";
import { peopleAssets, travelGalleryAssets } from "./assets.js";

const tokenStorageKey = "nbgs-admin-token";

const initialPackageForm = {
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
  status: "draft",
  travelDateLabel: "",
  bio: "",
  backgroundListingImage: "",
  describeTrip: "",
  tripPolicy: "",
  galleryText: "",
  youtubeUrl: "",
  nights: "",
  dateOfTrip: "",
  isLocalTrip: false,
  mainTripType: "",
  includesText: "",
  excludesText: ""
};

const initialVisaForm = {
  title: "",
  country: "",
  processingTimeLabel: "",
  applicationFee: "",
  description: "",
  status: "draft"
};

const sectionMeta = {
  dashboard: {
    title: "Dashboard",
    description: "A quick NBGS operations snapshot without getting lost in every record at once."
  },
  packages: {
    title: "Packages",
    description: "Manage listed trips, open an editor, and keep the package catalog under control."
  },
  packageEditor: {
    title: "Package editor",
    description: "Edit the same package metadata your current workflow depends on, but in a cleaner custom screen."
  },
  bookings: {
    title: "Bookings",
    description: "Review booking submissions, inspect details, and move each lead through the right follow-up stage."
  },
  visas: {
    title: "Visa desk",
    description: "Manage available visa services and watch live application flow."
  },
  unfinished: {
    title: "Unfinished forms",
    description: "Recover customers who left the modal before finishing the process."
  }
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem(tokenStorageKey) || "");
  const [activeView, setActiveView] = useState("dashboard");
  const [admin, setAdmin] = useState(null);
  const [summary, setSummary] = useState(null);
  const [packages, setPackages] = useState([]);
  const [visas, setVisas] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [abandonedLeads, setAbandonedLeads] = useState([]);
  const [editingPackageId, setEditingPackageId] = useState(null);
  const [packageSearch, setPackageSearch] = useState("");
  const [packageStatusFilter, setPackageStatusFilter] = useState("all");
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: "admin@nbgstravel.local", password: "admin123" });
  const [packageForm, setPackageForm] = useState(initialPackageForm);
  const [visaForm, setVisaForm] = useState(initialVisaForm);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [isSubmittingPackage, setIsSubmittingPackage] = useState(false);
  const [isSubmittingVisa, setIsSubmittingVisa] = useState(false);
  const [isUpdatingBooking, setIsUpdatingBooking] = useState(false);
  const [deletingPackageId, setDeletingPackageId] = useState(null);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;

    async function bootstrap() {
      setIsLoading(true);

      try {
        const [meData, summaryData, packagesData, visasData, bookingsData, visaApplicationsData, abandonedLeadsData] = await Promise.all([
          getMe(token),
          getSummary(token),
          getPackages(token),
          getVisas(token),
          getBookings(token),
          getVisaApplications(token),
          getAbandonedLeads(token)
        ]);

        if (!isMounted) {
          return;
        }

        setAdmin(meData.admin);
        setSummary(summaryData.summary);
        setPackages(normalizePackages(packagesData.packages));
        setVisas(visasData.visas);
        setBookings(bookingsData.bookings);
        setApplications(visaApplicationsData.applications);
        setAbandonedLeads(abandonedLeadsData.abandonedLeads);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setMessage(error.message);
        localStorage.removeItem(tokenStorageKey);
        setToken("");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (!bookings.length) {
      setSelectedBookingId(null);
      return;
    }

    if (!selectedBookingId || !bookings.some((booking) => booking.id === selectedBookingId)) {
      setSelectedBookingId(bookings[0].id);
    }
  }, [bookings, selectedBookingId]);

  async function refreshData() {
    if (!token) {
      return;
    }

    setIsRefreshing(true);

    try {
      const [summaryData, packagesData, visasData, bookingsData, visaApplicationsData, abandonedLeadsData] = await Promise.all([
        getSummary(token),
        getPackages(token),
        getVisas(token),
        getBookings(token),
        getVisaApplications(token),
        getAbandonedLeads(token)
      ]);

      setSummary(summaryData.summary);
      setPackages(normalizePackages(packagesData.packages));
      setVisas(visasData.visas);
      setBookings(bookingsData.bookings);
      setApplications(visaApplicationsData.applications);
      setAbandonedLeads(abandonedLeadsData.abandonedLeads);
      setMessage("Dashboard refreshed.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setIsSubmittingLogin(true);

    try {
      const data = await login(loginForm);
      localStorage.setItem(tokenStorageKey, data.token);
      setToken(data.token);
      setActiveView("dashboard");
      setMessage("Logged in successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmittingLogin(false);
    }
  }

  async function handleCreatePackage(event) {
    event.preventDefault();
    setIsSubmittingPackage(true);

    try {
      const payload = buildPackagePayload(packageForm);

      if (editingPackageId) {
        await updatePackage(token, editingPackageId, payload);
        setMessage("Package updated.");
      } else {
        await createPackage(token, payload);
        setMessage("Package created.");
      }

      setPackageForm(initialPackageForm);
      setEditingPackageId(null);
      await refreshData();
      setActiveView("packages");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmittingPackage(false);
    }
  }

  async function handleCreateVisa(event) {
    event.preventDefault();
    setIsSubmittingVisa(true);

    try {
      await createVisa(token, visaForm);
      setVisaForm(initialVisaForm);
      setMessage("Visa offering created.");
      await refreshData();
      setActiveView("visas");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmittingVisa(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(tokenStorageKey);
    setToken("");
    setAdmin(null);
    setSummary(null);
    setPackages([]);
    setVisas([]);
    setBookings([]);
    setApplications([]);
    setAbandonedLeads([]);
    setEditingPackageId(null);
    setSelectedBookingId(null);
    setActiveView("dashboard");
    setMessage("");
  }

  function openCreatePackage() {
    setEditingPackageId(null);
    setPackageForm(initialPackageForm);
    setActiveView("packageEditor");
  }

  function openEditPackage(pkg) {
    setEditingPackageId(pkg.id);
    setPackageForm(createPackageFormFromRecord(pkg));
    setActiveView("packageEditor");
  }

  function duplicatePackageRecord(pkg) {
    const clonedForm = createPackageFormFromRecord(pkg);
    setEditingPackageId(null);
    setPackageForm({
      ...clonedForm,
      title: `${clonedForm.title} Copy`,
      status: "draft"
    });
    setActiveView("packageEditor");
  }

  async function handleDeletePackage(pkg) {
    const confirmed = window.confirm(`Delete ${pkg.title}? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setDeletingPackageId(pkg.id);

    try {
      await deletePackage(token, pkg.id);
      if (editingPackageId === pkg.id) {
        setEditingPackageId(null);
        setPackageForm(initialPackageForm);
      }
      setMessage("Package deleted.");
      await refreshData();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setDeletingPackageId(null);
    }
  }

  async function handleBookingStatusChange(status) {
    if (!selectedBookingId) {
      return;
    }

    setIsUpdatingBooking(true);

    try {
      await updateBookingStatus(token, selectedBookingId, status);
      setMessage(`Booking moved to ${formatLabel(status)}.`);
      await refreshData();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsUpdatingBooking(false);
    }
  }

  async function handleBackgroundImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploadingBackground(true);

    try {
      const data = await uploadMedia(token, file, packageForm.title || "Package image");
      setPackageForm((current) => ({
        ...current,
        backgroundListingImage: data.mediaAsset.fileUrl
      }));
      setMessage("Background image uploaded.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsUploadingBackground(false);
      event.target.value = "";
    }
  }

  async function handleGalleryUpload(event) {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    setIsUploadingGallery(true);

    try {
      const uploads = await Promise.all(files.map((file) => uploadMedia(token, file, packageForm.title || "Gallery image")));
      const uploadedUrls = uploads.map((item) => item.mediaAsset.fileUrl);

      setPackageForm((current) => ({
        ...current,
        galleryText: [...linesToArray(current.galleryText), ...uploadedUrls].join("\n")
      }));
      setMessage("Gallery image upload complete.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsUploadingGallery(false);
      event.target.value = "";
    }
  }

  if (!token) {
    return (
      <LoginScreen
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        onSubmit={handleLogin}
        message={message}
        isSubmitting={isSubmittingLogin}
      />
    );
  }

  const publishedPackages = packages.filter((pkg) => pkg.status === "published").length;
  const draftPackages = packages.filter((pkg) => pkg.status === "draft").length;
  const publishedVisas = visas.filter((visa) => visa.status === "published").length;
  const pendingApplications = applications.filter((application) =>
    ["submitted", "payment_pending"].includes(application.status)
  ).length;
  const openBookings = bookings.filter((booking) => ["new", "contact_pending"].includes(booking.status)).length;
  const openLeads = abandonedLeads.filter((lead) => ["new", "contact_pending"].includes(lead.status)).length;
  const filteredPackages = packages.filter((pkg) => {
    const search = packageSearch.trim().toLowerCase();
    const matchesSearch = !search || [pkg.title, pkg.destination, pkg.country, pkg.slug].filter(Boolean).some((value) => String(value).toLowerCase().includes(search));
    const matchesStatus = packageStatusFilter === "all" || pkg.status === packageStatusFilter;
    return matchesSearch && matchesStatus;
  });
  const selectedBooking = bookings.find((booking) => booking.id === selectedBookingId) || bookings[0] || null;

  const attentionItems = [
    ...bookings
      .filter((booking) => ["new", "contact_pending"].includes(booking.status))
      .map((booking) => ({
        id: `booking-${booking.id}`,
        title: booking.full_name,
        description: booking.package_title || "Package booking",
        meta: `${booking.number_of_persons || 1} traveler${Number(booking.number_of_persons || 1) > 1 ? "s" : ""}`,
        when: booking.submitted_at,
        status: booking.status
      })),
    ...applications
      .filter((application) => ["submitted", "payment_pending"].includes(application.status))
      .map((application) => ({
        id: `visa-${application.id}`,
        title: application.full_name,
        description: application.visa_title || "Visa application",
        meta: application.status === "payment_pending" ? "Awaiting PayFast completion" : "Needs review",
        when: application.submitted_at,
        status: application.status
      })),
    ...abandonedLeads
      .filter((lead) => ["new", "contact_pending"].includes(lead.status))
      .map((lead) => ({
        id: `lead-${lead.id}`,
        title: lead.full_name || lead.phone_number,
        description: formatLabel(lead.lead_type),
        meta: "Customer left mid-form",
        when: lead.captured_at,
        status: lead.status
      }))
  ]
    .sort((left, right) => new Date(right.when || 0) - new Date(left.when || 0))
    .slice(0, 6);

  const recentActivity = [
    ...bookings.map((booking) => ({
      id: `booking-${booking.id}`,
      category: "Package booking",
      title: booking.full_name,
      detail: booking.package_title || "Travel request",
      when: booking.submitted_at
    })),
    ...applications.map((application) => ({
      id: `visa-${application.id}`,
      category: "Visa application",
      title: application.full_name,
      detail: application.visa_title || "Visa request",
      when: application.submitted_at
    })),
    ...abandonedLeads.map((lead) => ({
      id: `lead-${lead.id}`,
      category: "Unfinished form",
      title: lead.full_name || lead.phone_number,
      detail: formatLabel(lead.lead_type),
      when: lead.captured_at
    }))
  ]
    .sort((left, right) => new Date(right.when || 0) - new Date(left.when || 0))
    .slice(0, 8);

  const visaColumns = [
    {
      key: "offering",
      header: "Visa offering",
      render: (visa) => (
        <div className="record-primary">
          <strong>{visa.title}</strong>
          <span>{visa.country}</span>
        </div>
      )
    },
    {
      key: "processing",
      header: "Processing",
      render: (visa) => visa.processing_time_label || "Confirm manually"
    },
    {
      key: "fee",
      header: "Fee",
      render: (visa) => formatCurrency(visa.application_fee, visa.currency_code)
    },
    {
      key: "status",
      header: "Status",
      render: (visa) => <StatusBadge status={visa.status} />
    }
  ];

  const applicationColumns = [
    {
      key: "applicant",
      header: "Applicant",
      render: (application) => (
        <div className="record-primary">
          <strong>{application.full_name}</strong>
          <span>{application.phone_number}</span>
        </div>
      )
    },
    {
      key: "visa",
      header: "Visa",
      render: (application) => application.visa_title
    },
    {
      key: "travel",
      header: "Travel dates",
      render: (application) => `${formatDate(application.travel_date)} to ${formatDate(application.return_date)}`
    },
    {
      key: "status",
      header: "Status",
      render: (application) => <StatusBadge status={application.status} />
    }
  ];

  const leadColumns = [
    {
      key: "lead",
      header: "Lead",
      render: (lead) => (
        <div className="record-primary">
          <strong>{lead.full_name || "Name not captured"}</strong>
          <span>{lead.phone_number}</span>
        </div>
      )
    },
    {
      key: "type",
      header: "Type",
      render: (lead) => formatLabel(lead.lead_type)
    },
    {
      key: "captured",
      header: "Captured",
      render: (lead) => formatDate(lead.captured_at)
    },
    {
      key: "status",
      header: "Status",
      render: (lead) => <StatusBadge status={lead.status} />
    }
  ];

  return (
    <div className="admin-app">
      <Sidebar admin={admin} activeView={activeView} setActiveView={setActiveView} summary={summary} onLogout={handleLogout} />

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="section-heading">
            <span className="eyebrow">NBGS operations</span>
            <h2>{sectionMeta[activeView].title}</h2>
            <p>{sectionMeta[activeView].description}</p>
          </div>

          <div className="topbar-actions">
            <button className="button button--secondary" type="button" onClick={refreshData} disabled={isRefreshing}>
              {isRefreshing ? "Refreshing..." : "Refresh data"}
            </button>
          </div>
        </header>

        {message ? <p className="message-banner">{message}</p> : null}

        {isLoading ? (
          <SectionCard eyebrow="Loading" title="Pulling the latest admin data" description="Please wait a moment while the dashboard catches up." />
        ) : (
          <>
            {activeView === "dashboard" ? (
              <>
                <SectionCard
                  eyebrow="Today"
                  title="NBGS Travel control room"
                  description="See what matters first, then jump into packages, bookings, or visa operations without the clutter."
                  actions={
                    <div className="button-row">
                      <button className="button button--primary" type="button" onClick={() => setActiveView("packages")}>
                        Manage packages
                      </button>
                      <button className="button button--secondary" type="button" onClick={() => setActiveView("bookings")}>
                        Open bookings
                      </button>
                    </div>
                  }
                >
                  <div className="spotlight-grid">
                    <div className="spotlight-copy">
                      <p>
                        Packages, bookings, visa applications, and unfinished forms are already flowing through the custom backend. Use the
                        dashboard as a quick checkpoint, then move into the dedicated work pages for editing and follow-up.
                      </p>
                    </div>
                    <div className="spotlight-visual-panel">
                      <div className="spotlight-card">
                        <span>Need response now</span>
                        <strong>{openBookings + pendingApplications + openLeads}</strong>
                        <p>Open customer items across bookings, visa requests, and unfinished forms.</p>
                      </div>
                      <div className="dashboard-image-stack">
                        {travelGalleryAssets.map((image, index) => (
                          <div key={image} className={`dashboard-image-stack__item dashboard-image-stack__item--${index + 1}`}>
                            <img src={image} alt="" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <section className="stats-grid">
                  <StatCard label="Active bookings" value={summary?.activeBookings || 0} detail="New or contact pending package requests" />
                  <StatCard label="Visa queue" value={summary?.activeVisaApplications || 0} detail="Submitted or payment-pending visa applications" />
                  <StatCard label="Unfinished forms" value={summary?.abandonedLeads || 0} detail="Customers who left before completing a modal" />
                  <StatCard label="Visible reviews" value={summary?.visibleReviews || 0} detail="Reviews currently exposed to the public site" />
                </section>

                <div className="content-grid content-grid--overview">
                  <SectionCard eyebrow="Priority" title="Needs attention" description="The newest items that should be touched first.">
                    <div className="activity-list">
                      {attentionItems.length ? (
                        attentionItems.map((item) => (
                          <article key={item.id} className="activity-item">
                            <div>
                              <strong>{item.title}</strong>
                              <p>{item.description}</p>
                              <span>{item.meta}</span>
                            </div>
                            <div className="activity-item__meta">
                              <StatusBadge status={item.status} />
                              <time>{formatDate(item.when)}</time>
                            </div>
                          </article>
                        ))
                      ) : (
                        <div className="empty-state">No urgent items right now.</div>
                      )}
                    </div>
                  </SectionCard>

                  <SectionCard eyebrow="Timeline" title="Recent activity" description="A quick look at what came in most recently.">
                    <div className="activity-list">
                      {recentActivity.length ? (
                        recentActivity.map((item) => (
                          <article key={item.id} className="activity-item activity-item--simple">
                            <div>
                              <strong>{item.title}</strong>
                              <p>{item.detail}</p>
                            </div>
                            <div className="activity-item__meta">
                              <span className="muted-label">{item.category}</span>
                              <time>{formatDate(item.when)}</time>
                            </div>
                          </article>
                        ))
                      ) : (
                        <div className="empty-state">No submissions have arrived yet.</div>
                      )}
                    </div>
                  </SectionCard>
                </div>

                <section className="module-grid">
                  <article className="module-card">
                    <span className="eyebrow">Catalog</span>
                    <h3>Packages</h3>
                    <p>{publishedPackages} published, {draftPackages} draft.</p>
                    <button className="text-button" type="button" onClick={() => setActiveView("packages")}>
                      Open package list
                    </button>
                  </article>
                  <article className="module-card">
                    <span className="eyebrow">Orders</span>
                    <h3>Bookings</h3>
                    <p>{openBookings} booking leads still need contact or conversion updates.</p>
                    <button className="text-button" type="button" onClick={() => setActiveView("bookings")}>
                      Review booking orders
                    </button>
                  </article>
                  <article className="module-card">
                    <span className="eyebrow">Visa desk</span>
                    <h3>Visa services</h3>
                    <p>{publishedVisas} live offerings and {pendingApplications} active application records.</p>
                    <button className="text-button" type="button" onClick={() => setActiveView("visas")}>
                      Open visa desk
                    </button>
                  </article>
                </section>
              </>
            ) : null}

            {activeView === "packages" ? (
              <>
                <SectionCard
                  eyebrow="Catalog"
                  title="Packages list"
                  description="A cleaner take on the package listing screen, with actions that feel familiar without inheriting the WordPress clutter."
                  actions={
                    <div className="button-row">
                      <button className="button button--primary" type="button" onClick={openCreatePackage}>
                        Add package
                      </button>
                    </div>
                  }
                >
                  <div className="packages-toolbar">
                    <div className="packages-toolbar__filters">
                      <input value={packageSearch} onChange={(event) => setPackageSearch(event.target.value)} placeholder="Search packages" />
                      <select value={packageStatusFilter} onChange={(event) => setPackageStatusFilter(event.target.value)}>
                        <option value="all">All statuses</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div className="packages-toolbar__stats">
                      <span>{filteredPackages.length} package(s)</span>
                    </div>
                  </div>

                  <div className="table-shell">
                    <div className="table-scroll">
                      <table className="admin-table package-table">
                        <thead>
                          <tr>
                            <th>Package</th>
                            <th>Location</th>
                            <th>Price</th>
                            <th>Travel date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPackages.length ? (
                            filteredPackages.map((pkg) => (
                              <tr key={pkg.id}>
                                <td>
                                  <div className="package-row-main">
                                    <img className="record-thumb" src={getPackageImage(pkg)} alt={pkg.title} />
                                    <div className="record-primary">
                                      <strong>{pkg.title}</strong>
                                      <span>{formatLabel(pkg.package_category)}{pkg.adminMeta?.mainTripType ? ` | ${pkg.adminMeta.mainTripType}` : ""}</span>
                                    </div>
                                  </div>
                                  <div className="row-actions">
                                    <button type="button" onClick={() => openEditPackage(pkg)}>Edit</button>
                                    <button type="button" onClick={() => duplicatePackageRecord(pkg)}>Duplicate</button>
                                    <button type="button" onClick={() => handleDeletePackage(pkg)} disabled={deletingPackageId === pkg.id}>
                                      {deletingPackageId === pkg.id ? "Deleting..." : "Delete"}
                                    </button>
                                  </div>
                                </td>
                                <td>{[pkg.destination, pkg.country, pkg.continent].filter(Boolean).join(", ") || "Not set"}</td>
                                <td>
                                  <div className="record-primary record-primary--compact">
                                    <strong>{formatCurrency(pkg.base_price)}</strong>
                                    <span>{formatLabel(pkg.pricing_model)}</span>
                                  </div>
                                </td>
                                <td>{pkg.adminMeta?.travelDateLabel || formatTravelWindow(pkg)}</td>
                                <td><StatusBadge status={pkg.status} /></td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5">
                                <div className="empty-state">No packages match the current search.</div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </SectionCard>
              </>
            ) : null}

            {activeView === "packageEditor" ? (
              <div className="package-editor-layout">
                <form className="package-editor-main" onSubmit={handleCreatePackage}>
                  <SectionCard
                    eyebrow="Overview"
                    title={editingPackageId ? "Edit package" : "Create package"}
                    description="Build the package in larger grouped sections so the important fields breathe."
                    className="section-card--hero"
                    actions={
                      <div className="button-row">
                        <button className="button button--secondary" type="button" onClick={() => setActiveView("packages")}>
                          Back to packages
                        </button>
                        <button className="button button--primary" type="submit" disabled={isSubmittingPackage}>
                          {isSubmittingPackage ? "Saving..." : editingPackageId ? "Save package" : "Create package"}
                        </button>
                      </div>
                    }
                  >
                    <div className="form-grid form-grid--two">
                      <label className="field">
                        <span>Trip name</span>
                        <input value={packageForm.title} onChange={(event) => setPackageForm({ ...packageForm, title: event.target.value })} required />
                      </label>
                      <label className="field">
                        <span>Main trip type</span>
                        <input value={packageForm.mainTripType} onChange={(event) => setPackageForm({ ...packageForm, mainTripType: event.target.value })} placeholder="Luxury, solo, group" />
                      </label>
                      <label className="field">
                        <span>Travel dates label</span>
                        <input value={packageForm.travelDateLabel} onChange={(event) => setPackageForm({ ...packageForm, travelDateLabel: event.target.value })} placeholder="Own travel date or 24 Jul 2026" />
                      </label>
                      <label className="field">
                        <span>Trip type</span>
                        <input value={packageForm.tripType} onChange={(event) => setPackageForm({ ...packageForm, tripType: event.target.value })} placeholder="International group trip" />
                      </label>
                      <label className="field">
                        <span>Country</span>
                        <input value={packageForm.country} onChange={(event) => setPackageForm({ ...packageForm, country: event.target.value })} />
                      </label>
                      <label className="field">
                        <span>Continent</span>
                        <input value={packageForm.continent} onChange={(event) => setPackageForm({ ...packageForm, continent: event.target.value })} />
                      </label>
                      <label className="field">
                        <span>Destination</span>
                        <input value={packageForm.destination} onChange={(event) => setPackageForm({ ...packageForm, destination: event.target.value })} />
                      </label>
                      <label className="field">
                        <span>Category</span>
                        <select value={packageForm.packageCategory} onChange={(event) => setPackageForm({ ...packageForm, packageCategory: event.target.value })}>
                          <option value="package">Package</option>
                          <option value="group_trip">Group trip</option>
                          <option value="solo_trip">Solo trip</option>
                          <option value="custom">Custom</option>
                        </select>
                      </label>
                      <label className="field">
                        <span>Is this a local trip?</span>
                        <select value={packageForm.isLocalTrip ? "yes" : "no"} onChange={(event) => setPackageForm({ ...packageForm, isLocalTrip: event.target.value === "yes" })}>
                          <option value="no">No</option>
                          <option value="yes">Yes</option>
                        </select>
                      </label>
                      <label className="field">
                        <span>Status</span>
                        <select value={packageForm.status} onChange={(event) => setPackageForm({ ...packageForm, status: event.target.value })}>
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </label>
                    </div>
                  </SectionCard>

                  <SectionCard eyebrow="Pricing and travel" title="Price setup" description="Match the package pricing language the sales team already uses." className="section-card--soft">
                    <div className="form-grid form-grid--two">
                      <label className="field">
                        <span>Total price</span>
                        <input type="number" value={packageForm.basePrice} onChange={(event) => setPackageForm({ ...packageForm, basePrice: event.target.value })} required />
                      </label>
                      <label className="field">
                        <span>Deposit R</span>
                        <input type="number" value={packageForm.depositAmount} onChange={(event) => setPackageForm({ ...packageForm, depositAmount: event.target.value })} />
                      </label>
                      <label className="field">
                        <span>Per person / per couple</span>
                        <select value={packageForm.pricingModel} onChange={(event) => setPackageForm({ ...packageForm, pricingModel: event.target.value })}>
                          <option value="per_person_sharing">Per person sharing</option>
                          <option value="per_couple">Per couple</option>
                          <option value="single_supplement">Single supplement</option>
                          <option value="child_rate">Child rate</option>
                          <option value="custom">Custom</option>
                        </select>
                      </label>
                      <label className="field">
                        <span>Nights</span>
                        <input type="number" value={packageForm.nights} onChange={(event) => setPackageForm({ ...packageForm, nights: event.target.value })} />
                      </label>
                      <label className="field">
                        <span>Duration label</span>
                        <input value={packageForm.durationLabel} onChange={(event) => setPackageForm({ ...packageForm, durationLabel: event.target.value })} placeholder="5 nights" />
                      </label>
                      <label className="field">
                        <span>Date of trip</span>
                        <input type="datetime-local" value={packageForm.dateOfTrip} onChange={(event) => setPackageForm({ ...packageForm, dateOfTrip: event.target.value })} />
                      </label>
                    </div>

                    <label className="checkbox-field">
                      <input type="checkbox" checked={packageForm.hasFixedTravelDates} onChange={(event) => setPackageForm({ ...packageForm, hasFixedTravelDates: event.target.checked })} />
                      <span>This package uses specific travel dates</span>
                    </label>

                    {packageForm.hasFixedTravelDates ? (
                      <div className="form-grid form-grid--two">
                        <label className="field">
                          <span>Travel start date</span>
                          <input type="date" value={packageForm.fixedTravelStartDate} onChange={(event) => setPackageForm({ ...packageForm, fixedTravelStartDate: event.target.value })} />
                        </label>
                        <label className="field">
                          <span>Travel end date</span>
                          <input type="date" value={packageForm.fixedTravelEndDate} onChange={(event) => setPackageForm({ ...packageForm, fixedTravelEndDate: event.target.value })} />
                        </label>
                      </div>
                    ) : null}
                  </SectionCard>

                  <SectionCard eyebrow="Story and media" title="Story, media, and policy" description="Upload images directly here and keep the package story together." className="section-card--accent">
                    <div className="form-grid form-grid--two">
                      <label className="field">
                        <span>Bio</span>
                        <textarea rows="4" value={packageForm.bio} onChange={(event) => setPackageForm({ ...packageForm, bio: event.target.value })} />
                      </label>
                      <div className="upload-panel">
                        <span>Background listing image</span>
                        <label className="upload-dropzone">
                          <input type="file" accept="image/*" onChange={handleBackgroundImageUpload} />
                          <strong>{isUploadingBackground ? "Uploading..." : "Upload listing image"}</strong>
                          <span>{packageForm.backgroundListingImage ? "Image uploaded and attached" : "Select a file directly from your computer"}</span>
                        </label>
                      </div>
                    </div>

                    <label className="field">
                      <span>Describe trip or more information</span>
                      <textarea rows="7" value={packageForm.describeTrip} onChange={(event) => setPackageForm({ ...packageForm, describeTrip: event.target.value })} />
                    </label>

                    <div className="form-grid form-grid--two">
                      <label className="field">
                        <span>Trip policy</span>
                        <textarea rows="6" value={packageForm.tripPolicy} onChange={(event) => setPackageForm({ ...packageForm, tripPolicy: event.target.value })} />
                      </label>
                      <div className="form-grid">
                        <div className="upload-panel">
                          <span>Submit a gallery</span>
                          <label className="upload-dropzone upload-dropzone--compact">
                            <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} />
                            <strong>{isUploadingGallery ? "Uploading gallery..." : "Upload gallery images"}</strong>
                            <span>{linesToArray(packageForm.galleryText).length} image(s) attached</span>
                          </label>
                          {linesToArray(packageForm.galleryText).length ? (
                            <div className="upload-chip-list">
                              {linesToArray(packageForm.galleryText).map((item, index) => (
                                <span key={`${item}-${index}`} className="upload-chip">Image {index + 1}</span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        <label className="field">
                          <span>Link to YT</span>
                          <input value={packageForm.youtubeUrl} onChange={(event) => setPackageForm({ ...packageForm, youtubeUrl: event.target.value })} placeholder="https://youtube.com/..." />
                        </label>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard eyebrow="Trip contents" title="Includes and excludes" description="Use plain line-by-line entries so the sales team can update inclusions quickly." className="section-card--plain">
                    <div className="form-grid form-grid--two">
                      <label className="field">
                        <span>Includes</span>
                        <textarea rows="8" value={packageForm.includesText} onChange={(event) => setPackageForm({ ...packageForm, includesText: event.target.value })} placeholder="One inclusion per line" />
                      </label>
                      <label className="field">
                        <span>Excludes</span>
                        <textarea rows="8" value={packageForm.excludesText} onChange={(event) => setPackageForm({ ...packageForm, excludesText: event.target.value })} placeholder="One exclusion per line" />
                      </label>
                    </div>
                  </SectionCard>
                </form>

                <aside className="panel package-editor-sidebar">
                  <div className="package-editor-sidebar__image">
                    <img src={getPackageImageFromForm(packageForm)} alt={packageForm.title || "Package preview"} />
                  </div>
                  <div className="section-heading">
                    <span className="eyebrow">Package preview</span>
                    <h3>{packageForm.title || "Untitled package"}</h3>
                  </div>
                  <div className="preview-stack">
                    <div className="preview-card">
                      <span>Price</span>
                      <strong>{packageForm.basePrice ? formatCurrency(packageForm.basePrice) : "R 0.00"}</strong>
                      <p>{formatLabel(packageForm.pricingModel)}</p>
                    </div>
                    <div className="preview-card">
                      <span>Travel date</span>
                      <strong>{packageForm.travelDateLabel || "Will be shown from fixed dates or booking form"}</strong>
                    </div>
                    <div className="preview-card">
                      <span>Gallery</span>
                      <p>{linesToArray(packageForm.galleryText).length ? `${linesToArray(packageForm.galleryText).length} image(s) uploaded` : "No gallery images yet."}</p>
                    </div>
                    <div className="preview-card">
                      <span>Package notes</span>
                      <p>{packageForm.bio || "No summary added yet."}</p>
                    </div>
                  </div>
                </aside>
              </div>
            ) : null}

            {activeView === "bookings" ? (
              <div className="bookings-layout">
                <SectionCard eyebrow="Orders" title="Booking orders" description="Review incoming package requests and take action without leaving the list.">
                  <div className="table-shell">
                    <div className="table-scroll">
                      <table className="admin-table booking-table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Date</th>
                            <th>Name</th>
                            <th>Mail</th>
                            <th>Phone</th>
                            <th>Travel date</th>
                            <th>Number of persons</th>
                            <th>Tour price</th>
                            <th>Tour name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.length ? (
                            bookings.map((booking) => (
                              <tr key={booking.id} className={selectedBooking?.id === booking.id ? "is-selected" : ""} onClick={() => setSelectedBookingId(booking.id)}>
                                <td>
                                  <div className="record-primary">
                                    <strong>Booking Order #{booking.id}</strong>
                                    <div className="row-actions">
                                      <button type="button" onClick={() => setSelectedBookingId(booking.id)}>View</button>
                                    </div>
                                  </div>
                                </td>
                                <td>{formatDate(booking.submitted_at)}</td>
                                <td>{booking.full_name}</td>
                                <td>{booking.email}</td>
                                <td>{booking.phone_number}</td>
                                <td>{formatDate(booking.preferred_travel_date)}</td>
                                <td>{booking.number_of_persons} Persons</td>
                                <td>{formatCurrency(booking.quoted_total_amount, booking.currency_code)}</td>
                                <td>{booking.package_title}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="9">
                                <div className="empty-state">No bookings have been received yet.</div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </SectionCard>

                <aside className="panel booking-detail-panel">
                  {selectedBooking ? (
                    <>
                      <div className="booking-detail-panel__image">
                        <img src={getBookingImage(selectedBooking, packages)} alt={selectedBooking.package_title} />
                      </div>
                      <div className="section-heading">
                        <span className="eyebrow">Booking detail</span>
                        <h3>Booking Order #{selectedBooking.id}</h3>
                        <p>{selectedBooking.package_title}</p>
                      </div>

                      <div className="booking-customer-chip">
                        <img src={peopleAssets[selectedBooking.id % peopleAssets.length]} alt="" />
                        <div>
                          <strong>{selectedBooking.full_name}</strong>
                          <span>{selectedBooking.phone_number}</span>
                        </div>
                      </div>

                      <div className="detail-grid">
                        <div>
                          <span>Name</span>
                          <strong>{selectedBooking.full_name}</strong>
                        </div>
                        <div>
                          <span>Phone</span>
                          <strong>{selectedBooking.phone_number}</strong>
                        </div>
                        <div>
                          <span>Email</span>
                          <strong>{selectedBooking.email}</strong>
                        </div>
                        <div>
                          <span>Travel date</span>
                          <strong>{formatDate(selectedBooking.preferred_travel_date)}</strong>
                        </div>
                        <div>
                          <span>Persons</span>
                          <strong>{selectedBooking.number_of_persons}</strong>
                        </div>
                        <div>
                          <span>Quoted total</span>
                          <strong>{formatCurrency(selectedBooking.quoted_total_amount, selectedBooking.currency_code)}</strong>
                        </div>
                        <div>
                          <span>Source page</span>
                          <strong>{selectedBooking.source_page_url || "Not captured"}</strong>
                        </div>
                        <div>
                          <span>Status</span>
                          <strong><StatusBadge status={selectedBooking.status} /></strong>
                        </div>
                      </div>

                      <div className="button-row booking-status-actions">
                        <button className="button button--secondary" type="button" disabled={isUpdatingBooking} onClick={() => handleBookingStatusChange("contact_pending")}>
                          Mark contact pending
                        </button>
                        <button className="button button--secondary" type="button" disabled={isUpdatingBooking} onClick={() => handleBookingStatusChange("contacted")}>
                          Mark contacted
                        </button>
                        <button className="button button--primary" type="button" disabled={isUpdatingBooking} onClick={() => handleBookingStatusChange("converted")}>
                          Mark converted
                        </button>
                        <button className="button button--secondary" type="button" disabled={isUpdatingBooking} onClick={() => handleBookingStatusChange("closed")}>
                          Close booking
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="empty-state">Select a booking to view more detail.</div>
                  )}
                </aside>
              </div>
            ) : null}

            {activeView === "visas" ? (
              <>
                <section className="stats-grid">
                  <StatCard label="Visa offerings" value={visas.length} detail="All visa services currently configured" />
                  <StatCard label="Published" value={publishedVisas} detail="Visible on the public visa page" />
                  <StatCard label="Applications" value={applications.length} detail="All stored customer visa requests" />
                  <StatCard label="Payment pending" value={pendingApplications} detail="Applications still waiting on PayFast completion" />
                </section>

                <div className="content-grid content-grid--forms">
                  <SectionCard eyebrow="Create" title="Add a visa offering" description="Set up a new country visa option for the live site.">
                    <form className="admin-form" onSubmit={handleCreateVisa}>
                      <div className="form-grid form-grid--two">
                        <label className="field">
                          <span>Offering title</span>
                          <input value={visaForm.title} onChange={(event) => setVisaForm({ ...visaForm, title: event.target.value })} required />
                        </label>
                        <label className="field">
                          <span>Country</span>
                          <input value={visaForm.country} onChange={(event) => setVisaForm({ ...visaForm, country: event.target.value })} required />
                        </label>
                        <label className="field">
                          <span>Processing time</span>
                          <input value={visaForm.processingTimeLabel} onChange={(event) => setVisaForm({ ...visaForm, processingTimeLabel: event.target.value })} placeholder="5 to 10 working days" />
                        </label>
                        <label className="field">
                          <span>Application fee</span>
                          <input type="number" value={visaForm.applicationFee} onChange={(event) => setVisaForm({ ...visaForm, applicationFee: event.target.value })} required />
                        </label>
                        <label className="field">
                          <span>Status</span>
                          <select value={visaForm.status} onChange={(event) => setVisaForm({ ...visaForm, status: event.target.value })}>
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                          </select>
                        </label>
                      </div>

                      <label className="field">
                        <span>Description</span>
                        <textarea rows="4" value={visaForm.description} onChange={(event) => setVisaForm({ ...visaForm, description: event.target.value })} />
                      </label>

                      <button className="button button--primary" type="submit" disabled={isSubmittingVisa}>
                        {isSubmittingVisa ? "Saving visa..." : "Create visa offering"}
                      </button>
                    </form>
                  </SectionCard>

                  <SectionCard eyebrow="Catalog" title="Available visa services" description="Live and draft visa services currently stored in the system.">
                    <DataTable columns={visaColumns} rows={visas} emptyMessage="No visa offerings have been created yet." />
                  </SectionCard>
                </div>

                <SectionCard eyebrow="Applications" title="Recent visa applications" description="Incoming visa requests tied to customer travel dates and payment state.">
                  <DataTable columns={applicationColumns} rows={applications} emptyMessage="No visa applications have arrived yet." />
                </SectionCard>
              </>
            ) : null}

            {activeView === "unfinished" ? (
              <>
                <section className="stats-grid">
                  <StatCard label="Package bookings" value={bookings.length} detail="All package lead records" />
                  <StatCard label="Visa applications" value={applications.length} detail="All visa submissions" />
                  <StatCard label="Unfinished forms" value={abandonedLeads.length} detail="Saved local-storage exits with phone capture" />
                  <StatCard label="Needs follow-up" value={openBookings + pendingApplications + openLeads} detail="Items still waiting on the team" />
                </section>

                <div className="stack-grid">
                  <SectionCard eyebrow="Recovery" title="Unfinished forms" description="Potential leads captured when a customer left before completing a modal.">
                    <DataTable columns={leadColumns} rows={abandonedLeads} emptyMessage="No abandoned leads have been captured yet." />
                  </SectionCard>
                </div>
              </>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}

function formatCurrency(value, currency = "ZAR") {
  const amount = Number(value || 0);

  try {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency
    }).format(amount);
  } catch (error) {
    return `R ${amount.toLocaleString("en-ZA")}`;
  }
}

function formatDate(value) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function formatLabel(value) {
  return String(value || "")
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatTravelWindow(pkg) {
  if (pkg.fixed_travel_start_date && pkg.fixed_travel_end_date) {
    return `${formatDate(pkg.fixed_travel_start_date)} to ${formatDate(pkg.fixed_travel_end_date)}`;
  }

  return "Own travel date";
}

function buildPackagePayload(form) {
  return {
    title: form.title,
    packageCategory: form.packageCategory,
    destination: form.destination,
    country: form.country,
    continent: form.continent,
    tripType: form.tripType,
    durationLabel: form.durationLabel || (form.nights ? `${form.nights} nights` : ""),
    basePrice: form.basePrice,
    pricingModel: form.pricingModel,
    quotedFromLabel: form.quotedFromLabel,
    depositAmount: form.depositAmount || null,
    hasFixedTravelDates: form.hasFixedTravelDates,
    fixedTravelStartDate: form.fixedTravelStartDate || null,
    fixedTravelEndDate: form.fixedTravelEndDate || null,
    shortDescription: form.bio || form.shortDescription || "",
    fullDescription: form.describeTrip || form.fullDescription || "",
    status: form.status,
    adminMeta: {
      travelDateLabel: form.travelDateLabel || null,
      bio: form.bio || null,
      backgroundListingImage: form.backgroundListingImage || null,
      describeTrip: form.describeTrip || null,
      tripPolicy: form.tripPolicy || null,
      gallery: linesToArray(form.galleryText),
      youtubeUrl: form.youtubeUrl || null,
      nights: form.nights || null,
      dateOfTrip: form.dateOfTrip || null,
      isLocalTrip: form.isLocalTrip,
      mainTripType: form.mainTripType || null,
      includes: linesToArray(form.includesText),
      excludes: linesToArray(form.excludesText)
    }
  };
}

function normalizePackages(rows) {
  return (rows || []).map((pkg) => {
    let parsedMeta = {};

    if (pkg.admin_meta_json) {
      try {
        parsedMeta = typeof pkg.admin_meta_json === "string" ? JSON.parse(pkg.admin_meta_json) : pkg.admin_meta_json;
      } catch (error) {
        parsedMeta = {};
      }
    }

    return {
      ...pkg,
      adminMeta: parsedMeta || {}
    };
  });
}

function createPackageFormFromRecord(pkg) {
  const meta = pkg.adminMeta || {};

  return {
    ...initialPackageForm,
    title: pkg.title || "",
    packageCategory: pkg.package_category || "package",
    destination: pkg.destination || "",
    country: pkg.country || "",
    continent: pkg.continent || "",
    tripType: pkg.trip_type || "",
    durationLabel: pkg.duration_label || "",
    basePrice: pkg.base_price || "",
    pricingModel: pkg.pricing_model || "per_person_sharing",
    quotedFromLabel: pkg.quoted_from_label || "From",
    depositAmount: pkg.deposit_amount || "",
    hasFixedTravelDates: Boolean(pkg.has_fixed_travel_dates),
    fixedTravelStartDate: pkg.fixed_travel_start_date ? String(pkg.fixed_travel_start_date).slice(0, 10) : "",
    fixedTravelEndDate: pkg.fixed_travel_end_date ? String(pkg.fixed_travel_end_date).slice(0, 10) : "",
    shortDescription: pkg.short_description || "",
    fullDescription: pkg.full_description || "",
    status: pkg.status || "draft",
    travelDateLabel: meta.travelDateLabel || "",
    bio: meta.bio || pkg.short_description || "",
    backgroundListingImage: meta.backgroundListingImage || "",
    describeTrip: meta.describeTrip || pkg.full_description || "",
    tripPolicy: meta.tripPolicy || "",
    galleryText: Array.isArray(meta.gallery) ? meta.gallery.join("\n") : "",
    youtubeUrl: meta.youtubeUrl || "",
    nights: meta.nights || "",
    dateOfTrip: meta.dateOfTrip ? String(meta.dateOfTrip).slice(0, 16) : "",
    isLocalTrip: Boolean(meta.isLocalTrip),
    mainTripType: meta.mainTripType || "",
    includesText: Array.isArray(meta.includes) ? meta.includes.join("\n") : "",
    excludesText: Array.isArray(meta.excludes) ? meta.excludes.join("\n") : ""
  };
}

function linesToArray(value) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getPackageImage(pkg) {
  const adminImage = pkg?.adminMeta?.backgroundListingImage;

  if (adminImage) {
    return adminImage;
  }

  return travelGalleryAssets[Number(pkg?.id || 0) % travelGalleryAssets.length];
}

function getPackageImageFromForm(form) {
  if (form.backgroundListingImage) {
    return form.backgroundListingImage;
  }

  return travelGalleryAssets[0];
}

function getBookingImage(booking, packages) {
  const matchedPackage = packages.find((pkg) => pkg.id === booking.package_id);
  return getPackageImage(matchedPackage || booking);
}
