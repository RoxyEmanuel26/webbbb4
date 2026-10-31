# SEO AUDIT: nicevx.com (NICEVX)

**Tanggal Audit:** 31 Oktober 2026  
**Status Baseline:** Branch `seo-overhaul` (sinkron dengan `origin/main` - 704 video terkurasi)  
**Target Domain:** `https://www.nicevx.com/` (Hosting: Cloudflare Pages Static Export)

---

## 1. Framework, Versi & Mode Rendering Tiap Route

| Jenis Halaman | Route & Pola URL | Mode Rendering | Ada di HTML Awal? (Server/SSG) | Keterangan & Masalah Rendering |
|---|---|---|---|---|
| **Beranda** | `/` | Next.js 15.5.25 App Router (`output: 'export'`) | **Sebagian** (Title, Desc, H1, 24 picks katalog ada). | 24 video picks ada di HTML awal. Namun bagian "Latest videos" memuat `SearchResultsShared` yang melakukan client-side fetch ke Eporner API setelah JS aktif. Ada bug 2 `<main>` bersarang. |
| **Video Detail** | `/video/[...slug]` e.g. `/video/judul-slug-12345` | SSG (`generateStaticParams`, 704 halaman statis) | **Ya** (Title, Desc, H1, canonical, thumbnail, JSON-LD, context, 16 related videos). | Konten teks utama dan 16 video terkait ada di HTML awal. Iframe Eporner di-render langsung (`loading="eager"`), menaikkan LCP/TBT secara signifikan. |
| **Kategori** | `/cat/[catName]` (696 kategori) | SSG (`generateStaticParams`, 696 halaman statis) | **Sebagian** (Title, Desc, H1, 12 featured videos jika ada koleksi yang cocok). | **KRITIS:** Semua 696 halaman ini diberi `robots: { index: false, follow: true }`. Selain itu, grid utama memanggil `SearchResultsShared` (CSR fetch API) yang link videonya mengarah ke `/watch?id=...` (noindex). Googlebot melihat halaman ini nyaris kosong dan tidak meng-index-nya sama sekali. |
| **Kategori Hub** | `/cats` | Static (`output: 'export'`) | **Ya** (Daftar link semua kategori A-Z). | Berfungsi sebagai sitemap HTML untuk kategori. Namun navbar menautkannya dengan trailing slash `/cats/` yang memicu 308 redirect di setiap navigasi. |
| **Koleksi Kurasi** | `/collections/[slug]` (20 koleksi) | SSG (`generateStaticParams`, 20 halaman statis) | **Ya** (Title, Desc, H1, teks editorial, daftar video lengkap). | Hanya 6 dari 20 koleksi yang berstatus `editorial-approved` (sisanya 14 koleksi berstatus `candidate` dengan teks intro 25 kata sehingga di-noindex). Ukuran HTML `/collections/amateur` membengkak hingga 589 KB karena payload RSC membawa seluruh metadata video. |
| **Index Koleksi** | `/collections` | Static | **Ya** (Daftar kartu koleksi terkurasi). | Indexable, menyajikan navigasi crawlable ke koleksi yang lolos kurasi. |
| **Tag** | `/tag/[tagName]` (250 tag populer) | SSG (`generateStaticParams`, 250 tag) | **Hanya Metadata** (Grid 100% CSR). | Diberi `noindex, follow`. Grid kosong di HTML awal (hanya memuat skeleton), H1 tidak ada di markup HTML awal tag. |
| **Pencarian** | `/search?query=...` | CSR via Client Component | **Tidak** (Hanya skeleton). | Benar diberi `noindex, nofollow`, disallow di robots.txt. Tidak bermasalah untuk SEO. |
| **Watch Legacy** | `/watch?id=...` | CSR via Client Component | **Tidak** (Hanya skeleton). | Benar diberi `noindex, follow` sebagai fallback dinamis non-katalog. |
| **Halaman Legal** | `/about`, `/privacy`, `/terms`, `/dmca`, `/usc2257`, `/report`, `/editorial-policy`, `/content-sources` | Static (`output: 'export'`) | **Ya** (Teks lengkap). | Bagus untuk sinyal E-E-A-T dan kepatuhan hukum dewasa. |

