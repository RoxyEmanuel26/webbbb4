# Graph Report - kumpulenak4  (2026-07-16)

## Corpus Check
- 43 files · ~20,839 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 205 nodes · 201 edges · 31 communities (20 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2950dcc6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Static and Legal Pages
- Project Scripts and Metadata
- TypeScript Compiler Configuration
- Root Layout and Global Ads
- Cloudflare and Core Dependencies
- Sitemap and SEO Generation
- JavaScript Environment Configuration
- Linter Rules and Plugins
- External API and Ad Documentation
- Category Listing Components
- Video Playback Pages
- Video Card UI Components
- Home Page Metadata
- Home Page Client Logic
- Search Results Shared Logic
- Eporner API Integration
- Adsterra Ad Queue Management
- ESLint Configuration
- Next.js Configuration
- Vercel Deployment Headers
- Circular Brand Logo
- Horizontal Brand Logo
- Hero Section Graphics
- AGENTS.md
- page.jsx
- Footer.jsx
- Navbar.jsx

## God Nodes (most connected - your core abstractions)
1. `react` - 27 edges
2. `compilerOptions` - 16 edges
3. `scripts` - 8 edges
4. `include` - 5 edges
5. `lib` - 4 edges
6. `VideoPlayerClient()` - 4 edges
7. `VideoCard()` - 4 edges
8. `HomeClient()` - 3 edges
9. `plugins` - 3 edges
10. `rules` - 3 edges

## Surprising Connections (you probably didn't know these)
- `NICEVX Home Page` --references--> `Adsterra Banner Ad Wrapper`  [INFERRED]
  curl_nicevx.html → public/adsterra.html
- `NICEVX Home Page` --references--> `Robots Configuration`  [INFERRED]
  curl_nicevx.html → public/robots.txt
- `Categories Data` --references--> `Eporner API v2`  [INFERRED]
  scratch.txt → curl_nicevx.html
- `getSearchMetadata()` --references--> `ALL_CATEGORIES`  [EXTRACTED]
  src/utils/seo.js → src/data/allCategories.js
- `Adsterra Native Ad Wrapper` --calls--> `Adsterra Advertising Network`  [EXTRACTED]
  public/adsterra-native.html → public/adsterra.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Adsterra Monetization Integration** — public_adsterra_html, public_adsterra_native_html, public_adsterra_service [EXTRACTED 1.00]
- **Eporner Content Integration** — curl_nicevx_html, scratch_txt, eporner_api [INFERRED 0.85]

## Communities (31 total, 11 thin omitted)

### Community 0 - "Static and Legal Pages"
Cohesion: 0.05
Nodes (4): react, metadata, metadata, metadata

### Community 1 - "Project Scripts and Metadata"
Cohesion: 0.10
Nodes (19): oxlint, devDependencies, oxlint, @types/react, @types/react-dom, name, private, scripts (+11 more)

### Community 2 - "TypeScript Compiler Configuration"
Cohesion: 0.11
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, forceConsistentCasingInFileNames, incremental, isolatedModules, jsx (+11 more)

### Community 4 - "Cloudflare and Core Dependencies"
Cohesion: 0.13
Nodes (15): @cloudflare/next-on-pages, @cloudflare/workers-types, lucide-react, next, dependencies, @cloudflare/next-on-pages, @cloudflare/workers-types, lucide-react (+7 more)

### Community 5 - "Sitemap and SEO Generation"
Cohesion: 0.20
Nodes (8): allRoutes, categoryRoutes, __dirname, __filename, outputPath, staticRoutes, ALL_CATEGORIES, getSearchMetadata()

### Community 6 - "JavaScript Environment Configuration"
Cohesion: 0.25
Nodes (7): exclude, include, **/*.js, **/*.jsx, next-env.d.ts, .next/types/**/*.ts, node_modules

### Community 7 - "Linter Rules and Plugins"
Cohesion: 0.25
Nodes (7): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, warn

### Community 8 - "External API and Ad Documentation"
Cohesion: 0.29
Nodes (7): NICEVX Home Page, Eporner API v2, Adsterra Banner Ad Wrapper, Adsterra Native Ad Wrapper, Adsterra Advertising Network, Robots Configuration, Categories Data

### Community 9 - "Category Listing Components"
Cohesion: 0.33
Nodes (4): ALPHABET, CATEGORIES, CategoriesClient(), metadata

### Community 10 - "Video Playback Pages"
Cohesion: 0.43
Nodes (3): fixEncoding(), formatViews(), VideoPlayerClient()

### Community 11 - "Video Card UI Components"
Cohesion: 0.70
Nodes (4): createSlug(), formatViews(), ratingToPercent(), VideoCard()

### Community 13 - "Home Page Client Logic"
Cohesion: 0.83
Nodes (3): fixEncoding(), HomeClient(), SORT_OPTIONS

### Community 14 - "Search Results Shared Logic"
Cohesion: 0.67
Nodes (3): fixEncoding(), SearchResultsShared(), SORT_OPTIONS

### Community 15 - "Eporner API Integration"
Cohesion: 0.67
Nodes (3): epornerServerApi, fixEncoding(), sanitizeVideo()

### Community 16 - "Adsterra Ad Queue Management"
Cohesion: 0.67
Nodes (3): enqueueAd(), processQueue(), queue

### Community 27 - "AGENTS.md"
Cohesion: 0.17
Nodes (10): DEBUGGING RULE, FEATURE RULE, FINAL RULE, GRAPHIFY IS THE SOURCE OF TRUTH, MANDATORY WORKFLOW, PERFORMANCE RULE, REFACTOR RULE, REQUIRED RESPONSE FORMAT (+2 more)

## Knowledge Gaps
- **88 isolated node(s):** `CATEGORIES`, `ALPHABET`, `metadata`, `viewport`, `GRAPHIFY IS THE SOURCE OF TRUTH` (+83 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Static and Legal Pages` to `Linter Rules and Plugins`, `Category Listing Components`, `Video Playback Pages`, `Video Card UI Components`, `Home Page Metadata`, `Home Page Client Logic`, `Search Results Shared Logic`, `page.jsx`, `Footer.jsx`, `Navbar.jsx`?**
  _High betweenness centrality (0.162) - this node is a cross-community bridge._
- **Why does `plugins` connect `Linter Rules and Plugins` to `Static and Legal Pages`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Cloudflare and Core Dependencies` to `Project Scripts and Metadata`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `CATEGORIES`, `ALPHABET`, `metadata` to the rest of the system?**
  _88 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Static and Legal Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._
- **Should `Project Scripts and Metadata` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `TypeScript Compiler Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._