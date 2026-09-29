@echo off
color 0A
title Sitemap Generator - NiceVX

:MENU
cls
echo ==================================================
echo         NICEVX SITEMAP GENERATOR MENU
echo ==================================================
echo.
echo   Sitemap sekarang diperbarui otomatis setiap hari
echo   melalui GitHub Actions. File ini hanya untuk recovery.
echo.
echo   1. Update Kategori Static (CEPAT - Hitungan Detik)
echo      - Jalankan ini setiap kali Anda menambahkan 
echo        keyword baru di allCategories.js
echo.
echo   2. Jalankan Batch Harian Manual (10 video)
echo      - Gunakan hanya jika workflow otomatis gagal
echo.
echo   3. Resume Full Sitemap (LANJUTKAN)
echo      - Lanjutkan jika menu nomor 2 terputus/error
echo.
echo   0. Keluar
echo.
echo ==================================================
set /p choice="Pilih angka menu (0-3): "

if "%choice%"=="1" goto STATIC
if "%choice%"=="2" goto FULL
if "%choice%"=="3" goto RESUME
if "%choice%"=="0" goto EOF
goto MENU

:STATIC
cls
echo Menjalankan Update Static Sitemap...
echo ==================================================
node scripts\regen-static-sitemap.cjs
echo ==================================================
echo.
echo Selesai! Tekan tombol apa saja untuk kembali ke menu.
pause >nul
goto MENU

:FULL
cls
echo Menjalankan batch sitemap harian manual...
echo ==================================================
set SITEMAP_AI_BATCH_SIZE=15
set SITEMAP_MIN_NEW_VIDEOS=10
set SITEMAP_MAX_VIDEOS=4000
set SITEMAP_REQUIRE_AI_CURATION=true
node scripts\generate-sitemap.cjs
set SITEMAP_AI_BATCH_SIZE=
set SITEMAP_MIN_NEW_VIDEOS=
set SITEMAP_MAX_VIDEOS=
set SITEMAP_REQUIRE_AI_CURATION=
echo ==================================================
echo.
echo Selesai! Tekan tombol apa saja untuk kembali ke menu.
pause >nul
goto MENU

:RESUME
cls
echo Melanjutkan Generate Full Sitemap yang terputus...
echo ==================================================
node scripts\generate-sitemap.cjs --resume
echo ==================================================
echo.
echo Selesai! Tekan tombol apa saja untuk kembali ke menu.
pause >nul
goto MENU

:EOF
exit
