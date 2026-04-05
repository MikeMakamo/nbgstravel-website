import React from "react";
import { Outlet } from "react-router-dom";
import { Footer } from "./Footer.jsx";
import { Header } from "./Header.jsx";

export function SiteLayout() {
  return (
    <div className="site-shell">
      <Header />

      <main>
        <Outlet />
      </main>

      <a
        href="https://api.whatsapp.com/send/?phone=27798377302"
        className="whatsapp-fab"
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
      >
        whatsapp
      </a>

      <Footer />
    </div>
  );
}
