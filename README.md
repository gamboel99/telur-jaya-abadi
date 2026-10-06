# Telur Jaya Abadi — Website Profile & Pemesanan Online

Website statis **HTML5 + CSS3 + Vanilla JavaScript** yang siap di-hosting melalui GitHub dan Vercel.

## Struktur

```text
telur-jaya-abadi/
├── index.html
├── styles.css
├── script.js
├── README.md
└── images/
    └── logo-telur-jaya-abadi.jpeg
```

Folder `images/` disediakan untuk aset gambar. Website memiliki fallback emoji apabila gambar katalog belum tersedia.

## Fitur

- Landing page responsive mobile-first.
- Navbar sticky dan navigasi section.
- Profil usaha Telur Jaya Abadi.
- Katalog produk dinamis.
- Form pemesanan interaktif.
- Pilihan produk:
  - Telur Puyuh
  - Telur Ayam
  - Beras
  - Lainnya
- Untuk produk telur, pilihan kondisi otomatis muncul:
  - Mentah
  - Matang
  - Matang Kupasan
- Validasi form.
- Estimasi harga katalog apabila harga telah diisi melalui panel admin.
- Ringkasan pesanan otomatis.
- Tombol kirim pesanan langsung ke WhatsApp Cabang Utama atau Cabang Desa Keling.
- Admin Panel sederhana untuk:
  - tambah produk,
  - edit nama/deskripsi/harga/satuan,
  - upload gambar produk,
  - hapus produk,
  - reset katalog.
- Data katalog hasil perubahan admin disimpan di `localStorage` browser.

## Nomor WhatsApp

Nomor sudah diatur di `script.js`:

- Cabang Utama — Gampeng: `085708830108`
- Cabang Desa Keling: `082228278397`

Jika nomor berubah, ubah bagian `BRANCHES` di `script.js`.

## Admin Panel

Klik **Admin** pada bagian footer.

PIN default:

```text
2026
```

PIN tersebut berada di sisi JavaScript sehingga **bukan autentikasi server yang aman**. Website statis tidak dapat memberikan keamanan admin sebenarnya hanya dengan HTML/CSS/JS.

Untuk kebutuhan internal sederhana, panel ini cukup untuk mengelola katalog pada browser admin.

### Penting tentang gambar

Upload gambar dari Admin Panel menyimpannya sebagai data LocalStorage pada **browser/perangkat tersebut**. Artinya:

- gambar tidak otomatis masuk ke GitHub;
- gambar tidak otomatis tersimpan di server;
- pengunjung lain tidak akan melihat gambar hasil upload LocalStorage milik admin.

Untuk gambar yang harus tampil bagi **semua pengunjung**, cara paling stabil pada website statis adalah:

1. Masukkan gambar ke folder `images/`.
2. Beri nama sederhana, misalnya:
   - `telur-ayam.jpg`
   - `telur-puyuh.jpg`
   - `beras.jpg`
3. Upload folder tersebut ke GitHub.
4. Website dapat membaca file tersebut melalui path relatif.

Jika Anda ingin benar-benar mengelola gambar dari browser dan hasilnya tampil ke semua pengunjung, website perlu backend/storage seperti Cloudinary, Supabase, Firebase Storage, atau layanan CMS. Versi ini sengaja tidak membutuhkan backend agar deploy Vercel tetap sederhana.

## Menambah gambar katalog permanen

Anda dapat menaruh file gambar di:

```text
images/
```

Contoh:

```text
images/telur-ayam.jpg
images/telur-puyuh.jpg
images/beras.jpg
```

Nama/path default sudah tersedia pada `DEFAULT_PRODUCTS` di `script.js`.

Jika ingin mengganti path permanen, ubah nilai `image` pada objek produk. Tidak perlu mengubah HTML.

## Deploy ke GitHub

### Cara 1 — melalui website GitHub

1. Login ke GitHub.
2. Buat repository baru, misalnya:
   `telur-jaya-abadi`
3. Upload:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `README.md`
   - folder `images/`
4. Commit perubahan.

Tidak diperlukan Node.js, npm, package.json, atau build tool.

### Cara 2 — menggunakan Git

```bash
git init
git add .
git commit -m "Initial Telur Jaya Abadi website"
git branch -M main
git remote add origin https://github.com/USERNAME/telur-jaya-abadi.git
git push -u origin main
```

Ganti `USERNAME` dengan username GitHub Anda.

## Deploy ke Vercel

1. Login ke Vercel.
2. Pilih **Add New Project**.
3. Import repository GitHub `telur-jaya-abadi`.
4. Framework Preset: **Other** atau biarkan Vercel mendeteksi static site.
5. Build Command: kosongkan.
6. Output Directory: kosongkan.
7. Klik **Deploy**.

Karena website ini murni HTML/CSS/JS, tidak ada proses build yang diperlukan.

## Pengujian sebelum deploy

Buka `index.html` langsung di browser atau gunakan Live Server.

Periksa:

- Navbar mobile.
- Semua tombol anchor.
- Katalog produk.
- Form validasi.
- Produk telur menampilkan pilihan kondisi.
- Produk "Lainnya" menampilkan kolom nama produk.
- Pilihan cabang.
- WhatsApp terbuka dengan ringkasan pesanan.
- Admin Panel.
- Upload gambar.
- Responsive pada HP, tablet, dan desktop.

## Catatan SEO

Website sudah memiliki:

- title,
- meta description,
- keywords,
- Open Graph dasar,
- struktur heading,
- alt text,
- semantic HTML.

Untuk SEO lokal yang lebih kuat, tahap berikutnya dapat menambahkan `LocalBusiness` / `Organization` JSON-LD, favicon, sitemap.xml, dan robots.txt.

## Catatan keamanan

Website ini adalah static site. Jangan menyimpan:

- password rekening,
- API key rahasia,
- credential,
- data pelanggan sensitif,
- token rahasia

di dalam JavaScript frontend.

Nomor WhatsApp memang terlihat oleh pengunjung karena diperlukan untuk fungsi pemesanan.

## Lisensi

Konten dan identitas usaha merupakan milik Telur Jaya Abadi.
