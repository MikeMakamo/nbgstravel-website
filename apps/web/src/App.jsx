import React from "react";
import { Routes, Route } from "react-router-dom";
import { SiteLayout } from "./components/layout/SiteLayout.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { PackagesPage } from "./pages/PackagesPage.jsx";
import { PackageDetailPage } from "./pages/PackageDetailPage.jsx";
import { VisaPage } from "./pages/VisaPage.jsx";
import { AboutPage } from "./pages/AboutPage.jsx";
import { ContactPage } from "./pages/ContactPage.jsx";
import { PaymentStatusPage } from "./pages/PaymentStatusPage.jsx";
import { ServicesPage } from "./pages/ServicesPage.jsx";
import { GroupTripsPage } from "./pages/GroupTripsPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/packages/:slug" element={<PackageDetailPage />} />
        <Route path="/group-trips" element={<GroupTripsPage />} />
        <Route path="/visa" element={<VisaPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/visa/payment-complete" element={<PaymentStatusPage status="success" />} />
        <Route path="/visa/payment-cancelled" element={<PaymentStatusPage status="cancelled" />} />
      </Route>
    </Routes>
  );
}
