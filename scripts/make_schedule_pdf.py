#!/usr/bin/env python3
"""Generate a polished interview-schedule PDF styled like the Mathematics Melee site."""
import base64
import os
from collections import OrderedDict, defaultdict
from datetime import datetime

import openpyxl
from weasyprint import HTML

XLSX = "/root/.claude/uploads/5c0baa88-c514-4016-a787-06b6b2fa0e9c/62f8d4b9-mathematicsmelee2620260601.xlsx"
LOGO = "/home/user/mathmelee26/public/logo.jpeg"
OUT = "/home/user/mathmelee26/Mathematics-Melee-26-Interview-Schedule.pdf"

# Held panels read from the admin dashboard screenshots: (date, start, interviewer)
HELD = {
    ("June 5, 2026", "10:00", "Priyanshu Debnath"),
    ("June 5, 2026", "11:00", "Deepak Kumar"),
    ("June 5, 2026", "12:00", "Sumedha Bhattacharya"),
    ("June 5, 2026", "12:00", "Shridhar Sharma"),
    ("June 5, 2026", "12:00", "Vineet Diwate"),
    ("June 6, 2026", "11:00", "Deepak Kumar"),
    ("June 6, 2026", "12:00", "Shridhar Sharma"),
    ("June 6, 2026", "12:00", "Ramireddy Ruthvika"),
}

# ─── Load data ────────────────────────────────────────────────────────────────
wb = openpyxl.load_workbook(XLSX)
sched = list(wb["Schedule"].iter_rows(values_only=True))[1:]

# participants keyed by (date, start, end, interviewer)
parts = defaultdict(list)
prows = list(wb["Participants"].iter_rows(values_only=True))
if prows and prows[0] and prows[0][0] != "No participants yet.":
    header = [str(c) for c in prows[0]]
    idx = {h: i for i, h in enumerate(header)}
    for r in prows[1:]:
        if not r or r[0] is None:
            continue
        name = r[idx.get("Name", 1)]
        parts[name] = parts.get(name, [])

panels = []
for r in sched:
    date, day, start, end, interviewer, used, cap = r[0], r[1], r[2], r[3], r[4], r[5], r[6]
    held = (date, start, interviewer) in HELD
    panels.append(dict(date=date, day=day, start=start, end=end,
                       interviewer=interviewer, used=int(used or 0),
                       cap=int(cap or 6), held=held))

# ─── Aggregate ──────────────────────────────────────────────────────────────
dates = OrderedDict()
for p in panels:
    dates.setdefault(p["date"], {"day": p["day"], "blocks": OrderedDict()})
    blk = dates[p["date"]]["blocks"].setdefault((p["start"], p["end"]), [])
    blk.append(p)

interviewers = OrderedDict()
for p in panels:
    interviewers.setdefault(p["interviewer"], []).append(p)
interviewers = OrderedDict(sorted(interviewers.items(), key=lambda kv: kv[0]))

n_panels = len(panels)
n_interviewers = len(interviewers)
n_dates = len(dates)
n_held = sum(1 for p in panels if p["held"])
n_published = n_panels - n_held
total_capacity = sum(p["cap"] for p in panels)
total_booked = sum(p["used"] for p in panels)

logo_b64 = base64.b64encode(open(LOGO, "rb").read()).decode()

# ─── HTML pieces ──────────────────────────────────────────────────────────────
SYMBOLS = ["π", "∑", "∞", "√", "∫", "Δ", "θ", "≥", "⊂", "∂"]
sym_pos = [(6, "6%"), (16, "84%"), (70, "4%"), (78, "90%"), (40, "94%"),
           (10, "70%"), (52, "2%"), (86, "76%"), (24, "46%"), (60, "60%")]
hero_symbols = "".join(
    f'<span class="sym" style="top:{t}%;left:{l};">{s}</span>'
    for s, (t, l) in zip(SYMBOLS, sym_pos)
)


def status_badge(p):
    if p["used"] >= p["cap"]:
        return '<span class="badge badge-full">Full</span>'
    if p["used"] == 0:
        return '<span class="badge badge-empty">Open</span>'
    return '<span class="badge badge-open">Filling</span>'


def panel_card(p):
    held_badge = '<span class="badge badge-held">Held</span>' if p["held"] else ""
    held_cls = " card-held" if p["held"] else ""
    cap_dots = "".join(
        f'<span class="dot {"dot-on" if i < p["used"] else "dot-off"}"></span>'
        for i in range(p["cap"])
    )
    seats = (f'<p class="muted">Awaiting registrations · {p["cap"]} seats</p>'
             if p["used"] == 0 else
             f'<p class="muted">{p["used"]} of {p["cap"]} seats filled</p>')
    return f"""
    <div class="card{held_cls}">
      <div class="card-top">
        <div>
          <p class="card-name">{p['interviewer']}</p>
          <p class="card-time">{p['start']} – {p['end']}</p>
        </div>
        <div class="card-badges">{held_badge}{status_badge(p)}</div>
      </div>
      <div class="card-bottom">
        <div class="dots">{cap_dots}</div>
        {seats}
      </div>
    </div>"""


