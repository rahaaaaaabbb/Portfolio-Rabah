import { createContext, useContext, useRef, useState, type ChangeEvent, type MutableRefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };

/* ====== EDIT DATA ANDA DI SINI (semua isi di bawah hanya contoh) ====== */
export const P = {
  first: "Rifa", fullName: "Rifa Rabah Falhaq", role: "Social Media", email: "hello@rifa.com",
  tagline: "Storytelling autentik yang menghubungkan brand dengan audiens lewat pengalaman yang dekat dan relevan.",
  intro: ["Saya Rifa, social media specialist. Saya membantu brand tumbuh lewat identitas visual yang konsisten, konten kreatif, dan kampanye yang terukur.",
          "Saya terbiasa mengubah ide menjadi konten yang menarik perhatian dan membangun hubungan jangka panjang dengan audiens."],
  stats: [{ n: 50, s: "+", l: "Brand" }, { n: 20, s: "jt+", l: "Views" }, { n: 3, s: "th+", l: "Pengalaman" }],
  brands: ["Brand A", "Brand B", "Brand C", "Brand D", "Brand E"],
  skills: [["Content Creation", 92], ["Copywriting", 86], ["Video Editing", 80], ["Meta Ads", 76], ["SEO", 70], ["Analytics", 78]] as [string, number][],
  tools: ["Canva", "CapCut", "Meta Business Suite", "Google Analytics"],
  /* Tiap project: kartu di tumpukan + halaman detail dengan beberapa screenshot (shots = nama tiap gambar) */
  work: [
    { title: "RekaRupa OPS", year: "2026", role: "Kasir", tools: ["Node.js", "TypeScript", "React","Tailwind CSS","Three.js & React Three Fiber","Spline","Chart.js","GSAP (GreenSock Animation Platform)","Lenis"],
      desc: "Membuat video pendek dan panjang yang selaras dengan identitas dan tujuan pemasaran brand.",
      points: ["Tulis hasil utama project di sini", "Tulis metrik, mis. views naik X%", "Tulis tantangan yang berhasil diselesaikan"],
      shots: ["Hook 3 detik", "Storyboard", "Hasil edit", "Performa", "Komentar audiens"] },
    { title: "Branding & Aesthetic", year: "2025", role: "Visual Lead", tools: ["Canva", "Figma"],
      desc: "Membangun visual yang kohesif lewat grafis, styling konten, dan tampilan online yang konsisten.",
      points: ["Tulis hasil utama project di sini", "Tulis metrik atau umpan balik klien", "Tulis tantangan yang berhasil diselesaikan"],
      shots: ["Moodboard", "Palet & tipografi", "Template feed", "Highlight cover", "Hasil akhir"] },
    { title: "SEO & Copywriting", year: "2024", role: "Copywriter", tools: ["Google Analytics", "Search Console"],
      desc: "Riset kata kunci dan penulisan copy untuk meningkatkan visibilitas dan engagement.",
      points: ["Tulis hasil utama project di sini", "Tulis metrik, mis. trafik organik naik X%", "Tulis tantangan yang berhasil diselesaikan"],
      shots: ["Riset keyword", "Draft copy", "Halaman live", "Grafik trafik", "Ranking"] },
    { title: "Communication Strategy", year: "2024", role: "Strategist", tools: ["Notion", "Google Sheets"],
      desc: "Menyusun strategi komunikasi agar brand terhubung jelas dengan audiensnya.",
      points: ["Tulis hasil utama project di sini", "Tulis metrik atau keputusan penting", "Tulis tantangan yang berhasil diselesaikan"],
      shots: ["Persona audiens", "Pilar konten", "Kalender", "Pedoman suara brand", "Laporan"] },
    { title: "Meta Ads Campaigns", year: "2025", role: "Ads Specialist", tools: ["Meta Ads Manager", "Pixel"],
      desc: "Merencanakan dan mengelola iklan Facebook dan Instagram untuk menaikkan reach dan konversi.",
      points: ["Tulis hasil utama project di sini", "Tulis metrik, mis. ROAS atau CPA", "Tulis tantangan yang berhasil diselesaikan"],
      shots: ["Struktur kampanye", "Materi iklan", "Dashboard", "Hasil A/B test", "Ringkasan biaya"] },
    { title: "Content Planning", year: "2025", role: "Content Planner", tools: ["Notion", "Meta Business Suite"],
      desc: "Menyusun dan mengatur konten strategis yang menjaga audiens tetap terlibat.",
      points: ["Tulis hasil utama project di sini", "Tulis metrik, mis. engagement naik X%", "Tulis tantangan yang berhasil diselesaikan"],
      shots: ["Kalender 30 hari", "Brief konten", "Feed Instagram", "Jadwal posting", "Insight bulanan"] },
  ],
  edu: [
    { year: "2021 – 2025", title: "S1 Ilmu Komunikasi", place: "Nama Universitas", note: "Fokus pada komunikasi digital dan media baru. Tulis IPK, skripsi, atau organisasi di sini." },
    { year: "2024", title: "Sertifikasi Digital Marketing", place: "Nama Lembaga", note: "Tulis materi atau hasil utama dari program ini." },
    { year: "2018 – 2021", title: "SMA / SMK", place: "Nama Sekolah", note: "Jurusan dan pencapaian yang relevan." },
  ],
  comp: [
    ["Komunikasi", "Menyampaikan ide dengan jelas kepada tim, klien, dan audiens."],
    ["Kreativitas", "Menemukan sudut pandang segar agar konten tidak terasa seperti yang lain."],
    ["Analitis", "Membaca data performa lalu mengubahnya menjadi keputusan konten."],
    ["Adaptif", "Cepat menyesuaikan diri dengan tren, platform, dan kebutuhan brand."],
  ],
  marquee: ["Social Media", "Content", "Branding", "Copywriting", "Video", "Strategy"],
};
/* ======================================================================= */

