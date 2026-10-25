import { useLayoutEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, Edit, P, reduced, SHOW_EDITOR } from "./shared";
import Home from "./pages/Home";
import Work from "./pages/Work";
import Edu from "./pages/Edu";
import { AppCtx } from './AppContext';
const ROUTES = [
  { path: "/", label: "Home", C: Home },
  { path: "/work", label: "My work", C: Work },
  { path: "/edu", label: "Education", C: Edu },
];
const parse = () => { const h = location.hash.replace(/^#/, "") || "/"; return ROUTES.some((r) => r.path === h) ? h : "/"; };

export default function App() {
  const [route, setRoute] = useState(parse);
  const [editing, setEditing] = useState(false);
  const busy = useRef(false);
  const label = useRef<HTMLSpanElement>(null);
  /* Lenis dibuat saat render agar sudah tersedia untuk halaman anak */
  const lenis = useRef<Lenis | null>(null);
  if (!lenis.current && !reduced()) {
    lenis.current = new Lenis({ lerp: 0.085 });
    lenis.current.on("scroll", ScrollTrigger.update);
  }

  useLayoutEffect(() => {
    const l = lenis.current;
    const onHash = () => { setRoute(parse()); l?.scrollTo(0, { immediate: true }); };
    addEventListener("hashchange", onHash);
    const over = (e: MouseEvent) => {
      const hit = (e.target as Element).closest("button, a, .pile-scroll, .shot, .acc article");
      gsap.to(".cursor", { scale: hit ? 3.4 : 1, duration: 0.3, overwrite: "auto" });
    };
    const move = (() => {
      const cx = gsap.quickTo(".cursor", "x", { duration: 0.25 }), cy = gsap.quickTo(".cursor", "y", { duration: 0.25 });
      return (e: MouseEvent) => { cx(e.clientX); cy(e.clientY); };
    })();
    addEventListener("mousemove", move); addEventListener("mouseover", over);
    let tick: ((t: number) => void) | undefined;
    if (l) {
      document.documentElement.dataset.motion = "on";
      tick = (t) => l.raf(t * 1000);
      gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
    }
    const bar = gsap.to(".progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
    return () => {
      removeEventListener("hashchange", onHash); removeEventListener("mousemove", move); removeEventListener("mouseover", over);
      bar.scrollTrigger?.kill(); bar.kill();
      if (tick) gsap.ticker.remove(tick);
      l?.destroy(); lenis.current = null;
    };
  }, []);

  useLayoutEffect(() => { document.title = `${ROUTES.find((r) => r.path === route)!.label} — ${P.first}`; }, [route]);

  /* Transisi halaman: tirai naik, halaman diganti, tirai turun */
  const go = (to: string) => {
    if (to === route || busy.current) return;
    const swap = () => { location.hash = to; setRoute(to); lenis.current?.scrollTo(0, { immediate: true }); window.scrollTo(0, 0); };
    if (reduced()) return swap();
    busy.current = true;
    label.current!.textContent = ROUTES.find((r) => r.path === to)!.label;
    gsap.timeline({ onComplete: () => { busy.current = false; } })
      .set(".curtain", { transformOrigin: "50% 100%" })
      .to(".curtain", { scaleY: 1, duration: 0.6, ease: "power4.inOut" })
      .from(".curtain span", { yPercent: 110, duration: 0.5, ease: "expo.out" }, "-=0.25")
      .add(swap, "+=0.15")
      .set(".curtain", { transformOrigin: "50% 0%" })
      .to(".curtain", { scaleY: 0, duration: 0.7, ease: "power4.inOut" }, "+=0.2");
  };

  const idx = ROUTES.findIndex((r) => r.path === route);
  const Page = ROUTES[idx].C;
  return (
    <Edit.Provider value={editing}>
      <AppCtx.Provider value={{ go, lenis }}>
        <div className="progress" /><div className="cursor" />
        <div className="curtain" aria-hidden><span ref={label} /></div>
        <nav className="topbar" aria-label="Halaman">
          <button className="logo" onClick={() => go("/")}>{P.first}</button>
          {ROUTES.map((r) => (
            <button key={r.path} aria-current={r.path === route ? "page" : undefined} onClick={() => go(r.path)}>{r.label}</button>))}
          <span className="pageno">{String(idx + 1).padStart(2, "0")} / 03</span>
        </nav>
        <main><Page key={route} /></main>
        {SHOW_EDITOR && (
          <button className="edit-toggle" aria-pressed={editing} onClick={() => setEditing(!editing)}>
            {editing ? "Selesai edit foto" : "Edit foto"}
          </button>
        )}
      </AppCtx.Provider>
    </Edit.Provider>
  );
}
