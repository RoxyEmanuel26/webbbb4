"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Clock, Star, Flame, Film, TrendingUp, Calendar } from "lucide-react";
import "./SortBar.css";

const ICON_MAP = {
  latest: Clock,
  "top-rated": Star,
  "most-popular": Flame,
  longest: Film,
  "top-weekly": TrendingUp,
  "top-monthly": Calendar,
};

const DURATION_OPTIONS = [
  { value: "all", label: "All Lengths" },
  { value: "short", label: "< 10m" },
  { value: "medium", label: "10–25m" },
  { value: "long", label: "25m+" },
];

const SortBar = ({
  value,
  options,
  showDuration = true,
  currentDuration = "all",
  currentSearch = "",
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const buildParams = () =>
    new URLSearchParams(
      currentSearch || (typeof window !== "undefined" ? window.location.search : "")
    );

  const handleSortChange = (optValue) => {
    const params = buildParams();
    params.set("order", optValue);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDurationChange = (durValue) => {
    const params = buildParams();
    if (durValue === "all") {
      params.delete("duration");
    } else {
      params.set("duration", durValue);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="filter-toolbar">
      <div className="sort-bar" role="group" aria-label="Sort videos">
        {options.map((opt) => {
          const Icon = ICON_MAP[opt.value];
          return (
            <button
              key={opt.value}
              type="button"
              className={`sort-btn ${value === opt.value ? "is-active" : ""}`}
              onClick={() => handleSortChange(opt.value)}
              aria-pressed={value === opt.value}
            >
              {Icon && <Icon size={13} strokeWidth={2} aria-hidden="true" />}
              <span>{opt.label}</span>
            </button>
          );
        })}
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
              className={`duration-btn ${currentDuration === dur.value ? "is-active" : ""}`}
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
