import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Heart } from 'lucide-react';
import './Footer.css';

const HOT_SEARCHES = [
  'mom son', 'indian wife', 'cuckold', 'indian', 'anal', 'chinese', 'shemale', 'pov girl', 'threesome', 'solo', 'fendom', 'pissing', 'facefuck', 'pov', 'j-mac'
];

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        
        <div className="hot-search-section">
          <h3 className="hot-search-title">
            <Flame size={16} color="var(--primary)" /> HOT SEARCH
          </h3>
          <div className="hot-search-tags">
            {HOT_SEARCHES.map((tag, idx) => (
              <Link key={idx} to={`/search?query=${tag}`} className="hot-tag">
                {tag}
              </Link>
            ))}
          </div>
        </div>

        <div className="seo-text-section">
          <h2>Handpicked Adult Videos in FHD, 4K & Free API</h2>
          <p>
            Welcome to <strong>PORN-API.COM</strong>. Explore a carefully curated library of premium adult movies, trending scenes, and high-quality releases selected for viewers who want fast streaming, sharp visuals, and content that hits hard. Browse fresh updates, popular categories, top performers, and standout studios in smooth FHD and 4K quality.
          </p>
          <p>
            Every video is organized for quick discovery on desktop and mobile, with clean browsing, fast playback, and a constantly refreshed catalog of adult entertainment. From viral picks to niche collections, we bring together powerful recommendations and selected movies so you can find the right scene without wasting time.
          </p>
          <p>
            We also provide a <strong>Free Public API</strong> for developers and third-party apps. Access movies, categories, pornstars, metadata, and more through a simple REST API with an API key, then build your own integrations, tools, or content-powered services.
          </p>
        </div>

        <div className="footer-bottom-nav">
          <Link to="/terms">TERMS</Link>
          <Link to="/privacy">PRIVACY</Link>
          <Link to="/dmca">DMCA</Link>
          <Link to="#">CONTACT</Link>
          <Link to="/usc2257">18 U.S.C. 2257</Link>
        </div>

        <div className="footer-logo">
          <Heart size={20} color="var(--primary)" fill="var(--primary)" className="brand-icon" />
          <span className="brand-text">PORNAPI</span>
        </div>

        <div className="footer-copyright">
          &copy; {new Date().getFullYear()} All rights reserved. All models were 18 years of age or older.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