---

## 2. Inventaris Lengkap Route & Pola URL

1. `/` (Beranda)
2. `/video/:slug-:id` (Halaman Video Kanonik – format: slug judul + 11 karakter ID Eporner, contoh: `/video/she-s-a-beauty-96wrmZwZmuo`)
3. `/cat/:catName` (Halaman Kategori – contoh: `/cat/amateur`, `/cat/blowjob`)
4. `/cats` (Direktori Indeks Kategori A-Z)
5. `/collections/:slug` (Halaman Koleksi Editorial – contoh: `/collections/amateur`)
6. `/collections` (Direktori Indeks Koleksi)
7. `/tag/:tagName` (Halaman Tag – contoh: `/tag/brunette`)
8. `/trends/weekly` (Halaman Tren Mingguan)
9. `/search?query=:term` (Pencarian Dinamis – noindex)
10. `/watch?id=:id` (Player Fallback Dinamis – noindex)
11. `/saved` (Daftar Video Favorit Lokal – client side localStorage)
12. Halaman Trust/Legal: `/about`, `/content-sources`, `/editorial-policy`, `/report`, `/terms`, `/privacy`, `/dmca`, `/usc2257`
13. `/_not-found` (Halaman 404)

---

## 3. Mekanisme Pengambilan Data API Pihak Ketiga

- **Di Server (Build-time / Cron):**
  - Mengambil data dari Eporner API v2 (`https://www.eporner.com/api/v2/video/search/` dan `/id/`).
  - Disimpan dalam file flat JSON: `src/data/curated-video-catalog.json` (704 video saat ini).
  - Enrichment AI sebelumnya dijalankan via GitHub Actions (`.github/workflows/refresh-discovery.yml`) menggunakan DeepSeek API. Sesuai instruksi pemilik, sistem ini akan diganti total ke **Google Gemini API**.
  - Cache build-time bersifat permanen di repo Git.
- **Di Browser (Client-side runtime):**
  - Komponen `SearchResultsShared.jsx` memanggil langsung `https://www.eporner.com/api/v2/video/search/` dengan parameter `per_page=36`, `format=json`, `lq=1`, `gay=0`.
  - Tidak ada backend proxy atau caching layer di Cloudflare untuk request client ini.
  - Terdapat risiko rate limit client-side jika traffic melonjak atau jika ISP/browser memblokir domain `eporner.com`.
  - Hasil pencarian client menautkan kartu ke URL `/watch?id=` bukan ke URL kanonik `/video/...` jika video belum masuk katalog.

---

## 4. Status Komponen SEO & Diagnosa Detail

| Komponen | Status | Hasil Pemeriksaan Detail |
|---|---|---|
| **robots.txt** | **ADA (Kurang Lengkap)** | Menyediakan `User-agent: *`, mengizinkan `/`, memblokir `/api/`, `/*?order=*`, `/search?*`. Sitemap diarahkan ke `https://www.nicevx.com/sitemap.xml`. **Kekurangan:** Belum ada deklarasi eksplisit untuk AI search bot (GPTBot, PerplexityBot, ClaudeBot) dan belum memblokir `/saved`. |
| **sitemap.xml** | **ADA (Sitemap Index)** | Berisi 2 child sitemap: `sitemap-static.xml` (15 URL) dan `sitemap-video-1.xml` (704 URL dengan tag `video:video`). **Kekurangan:** Tidak ada sitemap untuk 44 kategori utama yang berbobot. `lastmod` pada sitemap statis memakai timestamp lama (4 Okt 2026). Belum ada integrasi protokol **IndexNow** untuk Bing/Yandex. |
| **`<title>`** | **SALAH / SUB-OPTIMAL** | Mengandung karakter aneh akibat encoding artifact di layout: `NICEVX ?" Adult Videos`. Pada halaman kategori: `Free HD [Query] Porn Videos 2026 ?" NICEVX` (pola spam, tahun statis, karakter rusak). Judul video di `VideoPlayerClient` juga mengandung pemisah rusak `?"`. |
| **`meta description`** | **ADA (Perlu Peningkatan)** | Beranda dan Video memiliki deskripsi. Rata-rata deskripsi video 133 karakter (terlalu pendek dan seragam). Deskripsi kategori dibuat dari template statis berulang. |
| **Canonical URL** | **ADA (Perlu Koreksi)** | Self-referencing canonical ada di beranda, video, dan kategori. Namun tag canonical menggunakan URL statis tanpa penanganan konsistensi parameter halaman pagination di Next.js SSG. |
| **Open Graph / Twitter** | **ADA (Perlu Optimalisasi)** | `og:title`, `og:description`, `og:url`, `og:type` (`video.other` di video) terpasang. **Kelemahan:** OG Image di seluruh halaman non-video hanya merujuk ke `/favicon.png` (512x512) bukan banner 1200x630. |
| **Struktur Heading (H1)** | **SALAH (Dua `<main>`, H1 Kurang Tajam)** | `src/app/layout.jsx` membungkus `{children}` dengan `<main>`. Lalu `src/app/page.jsx` juga membungkus konten dengan `<main className="home-page">`. Terjadi **dua landmark `<main>` bersarang**. H1 beranda saat ini terlalu generik: `"Adult videos"`. H1 halaman tag tidak di-render di HTML awal. |
| **Alt Gambar** | **ADA (Perlu Audit Accessibility)** | Kartu video menyertakan `alt={video.title}`. Logo menyertakan `alt="Logo"`. Perlu nama alt yang lebih deskriptif dan kaya entitas. |
| **Structured Data (JSON-LD)** | **SEBAGIAN / BENTROK** | Di layout ada `WebSite` schema (bagus). Di halaman video ada `VideoObject` JSON-LD (bagus). **Kelemahan:** Halaman video menggabungkan JSON-LD dengan microdata HTML `itemScope itemType="https://schema.org/VideoObject"` yang parsial di tag `<article>` sehingga membingungkan Googlebot. Tidak ada `BreadcrumbList` schema dan tidak ada `ItemList` schema di kategori. |
| **Halaman 404** | **BENAR (HTTP 404)** | `curl -s -o NUL -w "%{http_code}" https://www.nicevx.com/this-does-not-exist` mengembalikan status `404` sungguhan. URL video invalid `/video/abc-12345678901` juga mengembalikan status `404`. Desain halaman 404 masih minimalis (hanya tombol ke beranda). |
| **HTTPS & Redirect www** | **BENAR (301)** | `http://www.nicevx.com/` → `301` ke `https://www.nicevx.com/`. `https://nicevx.com/` → `301` ke `https://www.nicevx.com/`. Cloudflare HSTS dan Edge SSL aktif sempurna. |
| **Halaman Legal** | **LENGKAP** | Memiliki Privacy Policy, Terms, DMCA Policy, USC 2257 Record-Keeping Compliance, Content Sources, Editorial Policy, dan Report Form. Ini adalah aset kepercayaan (trust & authority) yang sangat baik untuk website dewasa. |

---

## 5. Navigasi & Crawlability Link Internal

- **Navigasi Utama (Navbar):**
  - Menggunakan komponen Next.js `<Link>`.
  - **Bug Trailing Slash:** Link menu *Categories* tertulis `path: '/cats/'`. Karena Next.js SSG tidak memakai trailing slash, setiap klik dari bot maupun user ke menu ini memicu **HTTP 308 Permanent Redirect** ke `/cats`.
- **Pagination:**
  - Komponen `Pagination.jsx` sebagian besar mengontrol state via URL query (`?page=2`).
  - Halaman Next.js SSG `output: 'export'` tidak dapat melakukan SSR terhadap parameter URL `?page=2` di edge tanpa Workers.
  - Akibatnya halaman kategori halaman 2 ke atas tidak memiliki representasi HTML statis untuk bot search engine (hanya client-side hydrate).
