# CHECKLIST MANUAL: Tindakan Setelah Deploy SEO Overhaul

Panduan langkah-langkah praktis bagi pemilik website **NICEVX** (`https://www.nicevx.com/`) setelah branch `seo-overhaul` di-merge dan di-deploy ke Cloudflare Pages.

---

## 1. Konfigurasi Kunci API Google Gemini (Prioritas Tinggi)

Untuk memastikan refresh katalog harian dan pembuatan deskripsi SEO otomatis berjalan menggunakan Google Gemini AI:

1. **Buka Google AI Studio**:
   - Kunjungi [Google AI Studio](https://aistudio.google.com/) dan buat API Key baru (Free Tier tersedia kuota harian gratis).
2. **Tambahkan ke GitHub Secrets**:
   - Buka repositori GitHub Anda -> **Settings** -> **Secrets and variables** -> **Actions**.
   - Klik **New repository secret**.
   - Nama: `GEMINI_API_KEY`.
   - Value: Tempel API Key Gemini Anda.
3. **Tambahkan ke File Lokal (Opsional)**:
   - Tambahkan baris berikut ke `.env` lokal Anda:
     ```env
     GEMINI_API_KEY=AIzaSy...
     ```

---

## 2. Kirim Ulang Peta Situs ke Google Search Console (GSC)

Google Search Console saat ini mencatat 279 halaman tidak diindeks karena sitemap lama tidak menyertakan kategori dan memiliki issue canonical redirect.

1. Buka [Google Search Console](https://search.google.com/search-console).
2. Pilih properti: `https://www.nicevx.com/`.
3. Klik menu **Peta Situs** (Sitemaps) di bilah kiri.
4. Pada kolom **Tambahkan peta situs baru**, masukkan:
   ```text
   sitemap.xml
   ```
5. Klik **Kirim** (Submit).
6. Pastikan statusnya terbaca **Berhasil** (Success).
   - Sitemap index `sitemap.xml` akan otomatis membaca 3 child sitemaps:
     - `sitemaps/sitemap-static.xml` (Halaman utama + 13 Hub Koleksi baru)
     - `sitemaps/sitemap-categories.xml` (44 Kategori terkurasi ≥12 video)
     - `sitemaps/sitemap-videos-*.xml` (704+ Video detail)

---

## 3. Lakukan Inspeksi URL & Minta Pengindeksan Prioritas (Top Hubs)

Untuk mempercepat Googlebot meng-crawl struktur baru tanpa menunggu antrean alami:

1. Buka menu **Inspeksi URL** di bagian atas GSC.
2. Masukkan URL prioritas berikut satu per satu, tekan Enter, lalu klik tombol **Minta Pengindeksan** (Request Indexing):
   - `https://www.nicevx.com/` (Homepage baru dengan WebSite & Organization schema)
   - `https://www.nicevx.com/cats` (Direktori kategori A-Z)
   - `https://www.nicevx.com/collections` (Direktori koleksi)
   - `https://www.nicevx.com/cat/amateur`
   - `https://www.nicevx.com/cat/blowjob`
   - `https://www.nicevx.com/cat/big-tits`
   - `https://www.nicevx.com/cat/big-ass`
   - `https://www.nicevx.com/cat/milf`
   - `https://www.nicevx.com/cat/anal`
   - `https://www.nicevx.com/cat/brunette`
   - `https://www.nicevx.com/cat/blonde`
   - `https://www.nicevx.com/cat/asian`
   - `https://www.nicevx.com/cat/latina`
   - `https://www.nicevx.com/cat/lesbian`
   - `https://www.nicevx.com/cat/mature`
   - `https://www.nicevx.com/collections/amateur`
   - `https://www.nicevx.com/collections/milf`
   - `https://www.nicevx.com/collections/brunette`
   - `https://www.nicevx.com/collections/big-ass`
   - `https://www.nicevx.com/collections/blowjob`
*(Batas harian inspeksi manual Google adalah sekitar 10–15 URL per hari. Prioritaskan URL di atas).*

---

## 4. Picu Notifikasi Mesin Pencari Instan (IndexNow)

Website Anda telah dilengkapi protokol **IndexNow** untuk memberitahu Bing, Yandex, Seznam, dan Naver secara instan:

1. Setelah deploy ke Cloudflare selesai, jalankan perintah ini dari terminal:
   ```bash
   npm run indexnow
   ```
2. Skrip ini akan otomatis mengirimkan batch URL utama ke endpoint `api.indexnow.org`.

---

## 5. Hubungkan ke Bing Webmaster Tools

1. Kunjungi [Bing Webmaster Tools](https://www.bing.com/webmasters/).
2. Masuk dan pilih opsi **Import from Google Search Console** (hanya 1 klik tanpa perlu verifikasi DNS ulang).
3. Pastikan `https://www.nicevx.com/sitemap.xml` terdeteksi di menu Sitemaps Bing.

---

## 6. Jadwal Pemantauan & Ekspektasi Hasil (Monitoring Roadmap)

- **Hari 1–3**:
  - Googlebot akan meng-crawl file `robots.txt` dan `sitemap.xml` baru.
  - Periksa tab **Halaman** di GSC: Jumlah halaman dalam kategori *"Ditemukan - saat ini tidak diindeks"* akan mulai berpindah ke *"Di-crawl - saat ini tidak diindeks"* dan *"Halaman diindeks"*.
- **Hari 7–14**:
  - 44 Kategori utama dan 13 Hub Koleksi akan mulai terindeks penuh.
  - Rich snippet video (video thumbnail, durasi, upload date) akan mulai muncul di hasil pencarian Google Video.
  - Grafik impresi di GSC (yang sebelumnya stagnan di 11 impresi) akan mulai menanjak tajam.
- **Hari 15–30**:
  - Video individual dan long-tail keyword (`{title} – {category} | NICEVX`) mulai menarik klik organik berkelanjutan.
  - Pantau kata kunci teratas di tab **Performa** GSC untuk melihat tren penelusuran yang mendatangkan impresi terbanyak.
