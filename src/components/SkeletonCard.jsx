import React from 'react';
import './VideoCard.css'; // Inherit layout classes
import './SkeletonCard.css';

const SkeletonCard = () => {
  return (
    <div className="vcard skeleton-card">
      <div className="vcard__thumb-wrap skeleton-thumb skeleton-pulse">
      </div>
      <div className="vcard__info">
        <div className="skeleton-title-line skeleton-pulse"></div>
        <div className="skeleton-title-line short skeleton-pulse"></div>
        <div className="vcard__meta skeleton-meta">
          <div className="skeleton-meta-item skeleton-pulse"></div>
          <div className="skeleton-meta-item skeleton-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
