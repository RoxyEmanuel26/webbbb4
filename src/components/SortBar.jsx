"use client";

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Clock } from 'lucide-react';
import './SortBar.css';

const DURATION_OPTIONS = [
  { value: 'all',    label: 'All Lengths' },
  { value: 'short',  label: '< 10 min' },
  { value: 'medium', label: '10–25 min' },
  { value: 'long',   label: '25+ min' },
];

const SortBar = ({ value, options, showDuration = true }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentDuration = searchParams.get('duration') || 'all';

  const handleSortChange = (optValue) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('order', optValue);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDurationChange = (durValue) => {
    const params = new URLSearchParams(searchParams.toString());
    if (durValue === 'all') {
      params.delete('duration');
    } else {
      params.set('duration', durValue);
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="filter-toolbar">
      <div className="sort-bar" role="group" aria-label="Sort videos">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`sort-btn ${value === opt.value ? 'is-active' : ''}`}
            onClick={() => handleSortChange(opt.value)}
            aria-pressed={value === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {showDuration && (
        <div className="duration-bar" role="group" aria-label="Filter by duration">
          <span className="duration-label" aria-hidden="true" title="Filter by duration">
            <Clock size={12} />
          </span>
          {DURATION_OPTIONS.map((dur) => (
            <button
              key={dur.value}
              type="button"
              className={`duration-btn ${currentDuration === dur.value ? 'is-active' : ''}`}
              onClick={() => handleDurationChange(dur.value)}
              aria-pressed={currentDuration === dur.value}
            >
              {dur.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortBar;