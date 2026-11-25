"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Star, Film, Heart } from "lucide-react";
import "./MobileBottomNav.css";

const MOBILE_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Categories", href: "/cats", icon: LayoutGrid },
  { label: "Stars", href: "/pornstars", icon: Star },
  { label: "Movies", href: "/movies", icon: Film },
  { label: "Saved", href: "/saved", icon: Heart, nofollow: true },
];

export default function MobileBottomNav() {
  const pathname = usePathname() || "/";

  const isActive = (href) => {
    if (href === "/") return pathname === "/" || /^\/(de|fr|es|it)$/.test(pathname);
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {MOBILE_ITEMS.map(({ label, href, icon: Icon, nofollow }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            prefetch={false}
            rel={nofollow ? "nofollow" : undefined}
            className={`mobile-nav-item ${active ? "is-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={19} strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
