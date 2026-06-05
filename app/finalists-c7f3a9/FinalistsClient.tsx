"use client";

import { useState, useCallback } from "react";
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
const mono = localFont({ src: "../limit-point-f2137704/fonts/JetBrainsMono.ttf", variable: "--ff-mono", display: "swap" });
const caps = localFont({ src: "../limit-point-f2137704/fonts/Montserrat.ttf",    variable: "--ff-caps", display: "swap" });

// ── Story ──────────────────────────────────────────────────────────────
const CHAPTERS = [
  {
    num: "I", name: "The Open Set", dir: "ltr" as const,
    story: "Twenty-five points were lifted from the dense substrate of all applicants. Their membership in the finalist set F was, at last, axiomatically confirmed. A well-ordering was applied. None of them asked which.",
  },
  {
    num: "II", name: "The Cauchy Crusade", dir: "rtl" as const,
    story: "Armed with nothing but ε > 0, they marched into the problem sets. For every challenge hurled at them, they produced an N. Some wept. All converged. Absolutely.",
  },
  {
    num: "III", name: "The Continuous Path", dir: "ltr" as const,
    story: "The road ahead was smooth — differentiable at every point, they claimed. The examiners were not convinced. The examiners were not wrong.",
  },
  {
    num: "IV", name: "The Fixed Point Forest", dir: "rtl" as const,
    story: "Banach's theorem guaranteed exactly one way out. A contraction mapping was applied. They found the exit. Whether they understood it remains a separate, ongoing investigation.",
  },
  {
    num: "V", name: "The Limit Point", dir: "ltr" as const,
    story: "Every open neighbourhood of this final destination contains at least one finalist. That finalist, if you are reading this, is you.",
  },
];

// Nodes in path order (1–25). Chapters group them 5 per row.
const NODES = [
  { id:  1, sym: "∃",  label: "You Exist",          chapter: 0 },
  { id:  2, sym: "∈",  label: "Set Membership",     chapter: 0 },
  { id:  3, sym: "⊂",  label: "Proper Subset",      chapter: 0 },
  { id:  4, sym: "∀",  label: "All Obstacles",      chapter: 0 },
  { id:  5, sym: "sup",label: "Supremum Found",     chapter: 0 },

  { id:  6, sym: "a₁", label: "Sequence Begins",    chapter: 1 },
  { id:  7, sym: "ε",  label: "ε > 0 Chosen",       chapter: 1 },
  { id:  8, sym: "δ",  label: "δ Found (Barely)",   chapter: 1 },
  { id:  9, sym: "N",  label: "N(ε) Located",       chapter: 1 },
  { id: 10, sym: "→",  label: "Cauchy Approved",    chapter: 1 },

  { id: 11, sym: "C⁰", label: "Continuous",         chapter: 2 },
  { id: 12, sym: "C¹", label: "Differentiable",     chapter: 2 },
  { id: 13, sym: "C∞", label: "Smooth as π",        chapter: 2 },
  { id: 14, sym: "∫",  label: "Integrable",         chapter: 2 },
  { id: 15, sym: "μ",  label: "Measure Zero Flaws", chapter: 2 },

  { id: 16, sym: "T",  label: "Contraction Found",  chapter: 3 },
  { id: 17, sym: "‖‖", label: "Normed Space",       chapter: 3 },
  { id: 18, sym: "≤",  label: "Lipschitz Bound",    chapter: 3 },
  { id: 19, sym: "T*", label: "Banach's Blessing",  chapter: 3 },
  { id: 20, sym: "x*", label: "Fixed Point ∃!",     chapter: 3 },

  { id: 21, sym: "B",  label: "Open Ball Entered",  chapter: 4 },
  { id: 22, sym: "ω",  label: "Accumulation Pt.",   chapter: 4 },
  { id: 23, sym: "→L", label: "Converging to L",    chapter: 4 },
  { id: 24, sym: "L",  label: "Limit Approached",   chapter: 4 },
  { id: 25, sym: "★",  label: "The Limit Point",    chapter: 4 },
];