# Schedule by day
day_sections = ""
for date, info in dates.items():
    blocks_html = ""
    for (start, end), plist in info["blocks"].items():
        cards = "".join(panel_card(p) for p in plist)
        blocks_html += f"""
        <div class="block">
          <div class="block-head"><span class="block-time">{start} – {end}</span>
          <span class="block-count">{len(plist)} parallel panel{'s' if len(plist)>1 else ''}</span></div>
          <div class="grid">{cards}</div>
        </div>"""
    day_sections += f"""
    <section class="day">
      <div class="day-head">
        <h2 class="day-title">{info['day']}</h2>
        <span class="day-date">{date}</span>
      </div>
      {blocks_html}
    </section>"""

# By interviewer
intv_rows = ""
for name, plist in interviewers.items():
    plist_sorted = sorted(plist, key=lambda p: (p["date"], p["start"]))
    chips = "".join(
        f'<span class="chip{" chip-held" if p["held"] else ""}">'
        f'{p["date"].replace(", 2026","")} · {p["start"]}'
        f'{" · Held" if p["held"] else ""}</span>'
        for p in plist_sorted
    )
    intv_rows += f"""
    <tr>
      <td class="intv-name">{name}</td>
      <td class="intv-count">{len(plist_sorted)}</td>
      <td class="intv-chips">{chips}</td>
    </tr>"""

gen_date = datetime.now().strftime("%B %-d, %Y · %H:%M")

