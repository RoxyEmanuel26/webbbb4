# Graph Report - .  (2026-07-16)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 206 nodes · 194 edges · 41 communities (26 shown, 15 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.8)
- Token cost: 893 input · 469 output

## Graph Freshness
- Built from commit: `c1d523be`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Frontend Pages and Components
- Project Scripts and Dependencies
- TypeScript Compiler Configuration
- Cloudflare Deployment Dependencies
- Global Layout and Navigation
- Sitemap and Route Generation
- JavaScript Project Configuration
- Linter Rules and Configuration
- Category Listing Components
- External API and Branding
- Video Card UI Component
- Home Page Logic
- Video Player Client Component
- Home Client Component
- Search Results Component
- Eporner API Integration
- Ad Loading Queue Management
- ESLint Configuration
- PWA and Favicon Assets
- DMCA Page Logic
- Next.js Framework Configuration
- Vercel Deployment Configuration
- Circular Brand Logo
- Bluesky Social Icon
- Discord Social Icon
- Documentation UI Icon
- GitHub Social Icon
- Generic Social Icon
- X Social Icon
- Horizontal Brand Logo
- Hero Section Visuals

## God Nodes (most connected - your core abstractions)
1. `react` - 27 edges
2. `compilerOptions` - 16 edges
3. `scripts` - 8 edges
4. `include` - 5 edges
5. `lib` - 4 edges
6. `VideoCard()` - 4 edges
7. `plugins` - 3 edges
8. `rules` - 3 edges
9. `VideoPlayerClient()` - 3 edges
10. `HomeClient()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `NICEVX Home Page` --references--> `Adsterra Banner Ad Wrapper`  [INFERRED]
  curl_nicevx.html → public/adsterra.html
- `Categories Data` --references--> `Eporner API v2`  [INFERRED]
  scratch.txt → curl_nicevx.html
- `Adsterra Native Ad Wrapper` --calls--> `Adsterra Advertising Network`  [EXTRACTED]
  public/adsterra-native.html → public/adsterra.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Eporner Content Integration** — curl_nicevx_html, scratch_txt, eporner_api [INFERRED 0.85]
- **Adsterra Monetization Integration** — public_adsterra_html, public_adsterra_native_html, public_adsterra_service [EXTRACTED 1.00]
- **Social Media Icons** — public_icons_bluesky_icon, public_icons_discord_icon, public_icons_github_icon, public_icons_x_icon [EXTRACTED 0.90]

## Communities (41 total, 15 thin omitted)

### Community 0 - "Frontend Pages and Components"
Cohesion: 0.05
Nodes (4): react, metadata, metadata, metadata

### Community 1 - "Project Scripts and Dependencies"
Cohesion: 0.10
Nodes (19): oxlint, devDependencies, oxlint, @types/react, @types/react-dom, name, private, scripts (+11 more)

### Community 2 - "TypeScript Compiler Configuration"
Cohesion: 0.11
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, forceConsistentCasingInFileNames, incremental, isolatedModules, jsx (+11 more)

### Community 3 - "Cloudflare Deployment Dependencies"
Cohesion: 0.13
Nodes (15): @cloudflare/next-on-pages, @cloudflare/workers-types, lucide-react, next, dependencies, @cloudflare/next-on-pages, @cloudflare/workers-types, lucide-react (+7 more)

### Community 4 - "Global Layout and Navigation"
Cohesion: 0.24
Nodes (6): metadata, viewport, Footer(), HOT_SEARCHES, NAV_LINKS, Navbar()

### Community 5 - "Sitemap and Route Generation"
Cohesion: 0.25
Nodes (7): allRoutes, categoryRoutes, __dirname, __filename, outputPath, staticRoutes, ALL_CATEGORIES

### Community 6 - "JavaScript Project Configuration"
Cohesion: 0.25
Nodes (7): exclude, include, **/*.js, **/*.jsx, next-env.d.ts, .next/types/**/*.ts, node_modules

### Community 7 - "Linter Rules and Configuration"
Cohesion: 0.25
Nodes (7): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, warn

### Community 8 - "Category Listing Components"
Cohesion: 0.33
Nodes (4): ALPHABET, CATEGORIES, CategoriesClient(), metadata

### Community 9 - "External API and Branding"
Cohesion: 0.33
Nodes (6): NICEVX Home Page, Eporner API v2, Adsterra Banner Ad Wrapper, Adsterra Native Ad Wrapper, Adsterra Advertising Network, Categories Data

### Community 10 - "Video Card UI Component"
Cohesion: 0.70
Nodes (4): createSlug(), formatViews(), ratingToPercent(), VideoCard()

### Community 12 - "Video Player Client Component"
Cohesion: 0.83
Nodes (3): fixEncoding(), formatViews(), VideoPlayerClient()

### Community 13 - "Home Client Component"
Cohesion: 0.83
Nodes (3): fixEncoding(), HomeClient(), SORT_OPTIONS

### Community 14 - "Search Results Component"
Cohesion: 0.67
Nodes (3): fixEncoding(), SearchResultsShared(), SORT_OPTIONS

### Community 15 - "Eporner API Integration"
Cohesion: 0.67
Nodes (3): epornerServerApi, fixEncoding(), sanitizeVideo()

### Community 16 - "Ad Loading Queue Management"
Cohesion: 0.67
Nodes (3): enqueueAd(), processQueue(), queue

## Knowledge Gaps
- **85 isolated node(s):** `extends`, `next/core-web-vitals`, `$schema`, `oxc`, `react/rules-of-hooks` (+80 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Frontend Pages and Components` to `Global Layout and Navigation`, `Linter Rules and Configuration`, `Category Listing Components`, `Video Card UI Component`, `Home Page Logic`, `Video Player Client Component`, `Home Client Component`, `Search Results Component`, `Category Page Logic`, `DMCA Page Logic`?**
  _High betweenness centrality (0.175) - this node is a cross-community bridge._
- **Why does `plugins` connect `Linter Rules and Configuration` to `Frontend Pages and Components`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Cloudflare Deployment Dependencies` to `Project Scripts and Dependencies`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `extends`, `next/core-web-vitals`, `$schema` to the rest of the system?**
  _85 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Frontend Pages and Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._
- **Should `Project Scripts and Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `TypeScript Compiler Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._