"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./finalists.module.css";

const FINALISTS = [
  "Finalist 01", "Finalist 02", "Finalist 03", "Finalist 04", "Finalist 05",
  "Finalist 06", "Finalist 07", "Finalist 08", "Finalist 09", "Finalist 10",
  "Finalist 11", "Finalist 12", "Finalist 13", "Finalist 14", "Finalist 15",
  "Finalist 16", "Finalist 17", "Finalist 18", "Finalist 19", "Finalist 20",
  "Finalist 21", "Finalist 22", "Finalist 23", "Finalist 24", "Finalist 25",
];

const SYMBOLS = [
  "α","β","γ","δ","ε","ζ","η","θ","ι","κ",
  "λ","μ","ν","ξ","π","ρ","σ","τ","φ","χ",
  "ψ","ω","Ω","∂","∇",
];

const MOTIFS = [
  { s: "∫", left: "5%",  top: "12%", size: 64, rot: -8, op: 0.07 },
  { s: "∑", left: "88%", top: "9%",  size: 60, rot:  6, op: 0.07 },
  { s: "π", left: "3%",  top: "45%", size: 50, rot:  0, op: 0.06 },
  { s: "∞", left: "8%",  top: "77%", size: 54, rot: -4, op: 0.06 },
  { s: "∂", left: "93%", top: "39%", size: 46, rot: 10, op: 0.06 },
  { s: "√", left: "7%",  top: "89%", size: 44, rot:  0, op: 0.05 },
  { s: "∇", left: "15%", top: "25%", size: 30, rot:  0, op: 0.06 },
  { s: "θ", left: "91%", top: "69%", size: 38, rot: -6, op: 0.06 },
  { s: "ℝ", left: "85%", top: "85%", size: 40, rot:  0, op: 0.055 },
  { s: "∀", left: "21%", top: "85%", size: 30, rot:  4, op: 0.06 },
  { s: "∃", left: "79%", top: "21%", size: 28, rot: -3, op: 0.06 },
  { s: "λ", left: "94%", top: "55%", size: 30, rot:  0, op: 0.05 },
];

export default function FinalistsClient() {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [revealedAll, setRevealedAll] = useState(false);

  const toggle = (i: number) => {
    setFlipped(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const revealAll = () => {
    setFlipped(new Set(FINALISTS.map((_, i) => i)));
    setRevealedAll(true);
  };

  const allRevealed = flipped.size === FINALISTS.length;

  return (
    <main className={styles.wrap}>
      <div className={styles.frame} aria-hidden />

      {MOTIFS.map((m, i) => (
        <span
          key={i}
          aria-hidden
          className={styles.motif}
          style={{
            left: m.left, top: m.top,
            fontSize: m.size, opacity: m.op,
            ["--r" as string]: `${m.rot}deg`,
            animationDuration: `${7 + (i % 6)}s`,
            animationDelay: `${(i % 8) * 0.5}s`,
          }}
        >
          {m.s}
        </span>
      ))}

      {/* Brand header */}
      <header className={styles.brand}>
        <Image className={styles.logo} src="/logo.jpeg" alt="Mathematics Melee" width={34} height={34} />
        <div className={styles.nm}>Mathematics Melee</div>
        <div className={styles.sub}>by Polygon · IIT Guwahati</div>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.eyebrow}>
          <span className={styles.bar} />
          Round II · The Limit Point
          <span className={styles.bar} />
        </div>
        <h1 className={styles.title}>The Finalists</h1>
        <p className={styles.subtitle}>
          Twenty-five sequences of brilliance, all converging to one point.
          <br />
          <span className={styles.hint}>Click each symbol to reveal a name.</span>
        </p>

        {!allRevealed && (
          <button className={styles.revealBtn} onClick={revealAll}>
            Reveal All &nbsp;<span className={styles.revealMath}>∀n ∈ F</span>
          </button>
        )}
      </section>

      {/* Cards grid */}
      <section className={styles.grid} aria-label="Finalists">
        {FINALISTS.map((name, i) => {
          const isFlipped = flipped.has(i);
          return (
            <button
              key={i}
              className={`${styles.card} ${isFlipped ? styles.cardFlipped : ""}`}
              onClick={() => toggle(i)}
              aria-label={isFlipped ? `${name} — click to hide` : `Reveal finalist ${i + 1}`}
            >
              <div className={styles.cardInner}>
                <div className={styles.cardFront} aria-hidden={isFlipped}>
                  <span className={styles.symbol}>{SYMBOLS[i]}</span>
                  <span className={styles.cardIndex}>x<sub>{i + 1}</sub></span>
                </div>
                <div className={styles.cardBack} aria-hidden={!isFlipped}>
                  <span className={styles.name}>{name}</span>
                </div>
              </div>
            </button>
          );
        })}
      </section>

      {/* CTA */}
      <section className={`${styles.cta} ${allRevealed || revealedAll ? styles.ctaVisible : ""}`}>
        <div className={styles.ctaDivider}>
          <span className={styles.bar} />
          <span className={styles.ctaDividerText}>∈ The Chosen Set</span>
          <span className={styles.bar} />
        </div>
        <p className={styles.ctaText}>
          If your name appears above, you have been selected for<br />
          <strong>Round II — The Limit Point.</strong>
        </p>
        <a className={styles.ctaBtn} href="/limit-point-f2137704">
          Enter the Limit Point →
        </a>
        <p className={styles.ctaMeta}>By invitation · The Chosen Few</p>
      </section>

      {/* Footer */}
      <footer className={styles.foot}>
        Mathematics Melee · Round II · Summer 2026
      </footer>
    </main>
  );
}
