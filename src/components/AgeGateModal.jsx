"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import "./AgeGateModal.css";

const NON_EXPLICIT_EXEMPT_PREFIXES = [
  "/about",
  "/cats",
  "/privacy",
  "/terms",
  "/dmca",
  "/usc2257",
  "/content-sources",
  "/editorial-policy",
  "/report",
];

const AGE_VERIFIED_EVENT = "nicevx:age-verified";

const AgeGateModal = () => {
  const pathname = usePathname() || "/";
  const [isOpen, setIsOpen] = useState(false);

  const isExemptRoute = NON_EXPLICIT_EXEMPT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  useEffect(() => {
    try {
      if (localStorage.getItem("ageVerified") !== "true") {
        setIsOpen(true);
      }
    } catch (_) {}

    const handleVerified = () => setIsOpen(false);
    window.addEventListener(AGE_VERIFIED_EVENT, handleVerified);
    return () => window.removeEventListener(AGE_VERIFIED_EVENT, handleVerified);
  }, []);

  const handleConfirm = () => {
    try {
      localStorage.setItem("ageVerified", "true");
    } catch (_) {}
    setIsOpen(false);
    window.dispatchEvent(new Event(AGE_VERIFIED_EVENT));
  };

  const handleDeny = () => {
    window.location.href = "https://www.google.com";
  };

  if (!isOpen || isExemptRoute) return null;

  return (
    <aside
      className="age-gate-bar"
      role="dialog"
      aria-label="18+ Age Verification Notice"
    >
      <div className="age-gate-bar-inner">
        <div className="age-gate-copy">
          <strong>18+ Adults Only</strong>
          <span>
            This site indexes adult material for mature audiences aged 18 and over.
          </span>
        </div>
        <div className="age-gate-actions">
          <button type="button" onClick={handleConfirm} className="btn-primary">
            I am 18+
          </button>
          <button type="button" onClick={handleDeny} className="btn-secondary">
            Exit
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AgeGateModal;
