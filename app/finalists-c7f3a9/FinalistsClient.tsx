"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import localFont from "next/font/local";
import styles from "./finalists.module.css";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const script  = localFont({ src: "../limit-point-f2137704/fonts/Pestapora.otf",   variable: "--ff-script",  display: "swap" });
const serif   = localFont({ src: [
  { path: "../limit-point-f2137704/fonts/CMUSerif-Roman.ttf", weight: "400", style: "normal" },
  { path: "../limit-point-f2137704/fonts/CMUSerif-Bold.ttf",  weight: "700", style: "normal" },
], variable: "--ff-serif", display: "swap" });
const sans    = localFont({ src: [
  { path: "../limit-point-f2137704/fonts/CMUSans-Regular.woff2", weight: "500", style: "normal" },
  { path: "../limit-point-f2137704/fonts/CMUSans-Bold.woff2",    weight: "700", style: "normal" },
  { path: "../limit-point-f2137704/fonts/CMUSans-Italic.woff2",  weight: "500", style: "italic" },
], variable: "--ff-sans", display: "swap" });
const mono    = localFont({ src: "../limit-point-f2137704/fonts/JetBrainsMono.ttf", variable: "--ff-mono",   display: "swap" });
const caps    = localFont({ src: "../limit-point-f2137704/fonts/Montserrat.ttf",    variable: "--ff-caps",   display: "swap" });

// ── Data ───────────────────────────────────────────────────────────────

const CHAPTERS = [
  {
    num: "I",   name: "The Open Set",
    dir: "ltr" as const, pathSide: "left" as null | "left" | "right",
    story: "Twenty-five points were lifted from the dense substrate of all applicants. Their membership in set F was axiomatically confirmed. A well-ordering was applied. None of them asked which.",
  },
  {
    num: "II",  name: "The Cauchy Crusade",
    dir: "rtl" as const, pathSide: "right" as null | "left" | "right",
    story: "Armed with nothing but ε > 0, they marched into the problem sets. For every challenge hurled at them, they produced an N. Some wept. All converged. Absolutely.",
  },
  {
    num: "III", name: "The Continuous Path",
    dir: "ltr" as const, pathSide: "left" as null | "left" | "right",
    story: "The road ahead was smooth — differentiable at every point, they claimed. The examiners were not convinced. The examiners were not wrong.",
  },
  {
    num: "IV",  name: "The Fixed Point Forest",
    dir: "rtl" as const, pathSide: "right" as null | "left" | "right",
    story: "Banach's theorem guaranteed exactly one way out. A contraction mapping was applied. They found the exit. Whether they understood it remains a separate, ongoing investigation.",
  },
  {
    num: "V",   name: "The Limit Point",
    dir: "ltr" as const, pathSide: "left" as null | "left" | "right",
    story: "Every open neighbourhood of this final destination contains at least one finalist. That finalist, if you are reading this, is you.",
  },
];