- **Link Video di Grid:**
  - Komponen `VideoCard.jsx` menggunakan `<Link href={videoHref}>` dengan tag `<a>` asli. Ini dapat di-crawl jika карточка di-render di server. Namun pada halaman kategori dan tag, карточка di-render di client via `fetch` API, sehingga bot yang tidak mengeksekusi JS tidak melihat link video sama sekali.

---

## 6. Potensi Duplikasi URL & Crawl Budget Waste

1. **Kategori vs Tag vs Koleksi:**
   - URL `/cat/amateur`, `/tag/amateur`, dan `/collections/amateur` merepresentasikan topik yang sama.
   - Sistem saat ini sudah mengarahkan `/tag/amateur` via 301 ke `/cat/amateur` (bagus).
   - Namun `/cat/amateur` saat ini di-noindex, sedangkan `/collections/amateur` di-index. Hal ini membuat Google bingung mengenai arsitektur hierarki situs.
2. **Parameter Urutan Video (`order`):**
   - URL dengan parameter `?order=latest`, `?order=top-rated`, `?order=most-popular` sudah diblokir di `robots.txt` (`Disallow: /*?order=*`). Ini langkah yang sangat tepat untuk melindungi crawl budget.
3. **Pencarian Internal:**
   - Parameter `/search?query=...` sudah diblokir di `robots.txt` dan diberi meta `noindex, nofollow`. Tidak ada risiko duplicate search result indexation.

---

## 7. Analisis Performa & Core Web Vitals (CWV)

1. **Iframe Video Embed (LCP & TBT):**
   - Di `src/app/video/[...slug]/VideoPlayerClient.jsx`, `<iframe>` Eporner dimuat secara `eager` langsung saat halaman dibuka:
     `<iframe src={video.embedUrl} loading="eager" ... />`
   - Hal ini langsung mengunduh player video, scripts pihak ketiga Eporner, dan aset media di thread utama. Ini adalah penyumbang terbesar degradasi LCP (Largest Contentful Paint) dan Total Blocking Time (TBT) di mobile.
2. **Payload Ukuran HTML (HTML Bloat):**
   - Halaman `/collections/amateur` menghasilkan ukuran HTML **589 KB**.
   - Penyebabnya: Next.js RSC payload menyematkan data lengkap seluruh array video ke dalam komentar `self.__next_f.push(...)`.
3. **Optimasi Gambar:**
   - `next.config.mjs` menyetel `images: { unoptimized: true }` karena menggunakan `output: 'export'`.
   - Thumbnail diambil langsung dari CDN eksternal `https://static-ca-cdn.eporner.com`.
   - Kartu video sudah menyertakan `width="640"` dan `height="360"` serta `loading="lazy"` untuk карточка non-priority, yang membantu mencegah CLS (Cumulative Layout Shift).
4. **Font & CSS:**
   - Bundle CSS berukuran relatif kecil (`index.css`, `Pages.css`, `Navbar.css`).
   - Tidak ada font eksternal yang memblokir rendering (menggunakan system-ui / sans-serif stack modern).

---

## 8. Rekapitulasi Temuan Audit (Berdasarkan Prioritas Dampak)

