import { useContext, useLayoutEffect, useRef } from "react";
import type Lenis from "lenis";
import { gsap, ScrollTrigger, AppCtx, P, Slot, letters, reduced, countUp, Next } from "../shared";
import HeroCanvas, { canvasReduce, HERO } from "../HeroCanvas";

/* Posisi (0..1 dari progres scroll hero) kapan tiap elemen muncul — sesuaikan dengan isi frame Anda */
const T = { titleOut: 0.2, nameIn: 0.4, nameOut: 0.68, menuIn: 0.8 };

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const { go, lenis } = useContext(AppCtx);

  useLayoutEffect(() => {
    if (reduced()) return;
    let mq: gsap.core.Tween | undefined;
    /* marquee ngebut mengikuti kecepatan scroll, berbalik arah saat scroll naik */
    const off = lenis.current?.on("scroll", (e: Lenis) => {
      if (!mq) return;
      gsap.to(mq, { timeScale: (e.velocity < 0 ? -1 : 1) * (1 + Math.min(6, Math.abs(e.velocity) * 0.5)), duration: 0.3, overwrite: true });
      gsap.to(mq, { timeScale: 1, duration: 1.4, delay: 0.3 });
    });
    const html = document.documentElement;
    const ctx = gsap.context(() => {
      gsap.from(".bw", { autoAlpha: 0, scale: 0.94, duration: 1.2, ease: "power3.out" });
      gsap.from(".bw span", { yPercent: 105, duration: 1, stagger: 0.05, ease: "expo.out" });

      if (!canvasReduce()) {
        html.dataset.hero = "on"; /* navbar atas disembunyikan selama hero; menu muncul di telapak tangan */
        ScrollTrigger.create({ trigger: ".cover", start: "top 35%", end: "max",
          onToggle: (s) => { if (s.isActive) delete html.dataset.hero; else html.dataset.hero = "on"; } });

        gsap.set(".name .nm-script", { clipPath: "inset(0 100% 0 0)" });
        gsap.set(".name .surname span", { yPercent: 115 });
        gsap.set(".name .role, .name-line", { autoAlpha: 0 });
        gsap.set(".name-line", { scaleX: 0, transformOrigin: "0 50%" });
        gsap.set(".hm-bar", { autoAlpha: 0, scale: 0.5, yPercent: 40 });
        gsap.set(".hm-bar button", { autoAlpha: 0, y: 18 });

        const dist = () => document.querySelector<HTMLElement>(".hero-scroll")!.offsetHeight - innerHeight * (1 + HERO.overlapVh / 100);
        gsap.timeline({ defaults: { ease: "none" },
          scrollTrigger: { trigger: ".hero-scroll", start: "top top", end: () => "+=" + dist(), invalidateOnRefresh: true, scrub: 0.6 } })
          /* Frame 1: PORTFOLIO di tengah, lalu hurufnya naik pergi */
          .to(".cue", { autoAlpha: 0, duration: 0.06 }, 0)
          .fromTo(".bw span", { yPercent: 0 }, { yPercent: -125, stagger: 0.015, duration: 0.12, immediateRender: false }, T.titleOut)
          /* Frame 2: nama muncul di kiri atas, searah pandangan mata */
          .to(".name .nm-script", { clipPath: "inset(0 -5% 0 0)", duration: 0.12 }, T.nameIn)
          .to(".name .surname span", { yPercent: 0, stagger: 0.01, duration: 0.1 }, T.nameIn + 0.06)
          .to(".name-line", { autoAlpha: 1, scaleX: 1, duration: 0.08 }, T.nameIn + 0.1)
          .to(".name .role", { autoAlpha: 1, duration: 0.06 }, T.nameIn + 0.12)
          .to(".name", { autoAlpha: 0, xPercent: -6, duration: 0.1 }, T.nameOut)
          /* Frame 3: navbar membulat muncul di telapak tangan */
          .to(".hm-bar", { autoAlpha: 1, scale: 1, yPercent: 0, duration: 0.12 }, T.menuIn)
          .to(".hm-bar button", { autoAlpha: 1, y: 0, stagger: 0.025, duration: 0.08 }, T.menuIn + 0.04)
          .to({}, { duration: 0.03 }, 0.97);

        /* WHO AM I naik membungkus hero */
        gsap.to(".hero", { scale: 0.9, borderRadius: 28, transformOrigin: "50% 0%", ease: "none",
          scrollTrigger: { trigger: ".cover", start: "top bottom", end: "top top", scrub: true } });
      }

      mq = gsap.to(".mq-track", { xPercent: -50, repeat: -1, duration: 28, ease: "none" });

      gsap.set(".reveal", { autoAlpha: 0, y: 60 });
      ScrollTrigger.batch(".reveal", { start: "top 90%", once: true,
        onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.14, ease: "power3.out" }) });
      countUp(root.current!);
      gsap.from(".bar i", { scaleX: 0, transformOrigin: "left", duration: 1.4, stagger: 0.1, ease: "expo.out",
        scrollTrigger: { trigger: ".skills", start: "top 88%" } });
      gsap.from(".chips li", { x: 40, autoAlpha: 0, stagger: 0.1, scrollTrigger: { trigger: ".chips", start: "top 94%" } });
      gsap.from(".logos span", { y: 16, autoAlpha: 0, stagger: 0.08, scrollTrigger: { trigger: ".logos", start: "top 94%" } });
      gsap.to(".who-photo .slot", { yPercent: -6, ease: "none", scrollTrigger: { trigger: ".bio", start: "top bottom", end: "bottom top", scrub: true } });
    }, root);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => { off?.(); ctx.revert(); delete html.dataset.hero; };
  }, []);

  const [first, ...rest] = P.fullName.split(" ");
  const toWho = () => lenis.current ? lenis.current.scrollTo(".cover", { duration: 1.4 }) : document.querySelector(".cover")?.scrollIntoView({ behavior: "smooth" });
  const words = [...P.marquee, ...P.marquee].map((w, i) => <span key={i}>{w}</span>);
  return (
    <div ref={root}>
      <HeroCanvas>
        <h1 className="sr">{P.fullName} — {P.role} Portfolio</h1>
        <div className="center" aria-hidden><div className="bw">{letters("PORTFOLIO")}</div></div>
        <div className="name" aria-hidden>
          <span className="nm-script">{first}</span>
          <span className="surname">{letters(rest.join(" ").toUpperCase())}</span>
          <i className="name-line" />
          <span className="role">{P.role}</span>
        </div>
        <nav className="hm" aria-label="Menu utama">
          <div className="hm-bar">
            <button onClick={toWho}>Who am I</button>
            <button onClick={() => go("/work")}>My work</button>
            <button onClick={() => go("/edu")}>Education</button>
          </div>
        </nav>
        <span className="cue" aria-hidden>↓</span>
      </HeroCanvas>

      <div className="cover" style={{ marginTop: `-${HERO.overlapVh}vh` }}>
        <div className="marquee" aria-hidden><div className="mq-track"><div className="mq-group">{words}</div><div className="mq-group">{words}</div></div></div>
        <section className="band t-ink2">
          <div className="wrap bio">
            <div className="reveal">
              <h2>WHO AM I</h2>
              {P.intro.map((t) => <p key={t}>{t}</p>)}
              <div className="stats">{P.stats.map((s) => (
                <div key={s.l}><b className="num" data-n={s.n} data-s={s.s}>{s.n}{s.s}</b><small>{s.l}</small></div>))}</div>
              <div className="logos">{P.brands.map((b) => <span key={b}>{b}</span>)}</div>
            </div>
            <div className="who-photo reveal"><Slot id="who" label="Foto portrait" /><i className="script sm2">get to know me</i></div>
          </div>
        </section>
      </div>

      <section className="band t-paper2">
        <div className="wrap sk-grid">
          <div className="reveal">
            <h2>HARD SKILLS</h2>
            <p className="sub">Keahlian teknis dan alat yang saya pakai setiap hari.</p>
            <ul className="chips">{P.tools.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
          <div className="skills reveal">{P.skills.map(([n, p]) => (
            <div key={n} className="sk">
              <div className="sk-top"><span>{n}</span><b className="num" data-n={p} data-s="%">{p}%</b></div>
              <div className="bar"><i style={{ transform: `scaleX(${p / 100})` }} /></div>
            </div>))}</div>
        </div>
      </section>
      <Next to="/work" label="MY WORK" />
    </div>
  );
}
