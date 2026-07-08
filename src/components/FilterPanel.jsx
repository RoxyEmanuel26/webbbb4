import React from 'react';
import './FilterPanel.css';

const FilterPanel = ({ order, onOrderChange, totalCount }) => {
  return (
    <div className="filter-controls">
      {totalCount !== undefined && totalCount > 0 && (
        <span className="results-count">
          {totalCount.toLocaleString()} results found
        </span>
      )}
      <select
        id="sortOrder"
        value={order}
        onChange={(e) => onOrderChange(e.target.value)}
        className="sort-select"
      >
        <option value="latest">Latest</option>
        <option value="longest">Longest</option>
        <option value="shortest">Shortest</option>
        <option value="top-rated">Top Rated</option>
        <option value="most-popular">Most Popular</option>
        <option value="top-weekly">Top Weekly</option>
        <option value="top-monthly">Top Monthly</option>
      </select>
    </div>
  );
};

export default FilterPanel;
