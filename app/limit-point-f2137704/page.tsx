// Hidden teaser page for the upcoming "Limit Point" round.
// Reachable only via this secret slug — not linked anywhere, noindex.
import type { Metadata } from "next";
import localFont from "next/font/local";
import styles from "./limitPoint.module.css";
import FinalistLogin from "./FinalistLogin";

const script = localFont({ src: "./fonts/Pestapora.otf", variable: "--font-script", display: "swap" });
const serif = localFont({
  src: [
    { path: "./fonts/CMUSerif-Roman.ttf", weight: "400", style: "normal" },
    { path: "./fonts/CMUSerif-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-serif",
  display: "swap",
});
const caps = localFont({ src: "./fonts/Montserrat.ttf", variable: "--font-caps", display: "swap" });
const ui = localFont({ src: "./fonts/Inter.ttf", variable: "--font-ui", display: "swap" });
const mono = localFont({ src: "./fonts/JetBrainsMono.ttf", variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "The Limit Point — Mathematics Melee",
  robots: { index: false, follow: false },
};

type Motif = { s: string; left: string; top: string; size: number; rot: number; op: number; mono?: boolean };
const MOTIFS: Motif[] = [
  { s: "∫", left: "6%", top: "12%", size: 64, rot: -8, op: 0.07 },
  { s: "∑", left: "88%", top: "10%", size: 60, rot: 6, op: 0.07 },
  { s: "π", left: "4%", top: "46%", size: 50, rot: 0, op: 0.06 },
  { s: "∞", left: "9%", top: "78%", size: 54, rot: -4, op: 0.06 },
  { s: "∂", left: "93%", top: "40%", size: 46, rot: 10, op: 0.06 },
  { s: "√", left: "8%", top: "90%", size: 44, rot: 0, op: 0.05 },
  { s: "∇", left: "16%", top: "25%", size: 30, rot: 0, op: 0.06 },
  { s: "θ", left: "90%", top: "70%", size: 38, rot: -6, op: 0.06 },
  { s: "ℝ", left: "84%", top: "86%", size: 40, rot: 0, op: 0.055 },
  { s: "∀", left: "22%", top: "86%", size: 30, rot: 4, op: 0.06 },
  { s: "∃", left: "78%", top: "22%", size: 28, rot: -3, op: 0.06 },
  { s: "λ", left: "94%", top: "56%", size: 30, rot: 0, op: 0.05 },
  { s: "aₙ → L", left: "11%", top: "60%", size: 18, rot: -4, op: 0.07, mono: true },
  { s: "∑ 1/n²", left: "82%", top: "60%", size: 18, rot: 5, op: 0.07, mono: true },
  { s: "|xₙ − L| < ε", left: "70%", top: "90%", size: 16, rot: 0, op: 0.06, mono: true },
  { s: "∀ε>0", left: "30%", top: "16%", size: 16, rot: 0, op: 0.06, mono: true },
  { s: "∮", left: "50%", top: "8%", size: 34, rot: 0, op: 0.05 },
  { s: "⊂", left: "18%", top: "70%", size: 30, rot: 0, op: 0.05 },
  { s: "≤", left: "87%", top: "30%", size: 30, rot: 0, op: 0.05 },
  { s: "∈", left: "12%", top: "34%", size: 26, rot: 0, op: 0.05 },
];

// Sequence x1..x6 converging to L (SVG coords, viewBox 600x120, L at x=520)
const L_X = 520;
const SEQ = Array.from({ length: 6 }, (_, i) => L_X - 400 * 0.5 ** i);

export default function LimitPointPage() {
  return (
    <main className={`${script.variable} ${serif.variable} ${caps.variable} ${ui.variable} ${mono.variable} ${styles.wrap}`}>
      <div className={styles.frame} />

      {MOTIFS.map((m, i) => (
        <span
          key={i}
          className={styles.motif}
          style={{
            left: m.left,
            top: m.top,
            fontSize: m.size,
            opacity: m.op,
            fontFamily: m.mono ? "var(--font-mono), monospace" : "var(--font-serif), Georgia, serif",
            ["--r" as string]: `${m.rot}deg`,
            animationDuration: `${7 + (i % 6)}s`,
            animationDelay: `${(i % 8) * 0.5}s`,
          }}
        >
          {m.s}
        </span>
      ))}

      <section className={styles.center}>
        <svg className={styles.diagram} viewBox="0 0 600 120" role="img" aria-label="A sequence converging to the limit point L">
          <line className={styles.axisLine} x1="20" y1="60" x2="580" y2="60" />
          <rect className={styles.epsBox} x={L_X - 40} y="30" width="80" height="60" rx="3" />
          <text className={styles.epsLab} x={L_X} y="22" textAnchor="middle">ε</text>
          {SEQ.map((x, k) => (
            <g key={k}>
              <circle className={styles.xn} cx={x} cy="60" r="3.5" />
              {k < 4 && (
                <text className={styles.xlab} x={x} y="82" textAnchor="middle">
                  x{["₁", "₂", "₃", "₄"][k]}
                </text>
              )}
            </g>
          ))}
          <circle cx={L_X} cy="60" r="7.5" fill="#b07d2e" />
          <circle cx={L_X} cy="60" r="7.5" fill="url(#g)" />
          <text className={styles.lLab} x={L_X + 16} y="66">L</text>
          <defs>
            <radialGradient id="g" cx="38%" cy="34%" r="75%">
              <stop offset="0%" stopColor="#e7b15a" />
              <stop offset="70%" stopColor="#b07d2e" />
              <stop offset="100%" stopColor="#8a5e1d" />
            </radialGradient>
          </defs>
        </svg>

        <div className={styles.eyebrow}>
          <span className={styles.bar} />The Finals · Mathematics Melee<span className={styles.bar} />
        </div>
        <h1 className={styles.title}>The Limit Point</h1>

        <div className={styles.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.logo} src="/logo.jpeg" alt="Mathematics Melee" />
          <div className={styles.brandText}>
            <span className={styles.nm}>Mathematics Melee</span>
            <span className={styles.sub}>by Polygon · IIT Guwahati</span>
          </div>
        </div>

        <p className={styles.tagline}>
          Every sequence of brilliance converges to a single point.
          <br />
          <b>You are that point.</b>
        </p>
        <p className={styles.defn}>∀ ε &gt; 0, every neighbourhood of greatness contains you.</p>
        <FinalistLogin />
        <div className={styles.meta}>By Invitation · The Chosen Few</div>
      </section>

      <footer className={styles.foot}>Limit Point Round · Summer 2026</footer>
    </main>
  );
}
