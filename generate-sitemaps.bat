@echo off
color 0A
title Sitemap Generator - NiceVX

:MENU
cls
echo ==================================================
echo         NICEVX SITEMAP GENERATOR MENU
echo ==================================================
echo.
echo   1. Update Kategori Static (CEPAT - Hitungan Detik)
echo      - Jalankan ini setiap kali Anda menambahkan 
echo        keyword baru di allCategories.js
echo.
echo   2. Generate Full Sitemap (LAMA - Bisa Berjam-jam)
echo      - Fetch 100.000+ video dari API Eporner
echo      - Gunakan ini sebulan sekali untuk update video
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
echo Peringatan: Proses ini bisa memakan waktu lama!
echo Menjalankan Generate Full Sitemap...
echo ==================================================
node scripts\generate-sitemap.cjs
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
