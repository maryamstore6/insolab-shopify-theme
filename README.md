# InsoLab Cinematic — Shopify Theme

Theme Shopify rasmi untuk **InsoLab** custom insoles.

- Desain sinematik (GSAP + Lenis, grain, vignette)
- Harga: **RM599** (1 unit) · **RM1099** (2 unit)
- Semua teks boleh edit dari Shopify dashboard
- Tiada preloader, tiada checkout palsu

## Cara Upload

1. Download `insolab-shopify-theme.zip` dari Release, atau zip folder ini.
2. Shopify Admin → **Online Store → Themes**.
3. **Add theme → Upload zip file**.
4. Pilih fail zip → **Publish**.

## Cara Sync dari GitHub (auto-deploy)

1. Shopify Admin → **Online Store → Themes**.
2. Scroll ke bawah → **Add theme → Connect from GitHub**.
3. Pilih repo `maryamstore6/insolab-shopify-theme`, branch `main`.
4. Klik **Connect**. Setiap `git push` ke `main` akan update theme secara automatik.

## Struktur

```
layout/       theme.liquid
templates/    12 templat (index, product, cart, 404, ...)
sections/     24 seksyen
snippets/     logo.liquid
assets/       CSS, JS, gambar, video
config/       settings_schema.json + settings_data.json
locales/      en.default.json (Bahasa Melayu)
```

## Selepas Upload

1. **Produk** — cipta 2 produk RM599 + 1 bundle RM1099.
2. **Menu** — Navigation → Main menu (Proses, Produk, FAQ).
3. **WhatsApp** — Theme settings → 60176055349 (sudah set).
4. **Bayaran** — Shopify Payments tiada di Malaysia; guna Billplz atau manual transfer.

## Nota

- Homepage guna butang WhatsApp (bukan checkout) — sama seperti laman asal.
- Halaman produk guna borang Shopify sebenar.
- Produk bukan peranti perubatan (MDA) — tiada klaim perubatan.