const NODES = [
  { id:  1, sym: "∃",   label: "You Exist",          chapter: 0 },
  { id:  2, sym: "∈",   label: "Set Membership",     chapter: 0 },
  { id:  3, sym: "⊂",   label: "Proper Subset",      chapter: 0 },
  { id:  4, sym: "∀",   label: "All Obstacles",      chapter: 0 },
  { id:  5, sym: "sup", label: "Supremum Found",     chapter: 0 },
  { id:  6, sym: "a₁",  label: "Sequence Begins",    chapter: 1 },
  { id:  7, sym: "ε",   label: "ε > 0 Chosen",       chapter: 1 },
  { id:  8, sym: "δ",   label: "δ Found (Barely)",   chapter: 1 },
  { id:  9, sym: "N",   label: "N(ε) Located",       chapter: 1 },
  { id: 10, sym: "→",   label: "Cauchy Approved",    chapter: 1 },
  { id: 11, sym: "C⁰",  label: "Continuous",         chapter: 2 },
  { id: 12, sym: "C¹",  label: "Differentiable",     chapter: 2 },
  { id: 13, sym: "C∞",  label: "Smooth as π",        chapter: 2 },
  { id: 14, sym: "∫",   label: "Integrable",         chapter: 2 },
  { id: 15, sym: "μ",   label: "Measure Zero Flaws", chapter: 2 },
  { id: 16, sym: "T",   label: "Contraction Found",  chapter: 3 },
  { id: 17, sym: "‖‖",  label: "Normed Space",       chapter: 3 },
  { id: 18, sym: "≤",   label: "Lipschitz Bound",    chapter: 3 },
  { id: 19, sym: "T*",  label: "Banach's Blessing",  chapter: 3 },
  { id: 20, sym: "x*",  label: "Fixed Point ∃!",     chapter: 3 },
  { id: 21, sym: "B",   label: "Open Ball Entered",  chapter: 4 },
  { id: 22, sym: "ω",   label: "Accumulation Pt.",   chapter: 4 },
  { id: 23, sym: "→L",  label: "Converging to L",    chapter: 4 },
  { id: 24, sym: "L",   label: "Limit Approached",   chapter: 4 },
  { id: 25, sym: "★",   label: "The Limit Point",    chapter: 4 },
];

const FINALISTS: { name: string; college: string }[] = [
  { name: "Aditi Singh",                  college: "IIT Delhi" },
  { name: "Lakshya Goswami",              college: "IIT Ropar" },
  { name: "Atin Gupta",                   college: "IIT Guwahati" },
  { name: "Sonu Yadav",                   college: "IIT Guwahati" },
  { name: "Vaibhav Agarwal",              college: "IIT Kharagpur" },
  { name: "Neev Mittal",                  college: "IIT Delhi" },
  { name: "Aabhas Gupta",                 college: "IIT Delhi" },
  { name: "Sashwath JS",                  college: "IIT Madras" },
  { name: "Khushhal Bansal",              college: "IIT Guwahati" },
  { name: "Ananya Prabhav",               college: "IIT (BHU) Varanasi" },
  { name: "Rajarshi Nandi",               college: "NIT Durgapur" },
  { name: "Amogh Jalan",                  college: "IIT Delhi" },
  { name: "Abishnavi T",                  college: "IIT Madras" },
  { name: "Ameya Tripathi",               college: "IIT Bombay" },
  { name: "Surya Ramanathan M",           college: "IIT Madras" },
  { name: "Kashav Kumar",                 college: "IIT Delhi" },
  { name: "Yashaswi Jain",                college: "IIT Delhi" },
  { name: "Nishant",                      college: "IIT Kanpur" },
  { name: "Shaurya Johari",               college: "IIT Kanpur" },
  { name: "Guddanti Chetan Naga Anirudh", college: "IIT Bombay" },
  { name: "Majid Husain",                 college: "IIT Bombay" },
  { name: "Praneet Singh Bhatia",         college: "IIT Bombay" },
  { name: "Anagh Atri",                   college: "IIT Kanpur" },
  { name: "Yash Bhardwaj",                college: "IIT Kanpur" },
  { name: "Yash Neeraj Sharma",           college: "IIT Bombay" },
];

const MOTIFS = [
  { s: "∫",     left: "4%",  top: "9%",  size: 56, rot: -8, op: 0.055 },
  { s: "∑",     left: "87%", top: "6%",  size: 52, rot:  6, op: 0.055 },
  { s: "∂",     left: "93%", top: "40%", size: 40, rot: 10, op: 0.048 },
  { s: "∞",     left: "5%",  top: "73%", size: 46, rot: -4, op: 0.048 },
  { s: "√",     left: "90%", top: "79%", size: 36, rot:  0, op: 0.042 },
  { s: "∇",     left: "13%", top: "21%", size: 24, rot:  0, op: 0.048 },
  { s: "ℝ",     left: "84%", top: "54%", size: 32, rot:  0, op: 0.042 },
  { s: "xₙ→L", left: "9%",  top: "57%", size: 13, rot: -3, op: 0.055, mono: true },
  { s: "∀ε>0", left: "74%", top: "19%", size: 13, rot: -2, op: 0.055, mono: true },
];

