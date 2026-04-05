import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const navItems = [
  { to: "/", label: "HOME" },
  { to: "/about", label: "ABOUT" },
  {
    to: "/services",
    label: "SERVICES",
    children: [
      { to: "/services", label: "All Services" },
      { to: "/visa", label: "Visa Services" }
    ]
  },
  {
    to: "/packages",
    label: "PACKAGES",
    children: [
      { to: "/packages", label: "Travel Packages" },
      { to: "/group-trips", label: "Group Trips" }
    ]
  },
  { to: "/group-trips", label: "GROUP TRIPS" },
  { to: "/visa", label: "VISA" },
  { to: "/contact", label: "CONTACT US" }
];

const socialLinks = [
  {
    href: "https://www.facebook.com/nbgstravel/",
    label: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13.5 22v-8.1h2.7l.4-3.2h-3.1V8.6c0-.9.2-1.5 1.5-1.5H16.7V4.2c-.3 0-1.2-.2-2.4-.2-2.4 0-4.1 1.5-4.1 4.2v2.4H7.5v3.2h2.7V22h3.3Z" />
      </svg>
    )
  },
  {
    href: "https://www.instagram.com/nbgs_travelza/",
    label: "Instagram",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.6 3h8.8A4.6 4.6 0 0 1 21 7.6v8.8a4.6 4.6 0 0 1-4.6 4.6H7.6A4.6 4.6 0 0 1 3 16.4V7.6A4.6 4.6 0 0 1 7.6 3Zm0 1.9A2.7 2.7 0 0 0 4.9 7.6v8.8a2.7 2.7 0 0 0 2.7 2.7h8.8a2.7 2.7 0 0 0 2.7-2.7V7.6a2.7 2.7 0 0 0-2.7-2.7H7.6Zm9.4 1.4a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.9a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Z" />
      </svg>
    )
  },
  {
    href: "https://api.whatsapp.com/send/?phone=27798377302",
    label: "WhatsApp",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3a8.8 8.8 0 0 0-7.6 13.4L3 21l4.7-1.2A8.8 8.8 0 1 0 12 3Zm0 15.8c-1.3 0-2.5-.3-3.6-1l-.3-.2-2.8.7.8-2.7-.2-.3a6.9 6.9 0 1 1 6.1 3.5Zm3.8-5.2c-.2-.1-1.2-.6-1.4-.7-.2-.1-.3-.1-.5.1l-.7.8c-.1.1-.3.2-.5.1a5.8 5.8 0 0 1-2.9-2.6c-.1-.2 0-.3.1-.5l.5-.6.1-.3-.1-.3-.6-1.4c-.1-.3-.3-.3-.5-.3h-.4c-.1 0-.3.1-.4.2-.4.4-.7 1-.7 1.6 0 .6.4 1.2.5 1.4.1.2 1.1 1.8 2.8 2.6 1.6.8 1.9.7 2.3.7.4 0 1.2-.5 1.4-.9.2-.4.2-.8.1-.9-.1-.1-.3-.1-.5-.2Z" />
      </svg>
    )
  }
];

function isItemActive(pathname, item) {
  if (item.to === "/") return pathname === "/";
  if (pathname === item.to) return true;
  if (pathname.startsWith(`${item.to}/`)) return true;
  return Boolean(item.children?.some((child) => pathname === child.to || pathname.startsWith(`${child.to}/`)));
}

export function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSections, setOpenSections] = useState({});

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const nextOpenSections = {};
    navItems.forEach((item) => {
      if (item.children?.length && isItemActive(location.pathname, item)) {
        nextOpenSections[item.label] = true;
      }
    });
    setOpenSections((current) => ({ ...current, ...nextOpenSections }));
  }, [location.pathname]);

  function toggleSection(label) {
    setOpenSections((current) => ({
      ...current,
      [label]: !current[label]
    }));
  }

  return (
    <>
      <header className="site-header">
        <div className="container header-grid">
          <div className="header-brand">
            <NavLink to="/" className="brand-lockup" aria-label="NBGS Travel home">
              <img src="/assets/images/main logo.png" alt="NBGS Travel" className="brand-logo" />
            </NavLink>
          </div>

          <nav className="site-nav" aria-label="Primary">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  isActive || isItemActive(location.pathname, item) ? "nav-link active" : "nav-link"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-socials" aria-label="Social links">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label}
                className="social-link"
              >
                {link.icon}
              </a>
            ))}
          </div>

          <button
            type="button"
            className={`mobile-menu-toggle${isMobileMenuOpen ? " is-open" : ""}`}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-drawer"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div
        className={`mobile-menu-overlay${isMobileMenuOpen ? " is-open" : ""}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden={isMobileMenuOpen ? "false" : "true"}
      />

      <aside
        id="mobile-drawer"
        className={`mobile-menu-drawer${isMobileMenuOpen ? " is-open" : ""}`}
        aria-hidden={isMobileMenuOpen ? "false" : "true"}
      >
        <div className="mobile-drawer-header">
          <img src="/assets/images/main logo.png" alt="NBGS Travel" className="mobile-drawer-logo" />
          <button
            type="button"
            className="mobile-drawer-close"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <nav className="mobile-nav" aria-label="Mobile">
          {navItems.map((item) => {
            const active = isItemActive(location.pathname, item);
            const sectionOpen = Boolean(openSections[item.label]);

            return (
              <div key={item.to} className={`mobile-nav-item${active ? " active" : ""}`}>
                <div className="mobile-nav-row">
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      isActive || active ? "mobile-nav-link active" : "mobile-nav-link"
                    }
                  >
                    {item.label}
                  </NavLink>

                  {item.children?.length ? (
                    <button
                      type="button"
                      className={`mobile-submenu-toggle${sectionOpen ? " is-open" : ""}`}
                      onClick={() => toggleSection(item.label)}
                      aria-expanded={sectionOpen}
                      aria-label={`Toggle ${item.label.toLowerCase()} submenu`}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m9 6 6 6-6 6" />
                      </svg>
                    </button>
                  ) : null}
                </div>

                {item.children?.length ? (
                  <div className={`mobile-submenu${sectionOpen ? " is-open" : ""}`}>
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        end
                        className={({ isActive }) =>
                          isActive ? "mobile-submenu-link active" : "mobile-submenu-link"
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="mobile-drawer-socials">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              aria-label={link.label}
              className="social-link"
            >
              {link.icon}
            </a>
          ))}
        </div>
      </aside>
    </>
  );
}
