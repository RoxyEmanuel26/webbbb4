import React from 'react';
import './SortBar.css';

const SortBar = ({ value, options, onChange }) => {
  return (
    <div className="sort-bar">
      {options.map(opt => (
        <button
          key={opt.value}
          className={`sort-btn ${value === opt.value ? 'is-active' : ''}`}
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default SortBar;
