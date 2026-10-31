# CHANGELOG SEO: NICEVX Overhaul (2026-10-31)

Comprehensive log of all architectural, on-page, structured data, performance, and editorial optimizations applied to **nicevx.com** (`https://www.nicevx.com/`) to recover and maximize search engine rankings, indexing rates, and organic traffic.

---

## 1. Crawling & Indexing Architecture (Phase 1)

- **Landing Hub Eligibility Engine (`src/lib/hubs.js`)**:
  - Implemented dynamic signal pre-indexing for 44 major categories in `curated-video-catalog.json`.
  - Defined minimum indexing threshold (`MIN_HUB_VIDEOS = 12`).
  - Qualified categories (≥12 catalog videos) are set to `robots: { index: true, follow: true, googleBot: ... }`.
  - Thin categories (<12 videos) cleanly return `robots: { index: false, follow: true }` to protect site crawl budget and eliminate soft 404 / thin content penalties.
- **Server-Side Video Links Rendering**:
  - `src/app/cat/[catName]/page.jsx`: Server-renders top 36 catalog videos (`VideoCard` with `<a href="/video/...">`), providing 72 internal crawl paths in the raw HTML before client hydration.
  - `src/app/tag/[tagName]/page.jsx`: Server-renders matching catalog videos while retaining `noindex, follow`.
- **HTML Landmark & Accessibility Fixes**:
  - Fixed nested `<main>` landmarks across `layout.jsx`, `page.jsx`, `cat/[catName]/page.jsx`, `collections/[slug]/page.jsx`, `collections/page.jsx`, `saved/page.jsx`, `trends/weekly/page.jsx`, and `not-found.jsx`. Exactly one `<main id="main-content" className="site-main">` is now present globally.
- **Elimination of 308 Redirects**:
  - Corrected category link paths in `src/components/Navbar.jsx` from `/cats/` to `/cats`.
- **Search Engine Discovery & Sitemaps**:
  - `public/robots.txt`: Added disallow rule for `/saved` (user history/bookmarks) and explicitly allowed modern AI bots (`GPTBot`, `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot`).
  - `public/sitemaps/sitemap-categories.xml`: Dedicated sitemap containing the 44 indexable category hubs with factual `lastmod` dates.
  - `public/sitemaps/sitemap-static.xml`: Updated to index the 13 approved collection hubs and primary static pages.
  - `public/sitemap.xml`: Sitemap index referencing `sitemap-static.xml`, `sitemap-categories.xml`, and `sitemap-videos-*.xml`.
  - Added IndexNow support: `public/41e428d022b7405f8899fa0e89104081.txt`, `scripts/indexnow.cjs`, and `npm run indexnow`.

---

## 2. Metadata & On-Page Content (Phase 2)

- **Title & Description Optimization**:
  - Titles standardized to 50–60 characters; meta descriptions standardized to 120–155 characters.
  - Removed spammy generic year suffixes and hash characters (`#`).
  - **Homepage**: `Free HD Porn Videos & Curated Collections | NICEVX` (54 chars) with clear H1: `Free HD adult videos, curated daily`.
  - **Video Pages**: Dynamic title formatter with fallback (`{Title} – {Category} | NICEVX` or `{Title}... | NICEVX`), meta description (120–155 chars) including verified runtime.
  - **Category Hubs**: `{Category} Porn Videos – Free HD Clips | NICEVX` with stats bar (verified video count, median duration, HD share) and introductory editorial copy.
  - **Collection Pages**: `{Name} Videos – Curated Collection | NICEVX`.
  - **Legal & Compliance Pages**: Unique, factual titles and meta descriptions for `/about`, `/content-sources`, `/editorial-policy`, `/dmca`, `/privacy`, `/report`, `/terms`, and `/usc2257`.
- **Helpful 404 Page (`src/app/not-found.jsx`)**:
  - Custom error page featuring 12 popular category shortcut links, search guidance, and home navigation to eliminate bounce rate from broken links.

