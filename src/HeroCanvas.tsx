import { useEffect, useRef, type ReactNode } from "react";

/* ====== PENGATURAN HERO (frame sequence) ======
   Letakkan frame di public/frames/ dengan nama frame_0001.jpg ... frame_0150.jpg */
export const HERO = {
  frames: 150,            // jumlah frame
  dir: "frames",          // folder di dalam public/
  prefix: "frame_",       // awalan nama file, mis. "ezgif-frame-" untuk ezgif-frame-001.png
  ext: "jpg",             // jpg | png | webp
  pad: 4,                 // frame_0001 -> 4 digit
  scrollVh: 500,          // tinggi area scroll hero (vh)
  overlapVh: 100,         // bagian bawah yang ditimpa section berikutnya (efek membungkus)
  lerp: 0.12,             // 0.05 = sangat halus/lambat, 0.3 = responsif
  concurrency: 6,         // jumlah unduhan frame bersamaan
  respectReducedMotion: true,
};
export const canvasReduce = () => HERO.respectReducedMotion && matchMedia("(prefers-reduced-motion: reduce)").matches;
const src = (i: number) => `${import.meta.env.BASE_URL}${HERO.dir}/${HERO.prefix}${String(i + 1).padStart(HERO.pad, "0")}.${HERO.ext}`;

export default function HeroCanvas({ children }: { children: ReactNode }) {
  const wrap = useRef<HTMLElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const bar = useRef<HTMLElement>(null);
  const miss = useRef<HTMLParagraphElement>(null);
  const reduce = canvasReduce();

  useEffect(() => {
    const el = wrap.current!, canvas = cv.current!, ctx = canvas.getContext("2d")!;
    const N = HERO.frames;
    const imgs: (HTMLImageElement | undefined)[] = new Array(N);
    let loaded = 0, w = 0, h = 0, dpr = 1, total = 1, target = 0, current = 0, shown = -1;
    let dirty = true, visible = true, first = true, alive = true, raf = 0, last = performance.now();

    /* frame terdekat yang sudah dimuat, jadi canvas tidak pernah kosong */
    const nearest = (i: number) => {
      if (imgs[i]) return i;
      for (let d = 1; d < N; d++) {
        if (i - d >= 0 && imgs[i - d]) return i - d;
        if (i + d < N && imgs[i + d]) return i + d;
      }
      return -1;
    };
    const draw = (i: number) => {
      const k = nearest(i);
      if (k < 0) return false;
      const im = imgs[k]!;
      const s = Math.max(w / im.naturalWidth, h / im.naturalHeight); /* cover */
      const dw = im.naturalWidth * s, dh = im.naturalHeight * s;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(im, (w - dw) / 2, (h - dh) / 2, dw, dh);
      return true;
    };
    const measure = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height; dpr = Math.min(2, window.devicePixelRatio || 1); /* dukung retina */
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      total = Math.max(1, el.offsetHeight - h - (HERO.overlapVh / 100) * window.innerHeight);
      if (shown >= 0) draw(shown); /* gambar ulang langsung agar tidak berkedip */
    };

    /* muat bertahap: frame 1 dan terakhir dulu, lalu kasar -> halus */
    const load = async (i: number) => {
      const im = new Image(); im.decoding = "async"; im.src = src(i);
      try { await im.decode(); } catch { if (i === 0 && miss.current && import.meta.env.DEV) miss.current.hidden = false; return; }
      imgs[i] = im; loaded++; dirty = true;
      if (bar.current) bar.current.style.transform = `scaleX(${loaded / N})`;
      if (loaded === N && bar.current?.parentElement) bar.current.parentElement.style.opacity = "0";
    };
    const order: number[] = [], seen = new Set<number>();
    const add = (i: number) => { if (i >= 0 && i < N && !seen.has(i)) { seen.add(i); order.push(i); } };
    add(0); add(N - 1);
    [30, 10, 5, 2, 1].forEach((st) => { for (let i = 0; i < N; i += st) add(i); });
    let active = 0;
    const pump = () => {
      while (alive && active < HERO.concurrency && order.length) { active++; load(order.shift()!).finally(() => { active--; pump(); }); }
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible) { last = now; return; }
      const dt = Math.min(64, now - last); last = now;
      target = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total)); /* progres scroll 0..1 */
      if (first || reduce) { current = target; first = false; }
      else {
        current += (target - current) * (1 - Math.pow(1 - HERO.lerp, dt * 0.06)); /* lerp tak bergantung fps */
        if (Math.abs(target - current) < 0.0003) current = target;
      }
      const idx = Math.round(current * (N - 1)); /* 0% -> frame 1, 100% -> frame N */
      if (idx !== shown || dirty) { if (draw(idx)) { shown = idx; dirty = false; } }
    };

    measure(); pump(); raf = requestAnimationFrame(tick);
    const ro = new ResizeObserver(measure); ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) { dirty = true; last = performance.now(); } });
    io.observe(el);
    return () => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [reduce]);

  return (
    <header ref={wrap} className="hero-scroll" data-reduce={reduce || undefined} style={{ height: `${HERO.scrollVh}vh` }}>
      <div className="hero">
        <canvas ref={cv} className="hero-canvas" aria-hidden />
        {children}
        <div className="hero-load" aria-hidden><i ref={bar} /></div>
        <p ref={miss} className="hero-miss" hidden>Frame tidak ditemukan di <code>public/frames/</code>. Cek prefix, pad, ext, dan jumlah frame di HERO</p>
      </div>
    </header>
  );
}