| Prioritas | Temuan | Dampak SEO | Estimasi Usaha | Rekomendasi Solusi |
|---|---|---|---|---|
| 🔴 **KRITIS** | **Seluruh 696 halaman kategori `/cat/*` di-noindex.** | Halaman hub terpenting untuk menargetkan kata kunci spesifik (long-tail) hilang dari indeks Google. | Sedang | Filter 44 kategori dengan ≥12 video katalog berkualitas, jadikan `index, follow`, sertakan teks intro & statistik unik, masukkan ke sitemap. |
| 🔴 **KRITIS** | **Grid video kategori, tag, dan beranda sebagian besar CSR (Client-Side Rendering).** | Googlebot membaca halaman nyaris kosong tanpa link internal video di HTML awal. | Sedang | Render grid video dari katalog lokal di server (SSG). Jadikan API client hanya sebagai pelengkap/fallback di bawah. |
| 🔴 **KRITIS** | **Konten video tipis & rawan penalti duplikat.** | Data metadata API sama persis dengan ribuan situs tube lain; deskripsi singkat (133 karakter) tidak memberikan nilai unik. | Tinggi | Integrasikan pipeline enrichment Google Gemini untuk memproduksi deskripsi kaya, summary 2-3 kalimat, dan 3-5 highlights faktual per video. |
| 🟠 **TINGGI** | **14 dari 20 koleksi berstatus `candidate` (noindex) karena intro terlalu pendek (25 kata).** | Potensi halaman hub bertopik tinggi (milf, anal, asian, mature, latina, dll.) terbuang. | Rendah | Buat draf teks editorial berkualitas (400–650 kata) langsung di `src/data/collections.json` agar lolos verifikasi dan ter-index. |
| 🟠 **TINGGI** | **Sitemap tidak menyertakan kategori dan tidak ada protokol IndexNow.** | Bot lambat meng-crawl ribuan video; Bing dan Yandex (yang ramah konten dewasa) tidak menerima notifikasi otomatis. | Sedang | Pisahkan sitemap ke `sitemap-categories.xml`, buat integrasi IndexNow via API call otomatis saat build/deploy. |
| 🟠 **TINGGI** | **Dua landmark `<main>` bersarang dan redirect 308 pada link navbar.** | Pelanggaran semantik HTML dan pemborosan crawl budget pada setiap navigasi internal. | Rendah | Hapus `<main>` dari komponen halaman (cukup di `layout.jsx`), ubah link navbar `/cats/` menjadi `/cats`. |
| 🟡 **SEDANG** | **Title, meta description, dan Open Graph mengandung encoding rusak (`?"`).** | Snippet di SERP Google dan media sosial terlihat tidak profesional dan mengurangi Click-Through Rate (CTR). | Rendah | Perbaiki string encoding, gunakan pemisah bersih `–` atau `\|`, buat template title yang dioptimasi untuk klik tanpa kata kunci spam. |
| 🟡 **SEDANG** | **Iframe player Eporner dimuat secara `eager` di halaman video.** | Membebani performa mobile, menurunkan skor Core Web Vitals (LCP & INP). | Sedang | Buat komponen Facade player (thumbnail + tombol play) yang memuat iframe hanya setelah user berinteraksi, dengan tetap menjaga pemicu Popunder Adsterra. |
| 🟡 **SEDANG** | **Payload HTML koleksi membengkak (589 KB).** | Meningkatkan TTFB dan konsumsi kuota bandwidth crawling Googlebot. | Rendah | Batasi properti video yang diteruskan ke client component hanya pada atribut kartu (`toVideoCard`). |
| 🟢 **RENDAH** | **Halaman 404 minim navigasi bantuan.** | User yang mendarat di link mati langsung keluar (bounce rate tinggi). | Rendah | Perkaya halaman 404 dengan link kategori populer, koleksi unggulan, dan input pencarian. |

---

## Kesimpulan & Transisi ke Fase 1

Audit Fase 0 menegaskan bahwa akar masalah website tidak mendapatkan traffic dari Google bukanlah penalti manual, melainkan:
1. **Pintu indeks ditutup sendiri pada halaman kategori (`noindex`).**
2. **Ketergantungan pada rendering client-side (CSR) untuk grid video.**
3. **Ketipisan konten teks pada halaman video.**

Dengan keputusan pemilik untuk:
- Mengganti total AI pipeline ke **Google Gemini**,
- Menulis draf teks kurasi kategori/koleksi secara langsung,
- Mempertahankan estetika visual sambil merombak arsitektur semantik dan server-side hub,

Fondasi teknis di Fase 1 siap diimplementasikan secara terstruktur.