---

## 3. Structured Data JSON-LD (Phase 3)

- **Centralized Schema Library (`src/lib/jsonld.js`)**:
  - `websiteSchema()`: Clean `WebSite` schema with `SearchAction` (restricted exclusively to homepage).
  - `organizationSchema()`: Official `Organization` entity for NICEVX.
  - `breadcrumbListSchema()`: 3-tier hierarchical breadcrumbs without trailing slashes.
  - `videoObjectSchema()`: Complete Schema.org `VideoObject` with ISO 8601 durations (`PT...M...S`), thumbnail array, `uploadDate`, `url`, `isFamilyFriendly: false`, `genre`, `keywords`, and `interactionStatistic`.
  - `itemListSchema()`: Structured `ItemList` for category hubs and collection pages.
- **Reusable Component (`src/components/JsonLd.jsx`)**:
  - Escapes `<` to `\u003c` to protect against HTML entity injection and XSS vulnerabilities.
- **Elimination of Conflicting Schemas**:
  - Removed global `websiteSchema` from `src/app/layout.jsx` so child pages do not declare root search actions.
  - Removed redundant client-rendered `<script type="application/ld+json">` from `src/components/SearchResultsShared.jsx`.
- **Automated Validation (`scripts/test-jsonld.cjs`)**:
  - Added `npm run test:jsonld` to package scripts to ensure all HTML outputs validate against Schema.org standards.

---

## 4. Performance & Core Web Vitals (Phase 4)

- **Video Player Facade (`src/components/VideoPlayerFacade.jsx`)**:
  - Eliminated initial-load Eporner iframe. Pages now render an instant, lightweight video poster thumbnail, duration pill, and custom dark-themed play button.
  - Iframe only mounts upon user interaction with `autoplay=1`.
  - Drastically slashes initial JavaScript execution, network requests, and Total Blocking Time (TBT).
- **Adsterra Monetization Preservation**:
  - Video facade click interaction triggers document-level user gesture listeners, ensuring Adsterra Popunder scripts trigger reliably while passing `npm run test:ads`.
- **Image Decoding & Layout Shift Optimization**:
  - `src/components/VideoCard.jsx`: Added `decoding="async"` and responsive `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"`.
  - `src/components/Navbar.jsx`: Logo tagged with `loading="eager"`, `decoding="async"`, and `fetchPriority="high"`.
  - `src/components/Footer.jsx`: Logo tagged with `loading="lazy"` and `decoding="async"`.
- **Static Edge Caching**:
  - Maintained Cloudflare headers in `public/_headers` (`_next/static/*` with `max-age=31536000, immutable`).

---

## 5. Editorial Content & Google Gemini AI Pipeline (Phase 5)

- **Editorial Content for 15 Collections (`src/data/collections.json`)**:
  - Drafted 490–496 word editorial reviews (exactly 5 paragraphs per collection) detailing category context, duration filtering, view metrics, community ratings, and related tags.
  - Approved 10 qualifying collections with ≥12 catalog videos and 0% overlap blocker: `lesbian`, `milf`, `asian`, `interracial`, `anal`, `mature`, `brunette`, `big-ass`, `blonde`, `latina`.
  - Expanded total indexable collections in `sitemap-static.xml` from 3 to **13 collections**. Total canonical URLs increased to **773 URLs**.
  - Drafted remaining 5 collections (`pov`, `threesome`, `webcam`, `cumshot`, `toys`) in `candidate` status awaiting further catalog expansion to prevent keyword overlap penalties.
- **Google Gemini API Pipeline**:
  - Upgraded `scripts/generate-sitemap.cjs` to support Gemini 2.5 Flash via REST API with `responseMimeType: "application/json"`.
  - Supports `GEMINI_API_KEY` with graceful fallback to `DEEPSEEK_API_KEY`.
  - Updated `.github/workflows/refresh-discovery.yml` to support `GEMINI_API_KEY` in GitHub Actions secrets.
