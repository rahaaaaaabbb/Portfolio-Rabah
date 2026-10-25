# Portfolio Rifa — 3 halaman, selebar layar (React + TS + GSAP + Lenis)
    npm install
    npm run dev      # pengembangan
    npm run build    # produksi (dist/) — dipakai Vercel

Halaman: `#/` Home · `#/work` My work · `#/edu` Education (router hash, tanpa dependensi tambahan).
Data teks: blok `P` di `src/shared.tsx`. Warna: variabel di atas `src/styles.css`.

## Hero: video -> frame (scroll-driven canvas)
Hero memakai urutan frame yang dipetakan ke progres scroll (0% = frame 1, 100% = frame terakhir).
1. Ubah video menjadi 150 frame dengan ffmpeg (DURASI = lama video dalam detik, cek: `ffprobe -v error -show_entries format=duration -of csv=p=0 hero.mp4`):

       mkdir public\frames
       ffmpeg -i hero.mp4 -vf "fps=150/DURASI,scale=1600:-2" -frames:v 150 -q:v 4 public/frames/frame_%04d.jpg

   (Opsional, lebih ringan: tambahkan `-c:v libwebp -quality 80`, pakai `frame_%04d.webp`, lalu ubah `ext` jadi "webp".)
2. Pengaturan (jumlah frame, tinggi scroll, kehalusan/lerp, ekstensi) ada di bagian atas `src/HeroCanvas.tsx`.

## Foto bawaan
1. Salin foto ke `public/photos/`.
2. Isi nama file di `PHOTOS` pada `src/shared.tsx` (hero, who, work0–5, edu0–2).
Tombol "Edit foto" hanya muncul saat `npm run dev` (atau tambahkan `?edit` di URL).

## Animasi
Selalu berjalan. Untuk menghormati "reduced motion" pengunjung, ubah `RESPECT_REDUCED_MOTION` ke `true` di `src/shared.tsx`.

## Efek di Home & My work
- WHO AM I naik membungkus hero (hero mengecil dan menggelap). Atur lewat `scrollVh` dan `overlapVh` di `src/HeroCanvas.tsx`.
- My work: project berupa tumpukan buku. Klik untuk memencar dari kiri ke kanan (geser dengan drag, tombol panah, atau trackpad). Klik "Tumpuk kembali" atau tekan Esc untuk menumpuk lagi.

## Hero 3 tahap (scroll-driven)
- Frame awal: tulisan PORTFOLIO panjang di tengah. Frame tengah: nama lengkap muncul di kiri atas. Frame akhir: navbar membulat (Who am I / My work / Education) muncul di telapak tangan.
- Waktu kemunculan tiap tahap diatur di konstanta `T` di `src/pages/Home.tsx` (angka 0–1 = progres scroll hero). Posisi menu di telapak tangan: `.hm` (`left`, `top`) di `src/styles.css`.
- Nama lengkap: `fullName` di `src/shared.tsx`.
- Kalau nama file frame Anda `ezgif-frame-001.png`, atur di `src/HeroCanvas.tsx`: `prefix: "ezgif-frame-", pad: 3, ext: "png"`, dan `frames` sesuai jumlah file.

## Detail project (My work)
- Klik tumpukan -> buku memencar; klik salah satu project -> screenshot memecah keluar dari kartu menjadi galeri detail (klik screenshot untuk memperbesar, Esc untuk menutup).
- Isi tiap project (deskripsi, peran, tools, poin hasil, nama tiap screenshot) ada di `P.work` pada `src/shared.tsx`. Jumlah screenshot = panjang array `shots` (disarankan 4–6).
- Foto bawaan: cover `work0`..`work5`; screenshot `work0-s0`, `work0-s1`, ... Taruh file di `public/photos/` lalu isi di `PHOTOS`, mis. `"work0-s0": "ugc-1.png"`.
