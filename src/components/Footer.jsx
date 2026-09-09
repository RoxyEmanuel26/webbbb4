import React from "react";
import Link from "next/link";
import { Flame, ExternalLink } from "lucide-react";
import "./Footer.css";

const HOT_SEARCHES = [
  "japanese",
  "amateur",
  "lesbian",
  "milf",
  "asian",
  "interracial",
  "big-tits",
  "masturbation",
  "anal",
  "pov",
  "mature",
  "threesome",
].map((slug) => ({
  label: slug.replace("-", " "),
  href: `/collections/${slug}`,
}));

const Footer = () => (
  <footer className="site-footer" role="contentinfo">
    <div className="page-wrapper footer-inner">
      {/* Top: Hot Searches */}
      <div className="footer-hot">
        <span className="footer-hot-label">
          <Flame size={14} aria-hidden="true" /> Hot Categories:
        </span>
        <div className="footer-hot-tags">
          {HOT_SEARCHES.map((tag) => (
            <Link key={tag.href} href={tag.href} className="footer-tag">
              {tag.label}
            </Link>
          ))}
        </div>
      </div>

      <hr className="footer-divider" />

      {/* Middle: Brand + SEO Text */}
      <div className="footer-body">
        <div className="footer-brand-col">
          <Link href="/" className="footer-brand">
            <div className="footer-logo-mark">
              <div className="footer-icon-glow"></div>
              <img
                src="/logo.webp"
                alt="Logo"
                width="36"
                height="36"
                style={{
                  position: "relative",
                  zIndex: 1,
                  objectFit: "contain",
                }}
              />
            </div>
            <div className="footer-brand-text">
              <span className="footer-text-nice">NICE</span>
              <span className="footer-text-vx">VX</span>
            </div>
          </Link>
          <p className="footer-brand-desc">
            Browse adult videos by category, save favorites on your device, and
            discover something new. Videos play through Eporner.
          </p>
        </div>

        <div className="footer-links-col">
          <h3 className="footer-col-heading">Browse</h3>
          <nav>
            <Link href="/?order=latest" className="footer-nav-link">
              Latest Videos
            </Link>
            <Link href="/?order=top-rated" className="footer-nav-link">
              Top Rated
            </Link>
            <Link href="/?order=most-popular" className="footer-nav-link">
              Most Popular
            </Link>
            <Link href="/?order=top-weekly" className="footer-nav-link">
              Top This Week
            </Link>
            <Link href="/?order=top-monthly" className="footer-nav-link">
              Top This Month
            </Link>
          </nav>
        </div>

        <div className="footer-links-col">
          <h3 className="footer-col-heading">Legal</h3>
          <nav>
            <Link href="/terms" className="footer-nav-link">
              Terms of Service
            </Link>
            <Link href="/privacy" className="footer-nav-link">
              Privacy Policy
            </Link>
            <Link href="/dmca" className="footer-nav-link">
              DMCA
            </Link>
            <Link href="/usc2257" className="footer-nav-link">
              18 U.S.C. 2257
            </Link>
            <Link href="/report" className="footer-nav-link">
              Report Content
            </Link>
          </nav>
        </div>
        <div className="footer-links-col">
          <h3 className="footer-col-heading">NICEVX</h3>
          <nav>
            <Link href="/about" className="footer-nav-link">
              About
            </Link>
            <Link href="/content-sources" className="footer-nav-link">
              Content Sources
            </Link>
            <Link href="/editorial-policy" className="footer-nav-link">
              Editorial Policy
            </Link>
          </nav>
        </div>
        <div className="footer-links-col">
          <h3 className="footer-col-heading">More Sites</h3>
          <nav aria-label="More websites">
            <a
              href="https://www.missav-j.com/en"
              className="footer-nav-link footer-external-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Free JAV <ExternalLink size={13} aria-hidden="true" />
            </a>
            <a
              href="https://www.lusthub.web.id/"
              className="footer-nav-link footer-external-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Alternatif Link <ExternalLink size={13} aria-hidden="true" />
            </a>
          </nav>
        </div>
      </div>

      <hr className="footer-divider" />

      {/* Bottom: Copyright */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          © {new Date().getFullYear()} NICEVX. All rights reserved.
          <br />
          All models appearing on this website are 18 years of age or older.
        </p>
        <p className="footer-disclaimer">
          Videos are provided by <strong>Eporner</strong>. This website is for
          adults only.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
