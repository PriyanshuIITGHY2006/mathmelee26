"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import localFont from "next/font/local";
import styles from "./finalists.module.css";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const script = localFont({ src: "../limit-point-f2137704/fonts/Pestapora.otf",   variable: "--ff-script", display: "swap" });
const serif  = localFont({ src: [
  { path: "../limit-point-f2137704/fonts/CMUSerif-Roman.ttf", weight: "400", style: "normal" },
  { path: "../limit-point-f2137704/fonts/CMUSerif-Bold.ttf",  weight: "700", style: "normal" },
], variable: "--ff-serif", display: "swap" });
const mono   = localFont({ src: "../limit-point-f2137704/fonts/JetBrainsMono.ttf", variable: "--ff-mono",   display: "swap" });
const caps   = localFont({ src: "../limit-point-f2137704/fonts/Montserrat.ttf",    variable: "--ff-caps",   display: "swap" });

const FINALISTS = [
  "Finalist 01", "Finalist 02", "Finalist 03", "Finalist 04", "Finalist 05",
  "Finalist 06", "Finalist 07", "Finalist 08", "Finalist 09", "Finalist 10",
  "Finalist 11", "Finalist 12", "Finalist 13", "Finalist 14", "Finalist 15",
  "Finalist 16", "Finalist 17", "Finalist 18", "Finalist 19", "Finalist 20",
  "Finalist 21", "Finalist 22", "Finalist 23", "Finalist 24", "Finalist 25",
];

const SYMBOLS = [
  "α","β","γ","δ","ε","ζ","η","θ","ι","κ",
  "λ","μ","ν","ξ","π","ρ","σ","τ","υ","φ",
  "χ","ψ","ω","Ω","∇",
];

const MOTIFS = [
  { s: "∫",       left: "5%",  top: "11%", size: 60, rot: -8, op: 0.065 },
  { s: "∑",       left: "88%", top: "8%",  size: 56, rot:  6, op: 0.065 },
  { s: "∂",       left: "93%", top: "40%", size: 44, rot: 10, op: 0.055 },
  { s: "∞",       left: "7%",  top: "76%", size: 50, rot: -4, op: 0.055 },
  { s: "√",       left: "6%",  top: "88%", size: 40, rot:  0, op: 0.05  },
  { s: "∇",       left: "14%", top: "24%", size: 28, rot:  0, op: 0.055 },
  { s: "θ",       left: "91%", top: "68%", size: 36, rot: -6, op: 0.055 },
  { s: "ℝ",       left: "85%", top: "84%", size: 38, rot:  0, op: 0.05  },
  { s: "∀ε>0",   left: "74%", top: "15%", size: 14, rot: -2, op: 0.065, mono: true },
  { s: "xₙ → L", left: "10%", top: "58%", size: 15, rot: -3, op: 0.065, mono: true },
];

const INITIAL_CODE = `# Mathematics Melee — Round II Entry Protocol
# ────────────────────────────────────────────
# Theorem: You are a limit point of F.
#
# Proof:
#   Step 1. Replace "???" below with your name.
#   Step 2. Do not touch anything else.
#   Step 3. Click Submit and pray to Cauchy.

applicant = "???"

# ── DO NOT EDIT BELOW ─────────────────────────

assert applicant != "???",  "Identity crisis: you are still ???"
assert len(applicant.strip()) > 0, "The empty set is not a finalist"
assert applicant != "YOUR_NAME_HERE", "Bro."

# By submitting you acknowledge:
#  · You have solved at least ε > 0 problems
#  · Your sequence of effort converged
#  · You are, provably, a limit point

print(f"Welcome, {applicant}.")
print(f"∀ε > 0, ∃δ > 0 s.t. you belong here. □")
`;

function extractApplicant(code: string): string | null {
  const m = code.match(/^applicant\s*=\s*"([^"]*)"/m);
  if (!m) return null;
  const v = m[1].trim();
  if (v === "???" || v === "YOUR_NAME_HERE" || v === "") return null;
  return v;
}

