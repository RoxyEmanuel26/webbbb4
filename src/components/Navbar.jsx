import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  const navLinks = [
    { label: 'New Videos', path: '/' },
    { label: 'Top Rated', path: '/search?order=top-rated' },
    { label: 'Most Viewed', path: '/search?order=most-popular' },
    { label: 'Categories', path: '#' },
    { label: 'Collections', path: '#' },
    { label: 'Pornstars', path: '#' },
    { label: 'Download', path: '#' },
  ];

  return (
    <header className="navbar-wrapper">
      <div className="navbar-top">
        <div className="container navbar-container">
          <Link to="/" className="navbar-brand">
            <Heart size={24} color="var(--primary)" fill="var(--primary)" className="brand-icon" />
            <span className="brand-text">PORNAPI</span>
          </Link>
          
          <div className="search-container">
            <form className="search-form" onSubmit={handleSearch}>
              <input 
                type="text" 
                placeholder="Search" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" aria-label="Search">
                <Search size={18} />
              </button>
            </form>
          </div>

          <div className="navbar-right-placeholder">
            {/* EN, Register, Login removed as requested */}
          </div>
        </div>
      </div>
      
      <div className="navbar-bottom">
        <div className="container subnav-container">
          {navLinks.map((link, idx) => (
            <Link 
              key={idx} 
              to={link.path} 
              className={`subnav-link ${location.pathname === link.path || (location.pathname === '/' && link.label === 'New Videos') ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
