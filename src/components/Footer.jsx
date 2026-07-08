import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Flame, ExternalLink } from 'lucide-react';
import './Footer.css';

const HOT_SEARCHES = [
  'teen', 'milf', 'anal', 'lesbian', 'threesome', 'pov', 'solo',
  'amateur', 'hardcore', 'blowjob', 'creampie', 'asian', 'latina', 'bbw'
];

const Footer = () => (
  <footer className="site-footer" role="contentinfo">
    <div className="page-wrapper footer-inner">

      {/* Top: Hot Searches */}
      <div className="footer-hot">
        <span className="footer-hot-label">
          <Flame size={14} aria-hidden="true" /> Hot Searches:
        </span>
        <div className="footer-hot-tags">
          {HOT_SEARCHES.map(tag => (
            <Link
              key={tag}
              to={`/search?query=${encodeURIComponent(tag)}`}
              className="footer-tag"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>

      <hr className="footer-divider" />

      {/* Middle: Brand + SEO Text */}
      <div className="footer-body">
        <div className="footer-brand-col">
          <Link to="/" className="footer-brand">
            <Heart size={18} fill="var(--color-accent)" color="var(--color-accent)" />
            <span>PORNAPI</span>
          </Link>
          <p className="footer-brand-desc">
            Your premium destination for free HD adult entertainment.
            100,000+ videos updated daily. Fast streaming on all devices.
          </p>
        </div>

        <div className="footer-links-col">
          <h3 className="footer-col-heading">Browse</h3>
          <nav>
            <Link to="/?order=latest"       className="footer-nav-link">Latest Videos</Link>
            <Link to="/?order=top-rated"    className="footer-nav-link">Top Rated</Link>
            <Link to="/?order=most-popular" className="footer-nav-link">Most Popular</Link>
            <Link to="/?order=top-weekly"   className="footer-nav-link">Top This Week</Link>
            <Link to="/?order=top-monthly"  className="footer-nav-link">Top This Month</Link>
          </nav>
        </div>

        <div className="footer-links-col">
          <h3 className="footer-col-heading">Legal</h3>
          <nav>
            <Link to="/terms"    className="footer-nav-link">Terms of Service</Link>
            <Link to="/privacy"  className="footer-nav-link">Privacy Policy</Link>
            <Link to="/dmca"     className="footer-nav-link">DMCA</Link>
            <Link to="/usc2257"  className="footer-nav-link">18 U.S.C. 2257</Link>
          </nav>
        </div>
      </div>

      <hr className="footer-divider" />

      {/* Bottom: Copyright */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          © {new Date().getFullYear()} PORNAPI. All rights reserved.
          All models appearing on this website are 18 years of age or older.
        </p>
        <p className="footer-disclaimer">
          This site is powered by the <strong>Eporner API v2</strong> and contains
          adult content intended for mature audiences only.
        </p>
      </div>

    </div>
  </footer>
);

export default Footer;
