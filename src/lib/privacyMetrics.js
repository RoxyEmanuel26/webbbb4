'use client';

const METRICS_KEY = 'nicevx_metrics_v1';

export function trackLocalEvent(eventName) {
  if (typeof window === 'undefined') return;
  try {
    const allowed = new Set(['page_view', 'play_start', 'related_click', 'return_visit']);
    if (!allowed.has(eventName)) return;
    const day = new Date().toISOString().slice(0, 10);
    const stored = JSON.parse(localStorage.getItem(METRICS_KEY) || '{}');
    stored[day] = stored[day] || {};
    stored[day][eventName] = (stored[day][eventName] || 0) + 1;
    const days = Object.keys(stored).sort().slice(-31);
    localStorage.setItem(METRICS_KEY, JSON.stringify(Object.fromEntries(days.map((key) => [key, stored[key]]))));
    window.dispatchEvent(new CustomEvent('nicevx:metric', { detail: { event: eventName } }));
  } catch (_) {}
}

export function recordVisit() {
  if (typeof window === 'undefined') return;
  try {
    const lastVisit = localStorage.getItem('nicevx_last_visit');
    trackLocalEvent(lastVisit ? 'return_visit' : 'page_view');
    localStorage.setItem('nicevx_last_visit', new Date().toISOString());
  } catch (_) {}
}