const FINALISTS = [
  "Finalist 01","Finalist 02","Finalist 03","Finalist 04","Finalist 05",
  "Finalist 06","Finalist 07","Finalist 08","Finalist 09","Finalist 10",
  "Finalist 11","Finalist 12","Finalist 13","Finalist 14","Finalist 15",
  "Finalist 16","Finalist 17","Finalist 18","Finalist 19","Finalist 20",
  "Finalist 21","Finalist 22","Finalist 23","Finalist 24","Finalist 25",
];

// ── Background motifs ──────────────────────────────────────────────────
const MOTIFS = [
  { s: "∫",      left: "4%",  top: "10%", size: 58, rot: -8, op: 0.06  },
  { s: "∑",      left: "87%", top: "7%",  size: 54, rot:  6, op: 0.06  },
  { s: "∂",      left: "93%", top: "38%", size: 42, rot: 10, op: 0.05  },
  { s: "∞",      left: "6%",  top: "74%", size: 48, rot: -4, op: 0.05  },
  { s: "√",      left: "90%", top: "80%", size: 38, rot:  0, op: 0.045 },
  { s: "∇",      left: "13%", top: "22%", size: 26, rot:  0, op: 0.05  },
  { s: "ℝ",      left: "84%", top: "55%", size: 34, rot:  0, op: 0.045 },
  { s: "xₙ→L",  left: "10%", top: "56%", size: 13, rot: -3, op: 0.06, mono: true },
  { s: "∀ε>0",  left: "74%", top: "20%", size: 13, rot: -2, op: 0.06, mono: true },
];