export default function FinalistsClient() {
  const [flipped, setFlipped]     = useState<Set<number>>(new Set());
  const [allRevealed, setAll]     = useState(false);
  const [code, setCode]           = useState(INITIAL_CODE);
  const [submitted, setSubmitted] = useState(false);
  const [applicant, setApplicant] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const toggle = (i: number) =>
    setFlipped(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });

  const revealAll = () => { setFlipped(new Set(FINALISTS.map((_,i)=>i))); setAll(true); };

  const handleCode = useCallback((v: string | undefined) => setCode(v ?? ""), []);

  const canSubmit = extractApplicant(code) !== null;

  const handleSubmit = () => {
    const name = extractApplicant(code);
    if (!name) return;
    setApplicant(name);
    setSubmitted(true);
  };

  const allFlipped = flipped.size === FINALISTS.length;

  return (
    <main className={`${script.variable} ${serif.variable} ${mono.variable} ${caps.variable} ${styles.wrap}`}>
      <div className={styles.frame} aria-hidden />

      {MOTIFS.map((m, i) => (
        <span key={i} aria-hidden className={styles.motif} style={{
          left: m.left, top: m.top, fontSize: m.size, opacity: m.op,
          fontFamily: m.mono ? "var(--ff-mono), monospace" : "var(--ff-serif), Georgia, serif",
          ["--r" as string]: `${m.rot}deg`,
          animationDuration: `${7 + (i % 6)}s`,
          animationDelay: `${(i % 8) * 0.5}s`,
        }}>{m.s}</span>
      ))}

      {/* Brand */}
      <header className={styles.brand}>
        <Image className={styles.logo} src="/logo.jpeg" alt="Mathematics Melee" width={36} height={36} />
        <div className={styles.nm}>Mathematics Melee</div>
        <div className={styles.sub}>by Polygon · IIT Guwahati</div>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <p className={styles.roundTag}>Round II</p>
        <h1 className={styles.title}>The Finalists</h1>
        <p className={styles.tagline}>
          Twenty-five sequences of brilliance.<br />One limit point.
        </p>
        <p className={styles.instruction}>
          Click each card to reveal a name.
        </p>
        {!allFlipped && (
          <button className={styles.revealAll} onClick={revealAll}>
            reveal all &nbsp;<span>∀n ∈ ℕ</span>
          </button>
        )}
      </section>

      {/* Cards */}
      <section className={styles.grid} aria-label="Finalists">
        {FINALISTS.map((name, i) => {
          const isFlipped = flipped.has(i);
          return (
            <button
              key={i}
              className={`${styles.card} ${isFlipped ? styles.flipped : ""}`}
              onClick={() => toggle(i)}
              aria-label={isFlipped ? `${name}` : `Reveal finalist ${i + 1}`}
            >
              <div className={styles.inner}>
                <div className={styles.front}>
                  <span className={styles.sym}>{SYMBOLS[i]}</span>
                  <span className={styles.idx}>x<sub>{i+1}</sub></span>
                </div>
                <div className={styles.back}>
                  <span className={styles.fname}>{name}</span>
                </div>
              </div>
            </button>
          );
        })}
      </section>

      {/* Monaco gate */}
      <section className={`${styles.gate} ${(allFlipped || allRevealed) ? styles.gateVisible : ""}`} ref={editorRef}>
        <div className={styles.gateDivider}>
          <span className={styles.bar} />
          <span>Entry Protocol</span>
          <span className={styles.bar} />
        </div>

        {!submitted ? (
          <>
            <p className={styles.gateDesc}>
              If you see your name above — complete the proof below to enter.
            </p>
            <div className={styles.editorWrap}>
              <div className={styles.editorBar}>
                <span className={styles.dot} style={{background:"#ff5f57"}}/>
                <span className={styles.dot} style={{background:"#ffbd2e"}}/>
                <span className={styles.dot} style={{background:"#28c840"}}/>
                <span className={styles.editorTitle}>entry.py</span>
              </div>
              <MonacoEditor
                height="360px"
                defaultLanguage="python"
                value={code}
                onChange={handleCode}
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  fontFamily: "var(--ff-mono), 'JetBrains Mono', monospace",
                  fontLigatures: true,
                  lineNumbers: "on",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  renderLineHighlight: "none",
                  overviewRulerLanes: 0,
                  folding: false,
                  glyphMargin: false,
                  scrollbar: { vertical: "hidden", horizontal: "hidden" },
                  padding: { top: 16, bottom: 16 },
                }}
              />
            </div>
            <button
              className={`${styles.submitBtn} ${canSubmit ? styles.submitReady : ""}`}
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {canSubmit ? "Submit Proof →" : "Replace ??? with your name first"}
            </button>
            {!canSubmit && (
              <p className={styles.submitHint}>
                The proof is incomplete. <code>applicant = "???"</code> is not a valid identity.
              </p>
            )}
          </>
        ) : (
          <div className={styles.accepted}>
            <div className={styles.acceptedMath}>□</div>
            <p className={styles.acceptedLine}>
              Proof accepted, <strong>{applicant}</strong>.
            </p>
            <p className={styles.acceptedSub}>
              ∀ε &gt; 0, every neighbourhood of greatness contains you.
            </p>
            <a className={styles.enterBtn} href="/limit-point-f2137704">
              Enter the Limit Point →
            </a>
            <p className={styles.byInvitation}>By invitation · The Chosen Few</p>
          </div>
        )}
      </section>

      <footer className={styles.foot}>Mathematics Melee · Round II · Summer 2026</footer>
    </main>
  );
}