const INITIAL_CODE = `# Set this to True to enter. It's not that deep.

best_math_competition_u_gave_is_Mathematics_Melee_2026 = False

# Still False? Bro typed False at a math competition. Incredible. Change it to True.`;

function extractApplicant(code: string): string | null {
  const m = code.match(/best_math_competition_u_gave_is_Mathematics_Melee_2026\s*=\s*(True|False)/m);
  if (!m) return null;
  return m[1] === "True" ? "verified" : null;
}

// Catmull-Rom spline through all pts → SVG cubic bezier path
function catmullRomPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  const ext = [pts[0], ...pts, pts[pts.length - 1]];
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = ext[i], p1 = ext[i + 1], p2 = ext[i + 2], p3 = ext[i + 3];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)},${cp2x.toFixed(1)} ${cp2y.toFixed(1)},${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

// ── Component ──────────────────────────────────────────────────────────
export default function FinalistsClient() {
  const [activeNode, setActiveNode]  = useState<number | null>(null);
  const [allRevealed, setAllRev]    = useState(false);
  const traverseRef                  = useRef<ReturnType<typeof setInterval> | null>(null);
  const [code, setCode]             = useState(INITIAL_CODE);
  const [submitted, setSubmitted]   = useState(false);
  const [applicant, setApplicant]   = useState<string | null>(null);
  const [pathD, setPathD]           = useState("");
  const [svgDims, setSvgDims]       = useState({ w: 0, h: 0 });

  const mapRef   = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>(Array(25).fill(null));

  const recompute = useCallback(() => {
    if (!mapRef.current) return;
    const box = mapRef.current.getBoundingClientRect();
    const pts = nodeRefs.current
      .map(ref => {
        if (!ref) return null;
        const r = ref.getBoundingClientRect();
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
      })
      .filter((p): p is { x: number; y: number } => p !== null);
    if (pts.length !== 25) return;
    setSvgDims({ w: box.width, h: box.height });
    setPathD(catmullRomPath(pts));
  }, []);

  useEffect(() => {
    recompute();
    const obs = new ResizeObserver(recompute);
    if (mapRef.current) obs.observe(mapRef.current);
    return () => obs.disconnect();
  }, [recompute]);

  const toggle = (id: number) =>
    setActiveNode(prev => prev === id ? null : id);

  const traverseAll = () => {
    if (traverseRef.current) clearInterval(traverseRef.current);
    let i = 0;
    setActiveNode(NODES[0].id);
    traverseRef.current = setInterval(() => {
      i++;
      if (i < NODES.length) {
        setActiveNode(NODES[i].id);
      } else {
        clearInterval(traverseRef.current!);
        traverseRef.current = null;
        setTimeout(() => { setActiveNode(null); setAllRev(true); }, 1000);
      }
    }, 900);
  };

  const handleCode = useCallback((v?: string) => setCode(v ?? ""), []);
  const canSubmit  = extractApplicant(code) !== null;

  const handleSubmit = () => {
    const name = extractApplicant(code);
    if (!name) return;
    setApplicant(name);
    setSubmitted(true);
  };

  return (
    <main className={`${script.variable} ${serif.variable} ${sans.variable} ${mono.variable} ${caps.variable} ${styles.wrap}`}>
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

      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.title}>The Finalists</h1>
        <p className={styles.tagline}>Round III · Follow the path. Reveal the names.</p>
        {!allRevealed && (
          <button className={styles.traverseBtn} onClick={traverseAll}>
            Traverse all &nbsp;<span className={styles.traverseMath}>∀n ∈ F</span>
          </button>
        )}
      </section>

      {/* ── Zigzag map ── */}
      <section className={styles.mapWrap} aria-label="Finalist path">
        <div className={styles.mapInner} ref={mapRef}>

          {/* SVG road path — rendered once positions are measured */}
          {pathD && (
            <svg
              className={styles.roadSvg}
              width={svgDims.w}
              height={svgDims.h}
              aria-hidden
            >
              {/* Road border */}
              <path d={pathD} stroke="#cac5ba" strokeWidth="18" fill="none"
                strokeLinecap="round" strokeLinejoin="round" />
              {/* Road surface */}
              <path d={pathD} stroke="#e2ddd6" strokeWidth="13" fill="none"
                strokeLinecap="round" strokeLinejoin="round" />
              {/* Centre dashes */}
              <path d={pathD} stroke="#b8b3a8" strokeWidth="1.5" fill="none"
                strokeDasharray="11 9" strokeLinecap="round" />
            </svg>
          )}

          {/* Chapters & nodes */}
          {CHAPTERS.map((ch, ci) => {
            const chNodes = NODES.slice(ci * 5, ci * 5 + 5);
            const textCls = ch.pathSide === "right" ? styles.chTextOffRight
                          : ch.pathSide === "left"  ? styles.chTextOffLeft
                          : "";
            return (
              <div key={ci} className={styles.chBlock}>

                {/* Chapter label — shifts away from the incoming road curve */}
                <div className={`${styles.chText} ${textCls}`}>
                  <div className={styles.chHead}>
                    <span className={styles.chNum}>§ {ch.num}</span>
                    <span className={styles.chName}>{ch.name}</span>
                  </div>
                  <p className={styles.chStory}>{ch.story}</p>
                </div>

                {/* Node row */}
                <div className={`${styles.row} ${ch.dir === "rtl" ? styles.rowRtl : ""}`}>
                  {chNodes.map(node => {
                    const isActive  = activeNode === node.id;
                    const isStar    = node.id === 25;
                    const finalist  = FINALISTS[node.id - 1];
                    return (
                      <button
                        key={node.id}
                        ref={el => { nodeRefs.current[node.id - 1] = el; }}
                        className={`${styles.node} ${isActive ? styles.nodeActive : ""} ${isStar ? styles.nodeStar : ""}`}
                        onClick={() => toggle(node.id)}
                      >
                        <span className={styles.nodeSym}>{node.sym}</span>
                        {isActive && (
                          <div className={styles.popup}>
                            <span className={styles.popupName}>{finalist.name}</span>
                            <span className={styles.popupCollege}>{finalist.college}</span>
                            <span className={styles.popupArrow} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Monaco gate */}
      <section className={`${styles.gate} ${allRevealed ? styles.gateVisible : ""}`}>
        <div className={styles.gateDivider}>
          <span className={styles.bar} /><span>Entry Protocol</span><span className={styles.bar} />
        </div>

        {!submitted ? (
          <>
            <p className={styles.gateDesc}>
              If your name appears on the path — set the variable to <code>True</code> to enter.
            </p>
            <div className={styles.editorWrap}>
              <div className={styles.editorBar}>
                <span className={styles.dot} style={{ background: "#ff5f57" }} />
                <span className={styles.dot} style={{ background: "#ffbd2e" }} />
                <span className={styles.dot} style={{ background: "#28c840" }} />
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
              {canSubmit ? "Submit Proof  →" : "Replace ??? with your name first"}
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
            <p className={styles.acceptedLine}>That&apos;s the spirit.</p>
            <p className={styles.acceptedSub}>∀ε &gt; 0, every neighbourhood of greatness contains you.</p>
            <a className={styles.enterBtn} href="/limit-point-f2137704">Enter the Limit Point →</a>
            <p className={styles.byInv}>By invitation · The Chosen Few</p>
          </div>
        )}
      </section>

      <footer className={styles.foot}>Mathematics Melee · Round III · Summer 2026</footer>
    </main>
  );
}