// ── Monaco entry code ──────────────────────────────────────────────────
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
print(f"∀ε > 0, ∃δ > 0 s.t. you belong here.  □")
`;

function extractApplicant(code: string): string | null {
  const m = code.match(/^applicant\s*=\s*"([^"]*)"/m);
  if (!m) return null;
  const v = m[1].trim();
  if (v === "???" || v === "YOUR_NAME_HERE" || v === "") return null;
  return v;
}

// ── Component ──────────────────────────────────────────────────────────
export default function FinalistsClient() {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [allRevealed, setAllRevealed] = useState(false);
  const [code, setCode] = useState(INITIAL_CODE);
  const [submitted, setSubmitted] = useState(false);
  const [applicant, setApplicant] = useState<string | null>(null);

  const toggle = (id: number) =>
    setFlipped(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const traverseAll = () => {
    NODES.forEach((node, i) => {
      setTimeout(() => setFlipped(prev => new Set([...prev, node.id])), i * 65);
    });
    setTimeout(() => setAllRevealed(true), NODES.length * 65 + 400);
  };

  const handleCode = useCallback((v?: string) => setCode(v ?? ""), []);
  const canSubmit = extractApplicant(code) !== null;
  const allFlipped = flipped.size === NODES.length;

  const handleSubmit = () => {
    const name = extractApplicant(code);
    if (!name) return;
    setApplicant(name);
    setSubmitted(true);
  };

  return (
    <main className={`${script.variable} ${serif.variable} ${mono.variable} ${caps.variable} ${styles.wrap}`}>
      <div className={styles.frame} aria-hidden />

      {MOTIFS.map((m, i) => (
        <span key={i} aria-hidden className={styles.motif} style={{
          left: m.left, top: m.top, fontSize: m.size, opacity: m.op,
          fontFamily: m.mono ? "var(--ff-mono),monospace" : "var(--ff-serif),Georgia,serif",
          ["--r" as string]: `${m.rot}deg`,
          animationDuration: `${7 + (i % 6)}s`,
          animationDelay: `${(i % 8) * 0.55}s`,
        }}>{m.s}</span>
      ))}

      {/* Brand */}
      <header className={styles.brand}>
        <Image className={styles.logo} src="/logo.jpeg" alt="Mathematics Melee" width={36} height={36} />
        <div className={styles.nm}>Mathematics Melee</div>
        <div className={styles.sub}>by Polygon · IIT Guwahati</div>
      </header>

      {/* Page title */}
      <section className={styles.hero}>
        <p className={styles.roundTag}>Round II · The Limit Point</p>
        <h1 className={styles.title}>The Finalists</h1>
        <p className={styles.tagline}>
          Follow the path. Reveal the names.<br />
          <em>Twenty-five points converging to one.</em>
        </p>
        {!allFlipped && (
          <button className={styles.traverseBtn} onClick={traverseAll}>
            Traverse all &nbsp;<span className={styles.traverseMath}>∀n∈F</span>
          </button>
        )}
      </section>

      {/* Zigzag map */}
      <section className={styles.mapSection} aria-label="Finalist path">
        {CHAPTERS.map((ch, ci) => {
          const chNodes = NODES.slice(ci * 5, ci * 5 + 5);
          const isLtr = ch.dir === "ltr";
          const turnSide = isLtr ? styles.turnRight : styles.turnLeft;

          return (
            <div key={ci} className={styles.chapterBlock}>

              {/* Chapter header */}
              <div className={styles.chHead}>
                <div className={styles.chRule} />
                <div className={styles.chMeta}>
                  <span className={styles.chNum}>§ {ch.num}</span>
                  <span className={styles.chName}>{ch.name}</span>
                </div>
                <p className={styles.chStory}>{ch.story}</p>
              </div>

              {/* Node row */}
              <div className={`${styles.row} ${isLtr ? "" : styles.rowRtl}`}>
                {chNodes.map((node, ni) => {
                  const isFlipped = flipped.has(node.id);
                  return (
                    <>
                      <button
                        key={node.id}
                        className={`${styles.node} ${isFlipped ? styles.nodeFlipped : ""} ${node.id === 25 ? styles.nodeStar : ""}`}
                        onClick={() => toggle(node.id)}
                        title={isFlipped ? FINALISTS[node.id - 1] : `Milestone ${node.id}`}
                      >
                        <div className={styles.nodeInner}>
                          <div className={styles.nodeFront}>
                            <span className={styles.nodeSym}>{node.sym}</span>
                            <span className={styles.nodeLabel}>{node.label}</span>
                          </div>
                          <div className={styles.nodeBack}>
                            <span className={styles.nodeName}>{FINALISTS[node.id - 1]}</span>
                            <span className={styles.nodeCheck}>✓</span>
                          </div>
                        </div>
                      </button>
                      {ni < 4 && <div className={styles.hLine} key={`line-${node.id}`} />}
                    </>
                  );
                })}
              </div>

              {/* Turn connector between rows */}
              {ci < 4 && <div className={`${styles.turn} ${turnSide}`} />}
            </div>
          );
        })}
      </section>

      {/* Monaco gate — fades in once all revealed */}
      <section className={`${styles.gate} ${(allFlipped || allRevealed) ? styles.gateVisible : ""}`}>
        <div className={styles.gateDivider}>
          <span className={styles.bar} /><span>Entry Protocol</span><span className={styles.bar} />
        </div>

        {!submitted ? (
          <>
            <p className={styles.gateDesc}>
              If your name appears on the path above — complete the proof below to enter.
            </p>
            <div className={styles.editorWrap}>
              <div className={styles.editorBar}>
                <span className={styles.dot} style={{background:"#ff5f57"}}/>
                <span className={styles.dot} style={{background:"#ffbd2e"}}/>
                <span className={styles.dot} style={{background:"#28c840"}}/>
                <span className={styles.editorTitle}>entry.py</span>
              </div>
              <MonacoEditor
                height="340px"
                defaultLanguage="python"
                value={code}
                onChange={handleCode}
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  fontFamily: "var(--ff-mono),'JetBrains Mono',monospace",
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
              {canSubmit ? "Submit Proof  →" : 'Replace ??? with your name first'}
            </button>
            {!canSubmit && (
              <p className={styles.submitHint}>
                Proof incomplete — <code>applicant = "???"</code> is not a valid identity.
              </p>
            )}
          </>
        ) : (
          <div className={styles.accepted}>
            <div className={styles.qed}>□</div>
            <p className={styles.acceptedLine}>
              Proof accepted, <strong>{applicant}</strong>.
            </p>
            <p className={styles.acceptedSub}>
              ∀ε &gt; 0, every neighbourhood of greatness contains you.
            </p>
            <a className={styles.enterBtn} href="/limit-point-f2137704">
              Enter the Limit Point →
            </a>
            <p className={styles.byInv}>By invitation · The Chosen Few</p>
          </div>
        )}
      </section>

      <footer className={styles.foot}>Mathematics Melee · Round II · Summer 2026</footer>
    </main>
  );
}
