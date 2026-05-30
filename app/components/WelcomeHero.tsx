"use client";

import Image from "next/image";

const SYMBOLS = [
  { s: "π",  top: "10%",  left: "5%",   size: "2.2rem", delay: "0s",    dur: "7s"  },
  { s: "∑",  top: "20%",  left: "89%",  size: "2.6rem", delay: "1.2s",  dur: "9s"  },
  { s: "∞",  top: "58%",  left: "3%",   size: "2.2rem", delay: "0.6s",  dur: "8s"  },
  { s: "√",  top: "72%",  left: "92%",  size: "2.4rem", delay: "2s",    dur: "6s"  },
  { s: "∫",  top: "82%",  left: "11%",  size: "2.8rem", delay: "1.5s",  dur: "10s" },
  { s: "Δ",  top: "7%",   left: "77%",  size: "2rem",   delay: "0.3s",  dur: "8s"  },
  { s: "θ",  top: "44%",  left: "95%",  size: "1.8rem", delay: "2.5s",  dur: "7s"  },
  { s: "≥",  top: "50%",  left: "1%",   size: "2rem",   delay: "1s",    dur: "9s"  },
  { s: "⊂",  top: "89%",  left: "71%",  size: "1.8rem", delay: "3s",    dur: "8s"  },
  { s: "∂",  top: "16%",  left: "47%",  size: "1.6rem", delay: "2.2s",  dur: "11s" },
];

export function WelcomeHero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Subtle radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% -5%, rgba(148,163,184,0.13) 0%, transparent 70%)",
        }}
      />

      {/* Floating math symbols */}
      {SYMBOLS.map(({ s, top, left, size, delay, dur }, i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute select-none anim-float"
          style={{
            top, left, fontSize: size,
            animationDelay: delay,
            animationDuration: dur,
            opacity: 0.12,
            fontFamily: "Georgia, serif",
            color: "#334155",
            lineHeight: 1,
          }}
        >
          {s}
        </span>
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-lg mx-auto px-5 pt-16 pb-14 text-center">

        {/* Logo */}
        <div className="anim-pop d-100 mb-7">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 shadow-lg mx-auto ring-1 ring-slate-200">
            <Image
              src="/logo.jpeg"
              alt="Polygon"
              width={80}
              height={80}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </div>

        {/* "Mathematics Melee" — classy serif display */}
        <div className="anim-fade-up d-200">
          <h1
            className="text-5xl sm:text-6xl font-light tracking-[0.12em] uppercase text-slate-900 leading-none"
            style={{ fontFamily: "var(--font-cormorant)", letterSpacing: "0.14em" }}
          >
            Mathematics Melee
          </h1>
        </div>

        {/* "by Polygon · IIT Guwahati" */}
        <div className="anim-fade-up d-350">
          <p
            className="mt-3 text-sm font-medium tracking-widest text-slate-400 uppercase"
            style={{ fontFamily: "var(--font-cormorant)", letterSpacing: "0.2em" }}
          >
            by Polygon &middot; IIT Guwahati
          </p>
        </div>

        {/* Thin rule */}
        <div className="anim-fade-in d-500 flex items-center gap-4 my-8 justify-center">
          <span className="h-px w-16 bg-slate-200" />
          <span className="text-slate-300 text-xs tracking-widest uppercase">Summer 2026</span>
          <span className="h-px w-16 bg-slate-200" />
        </div>

        {/* Badge */}
        <div className="anim-pop d-500 inline-flex items-center gap-2 border border-slate-200 bg-white rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium tracking-widest text-slate-500 uppercase">
            Supremum Round · Now Open
          </span>
        </div>

        {/* Congratulations */}
        <div className="anim-fade-up d-500">
          <h2
            className="shimmer-text text-4xl sm:text-5xl font-semibold tracking-tight leading-none mb-4"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Congratulations!
          </h2>
        </div>

        <div className="anim-fade-up d-650">
          <p className="text-lg text-slate-500 mb-2">
            You have qualified for the
          </p>
          <p
            className="text-2xl font-semibold text-slate-900 mb-8"
            style={{ fontFamily: "var(--font-cormorant)", letterSpacing: "0.04em" }}
          >
            Supremum Round
          </p>
        </div>

        {/* Book your session divider */}
        <div className="anim-fade-in d-800 flex items-center gap-3 mb-6 justify-center">
          <span className="h-px w-12 bg-slate-200" />
          <span className="text-slate-300 text-xs tracking-widest uppercase">Book your session</span>
          <span className="h-px w-12 bg-slate-200" />
        </div>

        <div className="anim-fade-up d-800">
          <p className="text-sm text-slate-500 leading-relaxed mb-10 max-w-sm mx-auto">
            Select a date on the calendar below to reserve your interview slot.
            Spots are limited and allocated on a first-come, first-served basis.
          </p>
        </div>

        {/* Scroll cue */}
        <div className="anim-fade-in d-1000 flex flex-col items-center gap-1">
          <span className="text-xs text-slate-400 tracking-widest uppercase">Select a date</span>
          <span className="anim-bounce text-slate-400 text-lg mt-1">↓</span>
        </div>
      </div>
    </section>
  );
}