html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
@page {{
  size: A4; margin: 18mm 14mm 16mm 14mm;
  @bottom-center {{
    content: "Mathematics Melee '26  ·  Supremum Round  ·  Page " counter(page) " of " counter(pages);
    font-family: Georgia, serif; font-size: 8pt; color: #94a3b8;
  }}
}}
* {{ box-sizing: border-box; }}
body {{ font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
        color: #0f172a; margin: 0; font-size: 10pt; line-height: 1.45; }}
.serif {{ font-family: "Cormorant Garamond", Georgia, "Times New Roman", serif; }}

/* Hero */
.hero {{ position: relative; overflow: hidden; text-align: center;
         padding: 26px 20px 30px; border: 1px solid #e2e8f0; border-radius: 18px;
         background: radial-gradient(ellipse 80% 70% at 50% -10%, rgba(148,163,184,0.14) 0%, #ffffff 70%); }}
.sym {{ position: absolute; font-family: Georgia, serif; color: #334155;
        opacity: 0.10; font-size: 22pt; line-height: 1; }}
.logo {{ width: 58px; height: 58px; border-radius: 14px; object-fit: cover;
         border: 1px solid #e2e8f0; box-shadow: 0 6px 18px rgba(15,23,42,0.12); }}
.title {{ font-family: "Cormorant Garamond", Georgia, serif; font-weight: 300;
          text-transform: uppercase; letter-spacing: 0.14em; font-size: 30pt;
          margin: 14px 0 2px; color: #0f172a; }}
.subtitle {{ font-family: "Cormorant Garamond", Georgia, serif; letter-spacing: 0.22em;
             text-transform: uppercase; font-size: 9pt; color: #94a3b8; margin: 0; }}
.rule {{ display: flex; align-items: center; justify-content: center; gap: 14px; margin: 16px 0 10px; }}
.rule .line {{ height: 1px; width: 54px; background: #e2e8f0; }}
.rule .label {{ font-size: 7.5pt; letter-spacing: 0.2em; text-transform: uppercase; color: #cbd5e1; }}
.docname {{ font-family: "Cormorant Garamond", Georgia, serif; font-size: 17pt; font-weight: 600;
            color: #0f172a; letter-spacing: 0.03em; margin: 2px 0 0; }}

/* Stats */
.stats {{ display: flex; gap: 10px; margin: 16px 0 8px; }}
.stat {{ flex: 1; border: 1px solid #e2e8f0; border-radius: 12px; padding: 11px 12px; background: #fff; }}
.stat .num {{ font-family: "Cormorant Garamond", Georgia, serif; font-size: 20pt; font-weight: 600; color: #0f172a; line-height: 1; }}
.stat .lbl {{ font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8; margin-top: 4px; }}
.stat .accent-emerald {{ color: #059669; }}
.stat .accent-amber {{ color: #d97706; }}

/* Section heading */
.sec-title {{ font-family: "Cormorant Garamond", Georgia, serif; font-size: 15pt; font-weight: 600;
              color: #0f172a; margin: 26px 0 4px; letter-spacing: 0.02em; }}
.sec-sub {{ font-size: 8pt; color: #94a3b8; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.12em; }}

/* Day */
.day {{ margin-bottom: 16px; }}
.day-head {{ display: flex; align-items: baseline; gap: 10px; padding-bottom: 6px;
             border-bottom: 1px solid #f1f5f9; margin-bottom: 12px; }}
.day-title {{ font-family: "Cormorant Garamond", Georgia, serif; font-size: 14pt; font-weight: 600; margin: 0; color: #0f172a; }}
.day-date {{ font-size: 8.5pt; color: #94a3b8; }}
.block {{ margin-bottom: 12px; break-inside: avoid; }}
.block-head {{ display: flex; align-items: baseline; gap: 8px; margin: 0 0 7px 2px; }}
.block-time {{ font-size: 9.5pt; font-weight: 600; color: #334155; }}
.block-count {{ font-size: 7.5pt; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.1em; }}

.grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }}
.card {{ border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 12px; background: #fff; break-inside: avoid; }}
.card-held {{ background: #fffbeb; border-color: #fde68a; }}
.card-top {{ display: flex; justify-content: space-between; align-items: flex-start; gap: 6px; }}
.card-name {{ font-size: 10pt; font-weight: 600; color: #0f172a; margin: 0; }}
.card-time {{ font-size: 8pt; color: #94a3b8; margin: 1px 0 0; }}
.card-badges {{ text-align: right; white-space: nowrap; }}
.card-bottom {{ margin-top: 8px; }}
.dots {{ display: flex; gap: 3px; margin-bottom: 4px; }}
.dot {{ width: 7px; height: 7px; border-radius: 99px; display: inline-block; }}
.dot-on {{ background: #0f172a; }}
.dot-off {{ background: #e2e8f0; }}
.muted {{ font-size: 7.5pt; color: #94a3b8; margin: 0; }}

.badge {{ display: inline-block; font-size: 7pt; font-weight: 600; padding: 1.5px 7px;
          border-radius: 99px; text-transform: uppercase; letter-spacing: 0.06em; margin-left: 4px; }}
.badge-empty {{ background: #f1f5f9; color: #64748b; }}
.badge-open {{ background: #ecfdf5; color: #059669; }}
.badge-full {{ background: #fef2f2; color: #dc2626; }}
.badge-held {{ background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }}

/* Interviewer table */
table {{ width: 100%; border-collapse: collapse; }}
th {{ text-align: left; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.12em;
      color: #94a3b8; padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600; }}
td {{ padding: 9px 8px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }}
.intv-name {{ font-weight: 600; font-size: 9.5pt; color: #0f172a; white-space: nowrap; }}
.intv-count {{ font-size: 9.5pt; color: #64748b; text-align: center; width: 60px; }}
.chip {{ display: inline-block; font-size: 7.5pt; color: #475569; background: #f8fafc;
         border: 1px solid #e2e8f0; border-radius: 99px; padding: 2px 8px; margin: 2px 3px 2px 0; }}
.chip-held {{ background: #fffbeb; border-color: #fde68a; color: #d97706; }}

.legend {{ display: flex; gap: 16px; margin: 10px 0 0; padding-top: 10px; border-top: 1px solid #f1f5f9; }}
.legend span {{ font-size: 8pt; color: #64748b; }}
.foot-note {{ font-size: 7.5pt; color: #94a3b8; margin-top: 14px; text-align: center; }}
</style></head>
<body>
  <div class="hero">
    {hero_symbols}
    <img class="logo" src="data:image/jpeg;base64,{logo_b64}" />
    <h1 class="title">Mathematics Melee</h1>
    <p class="subtitle">by Polygon · IIT Guwahati</p>
    <div class="rule"><span class="line"></span><span class="label">Summer 2026</span><span class="line"></span></div>
    <p class="docname">Supremum Round — Interview Schedule</p>
  </div>

  <div class="stats">
    <div class="stat"><div class="num">{n_panels}</div><div class="lbl">Panels</div></div>
    <div class="stat"><div class="num">{n_interviewers}</div><div class="lbl">Interviewers</div></div>
    <div class="stat"><div class="num">{n_dates}</div><div class="lbl">Days</div></div>
    <div class="stat"><div class="num accent-emerald">{n_published}</div><div class="lbl">Published</div></div>
    <div class="stat"><div class="num accent-amber">{n_held}</div><div class="lbl">Held</div></div>
  </div>
  <div class="legend">
    <span><b style="color:#059669;">●</b> Published — live for participants</span>
    <span><b style="color:#d97706;">●</b> Held — hidden, not bookable yet</span>
    <span>● Filled seats &nbsp; ○ Open seats</span>
  </div>

  <h2 class="sec-title serif">Schedule by Day</h2>
  <p class="sec-sub">Parallel panels run in each time block</p>
  {day_sections}

  <h2 class="sec-title serif" style="break-before: page;">By Interviewer</h2>
  <p class="sec-sub">Each interviewer's assigned panels</p>
  <table>
    <thead><tr><th>Interviewer</th><th style="text-align:center;">Panels</th><th>Sessions</th></tr></thead>
    <tbody>{intv_rows}</tbody>
  </table>

  <p class="foot-note">Generated {gen_date} · {total_booked} / {total_capacity} seats booked across all panels ·
  Held panels are hidden from participants until published.</p>
</body></html>"""

HTML(string=html).write_pdf(OUT)
print("Wrote", OUT, os.path.getsize(OUT), "bytes")
print(f"Panels={n_panels} Held={n_held} Published={n_published} Interviewers={n_interviewers}")
