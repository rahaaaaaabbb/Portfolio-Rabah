import { useContext, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import { gsap, ScrollTrigger, Edit, P, Slot, letters, reduced, Next } from "../shared";

const STEP = 32, GAP = 26, PAD = 40; /* STEP harus sama dengan 32px di CSS (.pcard h3 & .pile-inner) */
const JIT: [number, number][] = [[-8, -2.2], [6, 1.6], [-4, -1.2], [9, 2.4], [-7, -1.8], [3, 1.2]]; /* goyangan tumpukan buku */
const pad2 = (n: number) => String(n).padStart(2, "0");

export default function Work() {
  const editing = useContext(Edit);
  const root = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<number | null>(null);
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  const openRef = useRef(false); openRef.current = open;
  const detailRef = useRef<number | null>(null); detailRef.current = detail;
  const zoomRef = useRef<typeof zoom>(null); zoomRef.current = zoom;
  const first = useRef(true);
  const shown = useRef(false);
  const originRef = useRef<DOMRect | null>(null);
  const drag = useRef<{ on: boolean; x: number; l: number; moved: boolean; card: HTMLElement | null }>({ on: false, x: 0, l: 0, moved: false, card: null });

  /* ===== Tumpuk <-> memencar dari kiri ke kanan ===== */
  const place = (isOpen: boolean, animate: boolean) => {
    const sc = scroller.current!, box = inner.current!;
    const cards = Array.from(box.querySelectorAll<HTMLElement>(".pcard"));
    const n = cards.length, cw = cards[0].offsetWidth, sw = sc.clientWidth;
    const dur = animate && !reduced() ? 1 : 0;
    if (isOpen) box.style.width = `${Math.max(sw, PAD * 2 + n * cw + (n - 1) * GAP)}px`;
    else if (!dur) box.style.width = "100%";
    cards.forEach((c, i) => {
      const [jx, jr] = JIT[i % JIT.length];
      const to = isOpen ? { x: PAD + i * (cw + GAP), y: (STEP * (n - 1)) / 2, rotation: 0 }
                        : { x: sw / 2 - cw / 2 + jx, y: i * STEP, rotation: jr };
      gsap.to(c, { ...to, duration: dur, ease: "power3.inOut", overwrite: true,
        delay: dur ? (isOpen ? i * 0.07 : (n - 1 - i) * 0.05) : 0,
        onComplete: !isOpen && i === 0 ? () => { if (!openRef.current) box.style.width = "100%"; } : undefined });
    });
    if (!isOpen) gsap.to(sc, { scrollLeft: 0, duration: dur, ease: "power3.inOut" });
  };

  useLayoutEffect(() => {
    place(false, false);
    const ro = new ResizeObserver(() => place(openRef.current, false));
    ro.observe(scroller.current!);
    return () => ro.disconnect();
  }, []);
  useEffect(() => { if (first.current) { first.current = false; return; } place(open, true); }, [open]);

  /* ===== Detail project: screenshot memecah keluar dari kartu ===== */
  const cardOf = (i: number) => inner.current!.querySelector<HTMLElement>(`.pcard[data-i="${i}"]`);
  const openDetail = (i: number) => { originRef.current = cardOf(i)?.getBoundingClientRect() ?? null; setDetail(i); };

  useLayoutEffect(() => {
    scroller.current?.toggleAttribute("inert", detail !== null);
    head.current?.toggleAttribute("inert", detail !== null);
    if (detail === null) return;
    const L = layer.current!;
    const firstTime = !shown.current; shown.current = true;
    const focusBack = () => setTimeout(() => L.querySelector<HTMLElement>(".dt-back")?.focus({ preventScroll: true }), 450);
    if (reduced()) { gsap.set(L, { autoAlpha: 1 }); focusBack(); return; }
    gsap.fromTo(L, { autoAlpha: firstTime ? 0 : 1 }, { autoAlpha: 1, duration: firstTime ? 0.35 : 0 });
    const gr = L.querySelector<HTMLElement>(".dt-shots")!.getBoundingClientRect();
    const o = originRef.current;
    const ox = o ? o.left + o.width / 2 : gr.left + gr.width / 2, oy = o ? o.top + o.height / 2 : gr.top + gr.height / 2;
    L.querySelectorAll<HTMLElement>(".shot").forEach((s, k) => {
      const r = s.getBoundingClientRect();
      gsap.from(s, { x: ox - (r.left + r.width / 2), y: oy - (r.top + r.height / 2), scale: 0.22, rotation: (k % 2 ? 1 : -1) * (7 + k * 3),
        autoAlpha: 0, duration: 1, delay: 0.1 + k * 0.08, ease: "power3.out" });
    });
    gsap.from(L.querySelectorAll(".dt-anim"), { y: 28, autoAlpha: 0, stagger: 0.07, duration: 0.7, delay: 0.15, ease: "power3.out" });
    focusBack();
  }, [detail]);

  const closeDetail = () => {
    const L = layer.current, i = detailRef.current;
    if (!L || i === null) return;
    const done = () => { shown.current = false; setDetail(null); };
    if (reduced()) return done();
    const o = cardOf(i)!.getBoundingClientRect();
    const ox = o.left + o.width / 2, oy = o.top + o.height / 2;
    const shots = Array.from(L.querySelectorAll<HTMLElement>(".shot"));
    shots.forEach((s, k) => {
      const r = s.getBoundingClientRect();
      gsap.to(s, { x: `+=${ox - (r.left + r.width / 2)}`, y: `+=${oy - (r.top + r.height / 2)}`, scale: 0.22, rotation: (k % 2 ? -1 : 1) * (7 + k * 3),
        autoAlpha: 0, duration: 0.6, delay: (shots.length - 1 - k) * 0.04, ease: "power3.in", overwrite: true });
    });
    gsap.to(L.querySelectorAll(".dt-anim"), { autoAlpha: 0, y: -16, stagger: 0.03, duration: 0.3, overwrite: true });
    gsap.to(L, { autoAlpha: 0, duration: 0.3, delay: 0.55, onComplete: done });
  };
  const switchTo = (j: number) => {
    const L = layer.current; if (!L) return;
    originRef.current = null;
    if (reduced()) return setDetail(j);
    gsap.to([...Array.from(L.querySelectorAll(".shot")), ...Array.from(L.querySelectorAll(".dt-anim"))],
      { autoAlpha: 0, y: -24, stagger: 0.015, duration: 0.3, overwrite: true, onComplete: () => setDetail(j) });
  };

  useEffect(() => {
    const esc = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (zoomRef.current) setZoom(null);
      else if (detailRef.current !== null) closeDetail();
      else setOpen(false);
    };
    addEventListener("keydown", esc); return () => removeEventListener("keydown", esc);
  }, []);

  useLayoutEffect(() => {
    if (reduced()) return;
    const ctx = gsap.context(() => {
      gsap.from(".pile-head h2 span", { yPercent: 110, stagger: 0.04, duration: 0.9, ease: "expo.out" });
      gsap.from(".pile-ctrl", { autoAlpha: 0, y: 12, delay: 0.7 });
      gsap.from(".pcard", { autoAlpha: 0, yPercent: 35, stagger: 0.1, duration: 0.9, ease: "power3.out", delay: 0.45 });
      gsap.from(".comp .wrap > *", { y: 50, autoAlpha: 0, stagger: 0.12, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: ".comp", start: "top 75%" } });
      gsap.from(".acc article", { yPercent: 25, autoAlpha: 0, stagger: 0.12, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".acc", start: "top 88%" } });
    }, root);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => ctx.revert();
  }, []);

  /* ===== Interaksi tumpukan ===== */
  const onKey = (e: KeyboardEvent) => { if (!open && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setOpen(true); } };
  const down = (e: PointerEvent) => {
    drag.current = { on: false, x: e.clientX, l: scroller.current!.scrollLeft, moved: false, card: (e.target as Element).closest<HTMLElement>(".pcard") };
    if (open && e.pointerType === "mouse") { drag.current.on = true; scroller.current!.setPointerCapture(e.pointerId); }
  };
  const move = (e: PointerEvent) => {
    if (!drag.current.on) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 5) drag.current.moved = true;
    scroller.current!.scrollLeft = drag.current.l - dx;
  };
  const up = () => { drag.current.on = false; };
  const click = (e: MouseEvent) => {
    if ((e.target as Element).closest(".slot-ui")) return;
    if (!open) return setOpen(true);
    const c = drag.current.card;
    if (c && !drag.current.moved) openDetail(+c.dataset.i!); /* klik project tertentu -> buka detail */
  };
  const nudge = (d: number) => scroller.current!.scrollBy({ left: d * scroller.current!.clientWidth * 0.6, behavior: "smooth" });
  const zoomShot = (e: MouseEvent<HTMLElement>, alt: string) => {
    if (editing || (e.target as Element).closest(".slot-ui")) return;
    const img = e.currentTarget.querySelector("img");
    if (img) setZoom({ src: img.src, alt });
  };

  const w = detail !== null ? P.work[detail] : null;
  const n = P.work.length;
  return (
    <div ref={root}>
      <section className={`pile ${open ? "open" : ""}`}>
        <div ref={head} className="pile-head">
          <h2 aria-label="My work includes">{letters("MY WORK INCLUDES")}</h2>
          <div className="pile-ctrl">
            {open ? (<>
              <span className="pile-hint">Klik project untuk melihat detail</span>
              <button className="arrow" aria-label="Geser ke kiri" onClick={() => nudge(-1)}>←</button>
              <button className="arrow" aria-label="Geser ke kanan" onClick={() => nudge(1)}>→</button>
              <button onClick={() => setOpen(false)}>Tumpuk kembali</button>
            </>) : <span className="pile-hint">Klik tumpukan untuk membuka →</span>}
          </div>
        </div>
        <div ref={scroller} className="pile-scroll" role={open ? undefined : "button"} tabIndex={open ? -1 : 0}
          aria-expanded={open} aria-label={open ? undefined : "Buka tumpukan project"}
          onClick={click} onKeyDown={onKey} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          <div ref={inner} className="pile-inner">
            {P.work.map((p, i) => (
              <article key={p.title} className="pcard" data-i={i} style={{ zIndex: i + 1 }}
                tabIndex={open ? 0 : -1} role={open ? "button" : undefined} aria-label={open ? `Lihat detail ${p.title}` : undefined}
                onKeyDown={(e) => { if (open && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); e.stopPropagation(); openDetail(i); } }}>
                <h3>{p.title}</h3><Slot id={`work${i}`} label={p.title} /><p>{p.desc}</p>
              </article>))}
          </div>
        </div>

        {w && detail !== null && (
          <div ref={layer} className="detail" role="dialog" aria-modal="true" aria-label={`Detail ${w.title}`} data-lenis-prevent>
            <div key={detail} className="dt-grid">
              <div className="dt-left">
                <button className="dt-back dt-anim" onClick={closeDetail}>← Kembali ke tumpukan</button>
                <small className="dt-anim">{pad2(detail + 1)} / {pad2(n)} · {w.year}</small>
                <h3 className="dt-title dt-anim">{w.title}</h3>
                <p className="dt-desc dt-anim">{w.desc}</p>
                <dl className="dt-meta dt-anim">
                  <dt>Peran</dt><dd>{w.role}</dd>
                  <dt>Tools</dt><dd>{w.tools.map((t) => <span key={t} className="tag">{t}</span>)}</dd>
                </dl>
                <ul className="dt-points dt-anim">{w.points.map((x) => <li key={x}>{x}</li>)}</ul>
                <div className="dt-nav dt-anim">
                  <button aria-label="Project sebelumnya" onClick={() => switchTo((detail + n - 1) % n)}>←</button>
                  <button aria-label="Project berikutnya" onClick={() => switchTo((detail + 1) % n)}>→</button>
                </div>
              </div>
              <div className="dt-shots" data-n={w.shots.length}>
                {w.shots.map((cap, k) => (
                  <figure key={cap} className="shot" onClick={(e) => zoomShot(e, cap)}>
                    <Slot id={`work${detail}-s${k}`} label={cap} />
                    <figcaption>{cap}</figcaption>
                  </figure>))}
              </div>
            </div>
          </div>
        )}
      </section>

      {zoom && (
        <div className="lb" role="dialog" aria-modal="true" aria-label={zoom.alt} onClick={() => setZoom(null)}>
          <img src={zoom.src} alt={zoom.alt} />
        </div>
      )}

      <section className="band t-ink2 comp">
        <div className="wrap">
          <h2>KOMPETENSI & NILAI TAMBAH</h2>
          <p className="sub">Hal-hal yang membuat hasil kerja saya lebih dari sekadar konten yang terjadwal. Arahkan kursor ke tiap panel.</p>
        </div>
        <div className="acc">{P.comp.map(([t, d]) => (<article key={t} tabIndex={0}><h3>{t}</h3><p>{d}</p></article>))}</div>
      </section>
      <Next to="/edu" label="EDUCATION" />
    </div>
  );
}
