import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger, P, Slot, letters, reduced, Next } from "../shared";

export default function Edu() {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (reduced()) return;
    const ctx = gsap.context(() => {
      gsap.from(".pg-title span", { yPercent: 110, stagger: 0.04, duration: 1, ease: "expo.out" });
      gsap.from(".edu-head .sub", { y: 24, autoAlpha: 0, delay: 0.6 });

      /* Timeline: garis tergambar, titik menyala, tahun raksasa bergeser */
      gsap.to(".tl-line i", { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 65%", scrub: 0.4 } });
      gsap.utils.toArray<HTMLElement>(".tl-item").forEach((it) => {
        gsap.fromTo(it.querySelector(".tl-year"), { xPercent: -14 }, { xPercent: 6, ease: "none",
          scrollTrigger: { trigger: it, start: "top bottom", end: "bottom top", scrub: true } });
        gsap.from(it.querySelectorAll(".tl-body > *"), { x: 40, autoAlpha: 0, stagger: 0.09, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: it, start: "top 78%" } });
        ScrollTrigger.create({ trigger: it, start: "top 60%", toggleClass: { targets: it, className: "on" } });
      });

      gsap.from(".foot h2 span", { yPercent: 110, stagger: 0.035, duration: 0.8, ease: "expo.out", scrollTrigger: { trigger: ".foot", start: "top 80%" } });
      const m = root.current!.querySelector<HTMLElement>(".mail")!;
      if (matchMedia("(hover: hover)").matches) {
        m.addEventListener("mousemove", (e) => { const r = m.getBoundingClientRect();
          gsap.to(m, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.5, duration: 0.3 }); });
        m.addEventListener("mouseleave", () => gsap.to(m, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1,0.4)" }));
      }
    }, root);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root}>
      <header className="band t-paper2 edu-head">
        <div className="wrap">
          <h2 className="pg-title huge" aria-label="Education">{letters("EDUCATION")}</h2>
          <p className="sub">Pendidikan formal dan pelatihan yang membentuk cara saya bekerja.</p>
        </div>
      </header>

      <section className="band t-ink2">
        <div className="wrap timeline">
          <div className="tl-line"><i /></div>
          {P.edu.map((e, i) => (
            <article key={e.title} className="tl-item">
              <div className="tl-year" aria-hidden>{e.year}</div>
              <div className="tl-body">
                <small>{e.year}</small><h3>{e.title}</h3><b>{e.place}</b><p>{e.note}</p>
                <Slot id={`edu${i}`} label="Foto / sertifikat" className="tl-slot" />
              </div>
            </article>))}
        </div>
      </section>

      <section id="contact" className="band t-paper foot">
        <div className="wrap">
          <h2 aria-label="Ayo bekerja sama">{letters("AYO BEKERJA SAMA")}</h2>
          <a className="mail" href={`mailto:${P.email}`}>{P.email}</a>
        </div>
      </section>
      <Next to="/" label="KEMBALI KE AWAL" />
    </div>
  );
}
