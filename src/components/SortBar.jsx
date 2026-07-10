"use client";

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import './SortBar.css';

const SortBar = ({ value, options }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (optValue) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('order', optValue);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="sort-bar">
      {options.map(opt => (
        <button
          key={opt.value}
          className={`sort-btn ${value === opt.value ? 'is-active' : ''}`}
          onClick={() => handleSortChange(opt.value)}
          aria-pressed={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default SortBar;