/* ====== FOTO BAWAAN ======
   1. Taruh file foto di folder  public/photos/
   2. Tulis nama file-nya di sini (kosong = tampil placeholder).
   Contoh:  hero: "hero.png",  who: "rifa.jpg"
   Foto yang diunggah lewat tombol "Edit foto" (hanya di browser Anda) menimpa foto bawaan. */
export const PHOTOS: Record<string, string> = {
  who: "",
  work0: "work01.png", work1: "", work2: "", work3: "", work4: "", work5: "",
  /* screenshot detail project: id "work0-s0", "work0-s1", ... mis. "work0-s0": "ugc-1.png" */
  edu0: "", edu1: "", edu2: "",
};

/* Animasi selalu berjalan, termasuk di perangkat yang mematikan animasi.
   Ubah ke true jika ingin menghormati pengaturan "reduced motion" pengunjung. */
export const RESPECT_REDUCED_MOTION = false;
export const SHOW_EDITOR = import.meta.env.DEV || location.search.includes("edit");

export const Edit = createContext(false);
export const reduced = () => RESPECT_REDUCED_MOTION && matchMedia("(prefers-reduced-motion: reduce)").matches;
export const letters = (s: string) => s.split("").map((c, i) => <span key={i}>{c === " " ? "\u00A0" : c}</span>);

async function shrink(file: File) {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = bmp.width * k; c.height = bmp.height * k;
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.86);
}

export function Slot({ id, label = "Foto", className = "" }: { id: string; label?: string; className?: string }) {
  const editing = useContext(Edit);
  const key = `slot:${id}`;
  const [src, setSrc] = useState(() => localStorage.getItem(key) || "");
  const def = PHOTOS[id] ? `${import.meta.env.BASE_URL}photos/${PHOTOS[id]}` : "";
  const [bad, setBad] = useState(false);
  const shown = src || (bad ? "" : def);
  const ref = useRef<HTMLInputElement>(null);
  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f?.type.startsWith("image/")) return;
    const url = await shrink(f);
    setSrc(url);
    try { localStorage.setItem(key, url); } catch { /* penyimpanan penuh */ }
  };
  const clear = () => { localStorage.removeItem(key); setSrc(""); };
  return (
    <div className={`slot ${className} ${editing ? "editing" : ""}`}>
      {shown ? <img src={shown} alt={label} onError={() => !src && setBad(true)} /> : <span className="ph"><b>+</b>{label}</span>}
      {editing && (
        <div className="slot-ui">
          <button onClick={() => ref.current?.click()}>{shown ? "Ganti" : "Unggah"}</button>
          {src && <button onClick={clear} aria-label="Hapus foto">×</button>}
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" hidden onChange={pick} />
    </div>
  );
}

export const AppCtx = createContext<{ go: (to: string) => void; lenis: MutableRefObject<Lenis | null> }>({ go: () => {}, lenis: { current: null } });

export function countUp(scope: HTMLElement) {
  scope.querySelectorAll<HTMLElement>(".num").forEach((el) => {
    const o = { v: 0 };
    gsap.to(o, { v: +el.dataset.n!, duration: 1.8, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 94%", once: true },
      onUpdate: () => { el.textContent = Math.round(o.v) + el.dataset.s!; } });
  });
}

export function Next({ to, label }: { to: string; label: string }) {
  const { go } = useContext(AppCtx);
  return (
    <button className="next" onClick={() => go(to)}>
      <small>Halaman berikutnya</small><span>{label}</span><i aria-hidden>→</i>
    </button>
  );
}
