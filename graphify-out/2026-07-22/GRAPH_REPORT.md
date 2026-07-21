# Graph Report - kumpulenak4  (2026-07-22)

## Corpus Check
- 43 files · ~21,470 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 223 nodes · 211 edges · 42 communities (24 shown, 18 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f0c3677e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react
- Project Scripts and Dependencies
- TypeScript Compiler Settings
- Cloudflare Deployment Dependencies
- generate-sitemap.js
- JavaScript Project Configuration
- Oxlint Linting Rules
- AGENTS.md
- External API and Ads
- Category Detail Pages
- Video Card UI Components
- layout.jsx
- page.jsx
- Home Page Client Components
- Search Result Components
- Eporner API Integration
- Ad Queue Management
- ESLint Configuration
- App Icons and Favicons
- page.jsx
- page.jsx
- page.jsx
- React + Vite
- Next.js Configuration
- Navbar.jsx
- Vercel Deployment Config
- Circular Brand Logo
- Bluesky Social Icon
- Discord Social Icon
- Documentation UI Icon
- GitHub Social Icon
- Generic Social Icon
- X Social Icon
- Horizontal Brand Logo
- Hero Section Graphic

## God Nodes (most connected - your core abstractions)
1. `react` - 27 edges
2. `compilerOptions` - 16 edges
3. `scripts` - 8 edges
4. `include` - 5 edges
5. `VideoPlayerClient()` - 4 edges
6. `lib` - 4 edges
7. `VideoCard()` - 4 edges
8. `plugins` - 3 edges
9. `rules` - 3 edges
10. `toSlug()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `NICEVX Home Page` --references--> `Adsterra Banner Ad Wrapper`  [INFERRED]
  curl_nicevx.html → public/adsterra.html
- `Categories Data` --references--> `Eporner API v2`  [INFERRED]
  scratch.txt → curl_nicevx.html
- `getSearchMetadata()` --references--> `ALL_CATEGORIES`  [EXTRACTED]
  src/utils/seo.js → src/data/allCategories.js
- `Adsterra Native Ad Wrapper` --calls--> `Adsterra Advertising Network`  [EXTRACTED]
  public/adsterra-native.html → public/adsterra.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Social Media Icons** — public_icons_bluesky_icon, public_icons_discord_icon, public_icons_github_icon, public_icons_x_icon [EXTRACTED 0.90]
- **Eporner Content Integration** — curl_nicevx_html, scratch_txt, eporner_api [INFERRED 0.85]
- **Adsterra Monetization Integration** — public_adsterra_html, public_adsterra_native_html, public_adsterra_service [EXTRACTED 1.00]

## Communities (42 total, 18 thin omitted)

### Community 0 - "react"
Cohesion: 0.05
Nodes (8): react, ALPHABET, CATEGORIES, CategoriesClient(), metadata, metadata, metadata, HOT_SEARCHES

### Community 1 - "Project Scripts and Dependencies"
Cohesion: 0.10
Nodes (19): oxlint, devDependencies, oxlint, @types/react, @types/react-dom, name, private, scripts (+11 more)

### Community 2 - "TypeScript Compiler Settings"
Cohesion: 0.11
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, forceConsistentCasingInFileNames, incremental, isolatedModules, jsx (+11 more)

### Community 3 - "Cloudflare Deployment Dependencies"
Cohesion: 0.13
Nodes (15): @cloudflare/next-on-pages, @cloudflare/workers-types, lucide-react, next, dependencies, @cloudflare/next-on-pages, @cloudflare/workers-types, lucide-react (+7 more)

### Community 4 - "generate-sitemap.js"
Cohesion: 0.20
Nodes (8): allRoutes, categoryRoutes, __dirname, __filename, outputPath, staticRoutes, ALL_CATEGORIES, getSearchMetadata()

### Community 5 - "JavaScript Project Configuration"
Cohesion: 0.25
Nodes (7): exclude, include, **/*.js, **/*.jsx, next-env.d.ts, .next/types/**/*.ts, node_modules

### Community 6 - "Oxlint Linting Rules"
Cohesion: 0.25
Nodes (7): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, warn

### Community 7 - "AGENTS.md"
Cohesion: 0.17
Nodes (10): DEBUGGING RULE, FEATURE RULE, FINAL RULE, GRAPHIFY IS THE SOURCE OF TRUTH, MANDATORY WORKFLOW, PERFORMANCE RULE, REFACTOR RULE, REQUIRED RESPONSE FORMAT (+2 more)

### Community 8 - "External API and Ads"
Cohesion: 0.33
Nodes (6): NICEVX Home Page, Eporner API v2, Adsterra Banner Ad Wrapper, Adsterra Native Ad Wrapper, Adsterra Advertising Network, Categories Data

### Community 9 - "Category Detail Pages"
Cohesion: 0.70
Nodes (3): CategoryPage(), getRelatedCategories(), toSlug()

### Community 10 - "Video Card UI Components"
Cohesion: 0.70
Nodes (4): createSlug(), formatViews(), ratingToPercent(), VideoCard()

### Community 13 - "Home Page Client Components"
Cohesion: 0.67
Nodes (3): fixEncoding(), HomeClient(), SORT_OPTIONS

### Community 14 - "Search Result Components"
Cohesion: 0.67
Nodes (3): fixEncoding(), SearchResultsShared(), SORT_OPTIONS

### Community 15 - "Eporner API Integration"
Cohesion: 0.67
Nodes (3): epornerServerApi, fixEncoding(), sanitizeVideo()

### Community 16 - "Ad Queue Management"
Cohesion: 0.67
Nodes (3): enqueueAd(), processQueue(), queue

### Community 19 - "page.jsx"
Cohesion: 0.43
Nodes (3): fixEncoding(), formatViews(), VideoPlayerClient()

### Community 22 - "React + Vite"
Cohesion: 0.40
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + Vite

## Knowledge Gaps
- **98 isolated node(s):** `CATEGORIES`, `ALPHABET`, `metadata`, `viewport`, `extends` (+93 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `Oxlint Linting Rules`, `Category Detail Pages`, `Video Card UI Components`, `page.jsx`, `Home Page Client Components`, `Search Result Components`, `page.jsx`, `page.jsx`, `page.jsx`, `Navbar.jsx`?**
  _High betweenness centrality (0.143) - this node is a cross-community bridge._
- **Why does `plugins` connect `Oxlint Linting Rules` to `react`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Cloudflare Deployment Dependencies` to `Project Scripts and Dependencies`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `CATEGORIES`, `ALPHABET`, `metadata` to the rest of the system?**
  _98 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.05121951219512195 - nodes in this community are weakly interconnected._
- **Should `Project Scripts and Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `TypeScript Compiler Settings` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._