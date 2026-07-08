# Eporner API v2 Documentation

**Base URL**: `https://www.eporner.com/api/v2/`
**Protocol**: All requests must be HTTP GET.

## 1. SEARCH Method (`/api/v2/video/search/`)
Digunakan untuk mencari daftar video berdasarkan kriteria tertentu. Mendukung pagination (maksimal 1000 per halaman).
**Endpoint**: `/api/v2/video/search/`

### Parameters:
*   `query` (String): Kata kunci pencarian (mis. `teens`, `anal milf`). Nilai khusus `all` digunakan untuk mencari semua video. Default: `all`.
*   `per_page` (Integer): Jumlah hasil per halaman. Range: (1, 1000). Default: `30`.
*   `page` (Integer): Nomor halaman hasil. Range: (1, 1000000). Default: `1`.
*   `thumbsize` (String): Ukuran thumbnail. Valid: `small` (190x152), `medium` (427x240), `big` (640x360). Default: `medium`.
*   `order` (String): Pengurutan hasil. Valid: `latest` (terbaru), `longest` (terlama durasi), `shortest` (terpendek durasi), `top-rated` (rating tertinggi), `most-popular` (paling populer sepanjang waktu), `top-weekly` (terpopuler minggu ini), `top-monthly` (terpopuler bulan ini). Default: `latest`.
*   `gay` (Integer): Konten gay. Valid: `0` (tidak termasuk), `1` (termasuk), `2` (hanya gay). Default: `0`.
*   `lq` (Integer): Konten kualitas rendah. Valid: `0` (tidak termasuk), `1` (termasuk), `2` (hanya lq). Default: `1`.
*   `format` (String): Format respon. Valid: `json`, `xml`. Default: `json`.

### Response Structure (JSON):
*   `count` (Integer): Jumlah video pada halaman saat ini.
*   `start` (Integer): Indeks video pertama (`per_page * (page - 1)`).
*   `per_page` (Integer): Jumlah video per halaman (sesuai parameter).
*   `page` (Integer): Nomor halaman saat ini.
*   `time_ms` (Integer): Waktu eksekusi dalam milidetik (tidak selalu ada).
*   `total_count` (Integer): Total semua video yang cocok.
*   `total_pages` (Integer): Total halaman yang tersedia.
*   `videos` (Array): Daftar objek video (detail di bawah).

---

## 2. ID Method (`/api/v2/video/id/`)
Digunakan untuk mendapatkan detail dari satu video spesifik berdasarkan ID. Juga berguna untuk mengecek apakah video masih aktif (jika dihapus, API akan mengembalikan array kosong `[]`).
**Endpoint**: `/api/v2/video/id/`

### Parameters:
*   `id` (String, REQUIRED): ID unik video (Case-sensitive, 11 karakter).
*   `thumbsize` (String): Ukuran thumbnail. Valid: `small`, `medium`, `big`. Default: `medium`.
*   `format` (String): Format respon. Valid: `json`, `xml`. Default: `json`.

### Video Object Fields (Untuk respon `id` maupun elemen dalam array `videos` di method `search`):
*   `id` (String): ID unik video (11 karakter).
*   `title` (String): Judul video.
*   `keywords` (String): Kata kunci/tag yang terkait.
*   `views` (Integer): Estimasi jumlah penayangan (views).
*   `rate` (Float): Rating video (0.00 hingga 5.00).
*   `url` (String): URL video di Eporner.
*   `added` (String): Tanggal ditambahkan dengan format `YYYY-MM-DD hh:mm:ss`.
*   `length_sec` (Integer): Durasi video dalam detik.
*   `length_min` (String): Durasi video dalam format `mm:ss` atau `hh:mm:ss`.
*   `embed` (String): URL iframe untuk keperluan embed video.
*   `default_thumb` (Object): Informasi thumbnail utama (berisi: `size`, `width`, `height`, `src`).
*   `thumbs` (Array): Daftar semua variasi thumbnail video dengan format objek yang sama seperti `default_thumb`. Biasanya berisi 15 thumbnail (cuplikan video).

---

## 3. REMOVED Method (`/api/v2/video/removed/`)
Digunakan untuk mendapatkan daftar SEMUA ID video yang telah dihapus dari server Eporner. Berguna untuk sinkronisasi database lokal agar tidak menampilkan link mati (broken).
**Peringatan**: File respon berukuran sangat besar (megabytes). Disarankan menggunakan format `txt`.
**Endpoint**: `/api/v2/video/removed/`

### Parameters:
*   `format` (String): Format respon. Valid: `json`, `xml`, `txt`. Default: `json`. (Rekomendasi: `txt` karena ukuran file 60% lebih kecil).
