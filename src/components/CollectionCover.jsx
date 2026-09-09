"use client";

import { useState } from "react";

export default function CollectionCover({ cover, name, priority = false }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(cover?.thumbnail) && !failed;

  return (
    <div className="collection-cover">
      <div className="collection-cover-fallback" aria-hidden="true">
        <img src="/logo.webp" alt="" width="56" height="56" />
        <span>NICEVX</span>
      </div>
      {showImage && (
        <img
          className="collection-cover-image"
          src={cover.thumbnail}
          alt={`${name} collection preview`}
          width="480"
          height="270"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
      <div className="collection-cover-overlay" />
    </div>
  );
}
