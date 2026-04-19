"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

// ═══════════════════════════════════════════════════════════════════════
// VALORA PIPELINE v7 — Drop-in single-file page, defensive theme sync
//
// Contains the full Valora design system INLINE:
//   • tokens.css (dark + light themes via data-theme)
//   • components.css (val-* classes)
//   • Pipeline-specific CSS (kb-board, kb-card, side-panel, etc.)
//   • Google Fonts @import for Poppins + JetBrains Mono
//
// Drop this at app/pipeline/page.tsx — no layout.tsx edits needed.
// When other pages adopt the val- system, you can refactor by extracting
// VALORA_CSS into app/globals.css (or tokens.css + components.css in
// /styles) and importing once in layout.tsx.
//
// All Supabase queries, drag/drop, side-panel, tasks/notes/activity
// logic preserved verbatim from the production pipeline page.
// ═══════════════════════════════════════════════════════════════════════

const VALORA_CSS = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

.kb-board {
      display: grid;
      grid-template-columns: repeat(5, minmax(280px, 1fr));
      gap: var(--val-s-4);
      align-items: flex-start;
    }
    .kb-col {
      display: flex;
      flex-direction: column;
      gap: var(--val-s-3);
    }
    .kb-col__head {
      display: flex;
      align-items: center;
      gap: var(--val-s-2);
      padding: 0 var(--val-s-2) var(--val-s-1);
    }
    .kb-col__dot { width: 8px; height: 8px; border-radius: 50%; }
    .kb-col__dot--prospect { background: var(--val-text-dim); }
    .kb-col__dot--feasibility { background: var(--val-amber); }
    .kb-col__dot--under-offer { background: var(--val-blue); }
    .kb-col__dot--dev { background: var(--val-green); }
    .kb-col__dot--done { background: var(--val-green); }
    .kb-col__label {
      font-size: 10px;
      font-weight: var(--val-w-semibold);
      letter-spacing: var(--val-track-widest);
      text-transform: uppercase;
      color: var(--val-text);
    }
    .kb-col__count {
      font-size: var(--val-size-11);
      color: var(--val-text-dim);
      background: var(--val-bg-panel-2);
      padding: 1px 8px;
      border-radius: var(--val-r-pill);
      font-weight: var(--val-w-semibold);
    }
    .kb-col__total {
      font-size: var(--val-size-11);
      color: var(--val-text-dim);
      padding: 0 var(--val-s-2);
      font-variant-numeric: tabular-nums;
    }
    .kb-drop {
      padding: var(--val-s-5) var(--val-s-3);
      border: 1px dashed var(--val-border);
      border-radius: var(--val-r-md);
      text-align: center;
      font-size: var(--val-size-12);
      color: var(--val-text-dim);
    }
    .kb-card {
      background: var(--val-bg-panel);
      border: 1px solid var(--val-border);
      border-radius: var(--val-r-lg);
      padding: var(--val-s-4);
      display: flex;
      flex-direction: column;
      gap: var(--val-s-3);
      cursor: grab;
      transition: border-color var(--val-dur-fast) var(--val-ease-out);
    }
    .kb-card:hover { border-color: var(--val-border-lt); }
    .kb-card__title {
      font-size: var(--val-size-14);
      font-weight: var(--val-w-bold);
      color: var(--val-text);
      letter-spacing: var(--val-track-snug);
      line-height: 1.3;
      margin: 0;
    }
    .kb-card__loc {
      font-size: var(--val-size-11);
      color: var(--val-text-dim);
      font-weight: var(--val-w-medium);
      margin-top: 2px;
    }
    .kb-card__row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: var(--val-size-13);
      font-weight: var(--val-w-bold);
      font-variant-numeric: tabular-nums;
    }
    .kb-card__actions {
      display: flex;
      gap: var(--val-s-1);
      margin-top: 2px;
    }
    .kb-card__btn {
      flex: 1;
      font-size: var(--val-size-11);
      padding: 5px 8px;
      background: var(--val-bg-panel-2);
      border: 1px solid var(--val-border);
      border-radius: var(--val-r-sm);
      color: var(--val-text-mid);
      cursor: pointer;
      font-family: inherit;
      font-weight: var(--val-w-medium);
    }
    .kb-card__btn:hover { color: var(--val-green); border-color: var(--val-green); }
    .kb-select {
      background: var(--val-bg-panel-2);
      border: 1px solid var(--val-border);
      border-radius: var(--val-r-sm);
      padding: 4px 8px;
      font-size: var(--val-size-11);
      color: var(--val-text-mid);
      font-family: inherit;
    }
    .pipeline-topnav {
      display: flex;
      gap: var(--val-s-3);
      padding: var(--val-s-3) var(--val-s-6);
      border-bottom: 1px solid var(--val-border);
      background: var(--val-bg-panel);
    }
    .pipeline-topnav__item {
      padding: 6px 14px;
      border-radius: var(--val-r-md);
      font-size: var(--val-size-12);
      color: var(--val-text-dim);
      border: 1px solid var(--val-border);
      background: transparent;
      font-weight: var(--val-w-medium);
      cursor: pointer;
      font-family: inherit;
    }
    .pipeline-topnav__item--active { color: var(--val-green); border-color: var(--val-green); }

/* ──────────────────────────────────────────────────────────────
   VALORA — DESIGN TOKENS v1
   Foundation layer: colours, typography, spacing, radii, motion.
   Import first in your global stylesheet, then import components.css
   ────────────────────────────────────────────────────────────── */

/* Default theme = dark. Set data-theme="light" on <html> to switch. */
:root,
:root[data-theme="dark"] {
  /* ─── COLOUR — SURFACES (dark) ─── */
  --val-bg-app:          #0F1115;    /* page bg — deep navy */
  --val-bg-panel:        #1A1E26;    /* card / sidebar bg */
  --val-bg-panel-2:      #242933;    /* elevated / input bg */
  --val-bg-panel-3:      #2D3340;    /* input filled / hover */
  --val-bg-overlay:      rgba(15,17,21,0.72);   /* modal backdrop */

  /* ─── COLOUR — TEXT (dark) ─── */
  --val-text:            #F6F4EF;    /* primary cream text */
  --val-text-mid:        #C8CCD4;    /* secondary labels */
  --val-text-dim:        #949CA0;    /* tertiary / captions */
  --val-text-faint:      #6B7280;    /* placeholders, disabled */

  /* ─── COLOUR — BRAND / ACCENTS (dark) ─── */
  --val-gold:            #C9A84C;    /* headline values, active tab, brand */
  --val-green:           #52C498;    /* positive / valora primary / CTAs */
  --val-green-tint:      rgba(82,196,152,0.12);
  --val-green-deep:      #2E7D58;    /* pressed state */
  --val-amber:           #F0A429;    /* caution / marginal metrics */
  --val-amber-tint:      rgba(240,164,41,0.12);
  --val-red:             #F4645F;    /* alert / negative */
  --val-red-tint:        rgba(244,100,95,0.12);
  --val-blue:            #5CA5DC;    /* informational / neutral highlight */
  --val-blue-tint:       rgba(92,165,220,0.12);

  /* ─── COLOUR — BORDERS (dark) ─── */
  --val-border:          #383E4A;    /* default card/panel border */
  --val-border-lt:       #4A505C;    /* elevated / input border */
  --val-border-accent:   rgba(82,196,152,0.35);   /* active input outline */

  /* ─── TYPOGRAPHY — FAMILIES ─── */
  --val-font-body:       'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --val-font-mono:       'JetBrains Mono', 'SF Mono', 'Consolas', monospace;

  /* ─── TYPOGRAPHY — SIZE SCALE ─── */
  --val-size-10:  10px;
  --val-size-11:  11px;
  --val-size-12:  12px;
  --val-size-13:  13px;
  --val-size-14:  14px;
  --val-size-15:  15px;
  --val-size-16:  16px;
  --val-size-17:  17px;
  --val-size-20:  20px;
  --val-size-22:  22px;
  --val-size-26:  26px;
  --val-size-32:  32px;
  --val-size-40:  40px;
  --val-size-48:  48px;
  --val-size-64:  64px;

  /* ─── TYPOGRAPHY — WEIGHT ─── */
  --val-w-regular:  400;
  --val-w-medium:   500;
  --val-w-semibold: 600;
  --val-w-bold:     700;

  /* ─── TYPOGRAPHY — LINE HEIGHT ─── */
  --val-lh-tight:   1.1;
  --val-lh-snug:    1.25;
  --val-lh-normal:  1.45;
  --val-lh-loose:   1.6;

  /* ─── TYPOGRAPHY — LETTER SPACING ─── */
  --val-track-tight:   -0.03em;
  --val-track-snug:    -0.015em;
  --val-track-normal:  0;
  --val-track-wide:    0.04em;
  --val-track-wider:   0.08em;
  --val-track-widest:  0.14em;  /* caps labels */

  /* ─── SPACING SCALE (in px, 4px grid) ─── */
  --val-s-0:    0;
  --val-s-1:    4px;
  --val-s-2:    8px;
  --val-s-3:    12px;
  --val-s-4:    16px;
  --val-s-5:    20px;
  --val-s-6:    24px;
  --val-s-7:    28px;
  --val-s-8:    32px;
  --val-s-10:   40px;
  --val-s-12:   48px;
  --val-s-14:   56px;
  --val-s-16:   64px;
  --val-s-20:   80px;

  /* ─── RADII ─── */
  --val-r-xs:     4px;   /* chip, small pill */
  --val-r-sm:     6px;   /* button */
  --val-r-md:     8px;   /* input */
  --val-r-lg:     10px;  /* card */
  --val-r-xl:     12px;  /* feature card, message bubble */
  --val-r-pill:   999px; /* status chip, primary pill */

  /* ─── SHADOWS (subtle — dark UI relies on borders more than shadows) ─── */
  --val-shadow-sm:  0 1px 2px rgba(0,0,0,0.12);
  --val-shadow-md:  0 4px 12px rgba(0,0,0,0.20);
  --val-shadow-lg:  0 20px 60px rgba(0,0,0,0.45);
  --val-shadow-inset:  inset 0 1px 0 rgba(255,255,255,0.02);

  /* ─── FOCUS RING (accessibility) ─── */
  --val-ring:       0 0 0 2px var(--val-bg-app), 0 0 0 4px var(--val-green);

  /* ─── MOTION ─── */
  --val-ease-out:        cubic-bezier(0.16, 1, 0.3, 1);
  --val-ease-out-back:   cubic-bezier(0.175, 0.885, 0.32, 1.275);
  --val-ease-in-out:     cubic-bezier(0.65, 0, 0.35, 1);
  --val-dur-fast:        120ms;
  --val-dur-base:        200ms;
  --val-dur-slow:        320ms;

  /* ─── LAYOUT TOKENS ─── */
  --val-nav-h:          56px;
  --val-tabbar-h:       44px;
  --val-copilot-w:      560px;      /* right-side Copilot panel width */
  --val-content-max:    1400px;     /* max content width on ultra-wide */
}

/* ══════════════════════════════════════════════════════════════
   LIGHT THEME — activated by <html data-theme="light">
   Cream surface, navy ink, same brand accents (adjusted for legibility)
   ══════════════════════════════════════════════════════════════ */

:root[data-theme="light"] {
  /* Surfaces */
  --val-bg-app:          #F8F5EE;    /* cream (matches landing page) */
  --val-bg-panel:        #FFFFFF;
  --val-bg-panel-2:      #F2EEE4;    /* input / elevated */
  --val-bg-panel-3:      #EAE5D8;    /* hover / pressed */
  --val-bg-overlay:      rgba(15,17,21,0.5);

  /* Text */
  --val-text:            #0F1115;    /* navy */
  --val-text-mid:        #3D4351;
  --val-text-dim:        #6B7280;
  --val-text-faint:      #A0A5AE;

  /* Brand (slightly deeper for contrast on cream) */
  --val-gold:            #A8843A;
  --val-green:           #2E9E72;
  --val-green-tint:      rgba(46,158,114,0.10);
  --val-green-deep:      #1F7050;
  --val-amber:           #C57E14;
  --val-amber-tint:      rgba(197,126,20,0.10);
  --val-red:             #C24844;
  --val-red-tint:        rgba(194,72,68,0.10);
  --val-blue:            #2D7AB5;
  --val-blue-tint:       rgba(45,122,181,0.10);

  /* Borders */
  --val-border:          rgba(15,17,21,0.10);
  --val-border-lt:       rgba(15,17,21,0.18);
  --val-border-accent:   rgba(46,158,114,0.35);

  /* Shadows (more pronounced on light bg) */
  --val-shadow-sm:       0 1px 2px rgba(15,17,21,0.06);
  --val-shadow-md:       0 4px 12px rgba(15,17,21,0.08);
  --val-shadow-lg:       0 20px 60px rgba(15,17,21,0.15);
  --val-shadow-inset:    inset 0 0 0 1px rgba(15,17,21,0.02);
}

/* Respect system preference as initial state (optional — remove if manual-only) */
@media (prefers-color-scheme: light) {
  :root:not([data-theme]) {
    /* If no explicit theme chosen, use light when OS prefers it.
       Remove this @media block if you want to default to dark always. */
  }
}

/* ─── RESET / BASE ─── */
*, *::before, *::after { box-sizing: border-box; }
html, body {
  margin: 0;
  padding: 0;
  background: var(--val-bg-app);
  color: var(--val-text);
  font-family: var(--val-font-body);
  font-size: var(--val-size-14);
  line-height: var(--val-lh-normal);
  font-weight: var(--val-w-regular);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
body { min-height: 100vh; }
a { color: var(--val-green); text-decoration: none; }
a:hover { text-decoration: underline; }
button { font-family: inherit; }

/* ─── SCROLLBARS (subtle) ─── */
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: var(--val-border-lt);
  border-radius: var(--val-r-pill);
  border: 2px solid var(--val-bg-app);
}
::-webkit-scrollbar-thumb:hover { background: var(--val-text-dim); }

/* ─── SELECTION ─── */
::selection { background: var(--val-green-tint); color: var(--val-text); }


/* ──────────────────────────────────────────────────────────────
   VALORA — COMPONENTS v1
   Depends on tokens.css. Every class prefixed \`val-\` to avoid
   collisions when you drop into an existing codebase.
   ────────────────────────────────────────────────────────────── */

/* ══════════════════════════════ LAYOUT ══════════════════════════════ */

.val-app {
  min-height: 100vh;
  display: flex;
  background: var(--val-bg-app);
}

.val-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}

.val-content {
  flex: 1;
  min-width: 0;
  padding: var(--val-s-8) var(--val-s-10);
  overflow-y: auto;
}

.val-content--narrow { max-width: 1100px; margin: 0 auto; width: 100%; }

/* ══════════════════════════════ SIDEBAR ══════════════════════════════ */

.val-sidebar {
  width: 232px;
  flex-shrink: 0;
  background: var(--val-bg-panel);
  border-right: 1px solid var(--val-border);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: sticky;
  top: 0;
  z-index: 20;
}

.val-sidebar__brand {
  padding: var(--val-s-5) var(--val-s-5) var(--val-s-4);
}
.val-sidebar__brand-name {
  font-size: var(--val-size-22);
  font-weight: var(--val-w-bold);
  color: var(--val-text);
  letter-spacing: var(--val-track-snug);
  line-height: 1;
}
.val-sidebar__brand-sub {
  font-size: 10px;
  font-weight: var(--val-w-medium);
  letter-spacing: var(--val-track-widest);
  text-transform: uppercase;
  color: var(--val-text-dim);
  margin-top: 4px;
}

.val-sidebar__section-title {
  font-size: 10px;
  font-weight: var(--val-w-semibold);
  letter-spacing: var(--val-track-widest);
  text-transform: uppercase;
  color: var(--val-text-dim);
  padding: var(--val-s-4) var(--val-s-5) var(--val-s-2);
}

.val-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 var(--val-s-3);
}

.val-nav-item {
  display: flex;
  align-items: center;
  gap: var(--val-s-3);
  padding: var(--val-s-2) var(--val-s-3);
  border-radius: var(--val-r-md);
  font-size: var(--val-size-14);
  font-weight: var(--val-w-medium);
  color: var(--val-text-mid);
  cursor: pointer;
  text-decoration: none;
  transition: all var(--val-dur-fast) var(--val-ease-out);
  border: none;
  background: transparent;
  text-align: left;
  position: relative;
}
.val-nav-item:hover {
  background: rgba(255,255,255,0.04);
  color: var(--val-text);
}
.val-nav-item--active {
  background: var(--val-green-tint);
  color: var(--val-green);
}
.val-nav-item--active:hover {
  background: var(--val-green-tint);
  color: var(--val-green);
}
.val-nav-item__icon {
  width: 16px; height: 16px;
  flex-shrink: 0;
  opacity: 0.85;
}
.val-nav-item__badge {
  margin-left: auto;
  font-size: 10px;
  font-weight: var(--val-w-bold);
  background: var(--val-red);
  color: white;
  padding: 2px 6px;
  border-radius: var(--val-r-pill);
  min-width: 18px;
  text-align: center;
}

.val-sidebar__footer {
  margin-top: auto;
  padding: var(--val-s-4) var(--val-s-5);
  border-top: 1px solid var(--val-border);
  display: flex;
  flex-direction: column;
  gap: var(--val-s-3);
}
.val-sidebar__footer-email {
  font-size: var(--val-size-11);
  color: var(--val-text-dim);
  font-weight: var(--val-w-medium);
  word-break: break-all;
}
.val-sidebar__footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* light theme → sidebar bg stays white */
:root[data-theme="light"] .val-sidebar {
  background: var(--val-bg-panel);
}

/* ══════════════════════════════ THEME TOGGLE ══════════════════════════════ */

.val-theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--val-s-2);
  padding: 4px 10px;
  background: transparent;
  border: 1px solid var(--val-border);
  border-radius: var(--val-r-pill);
  color: var(--val-text-dim);
  font-size: var(--val-size-11);
  font-weight: var(--val-w-medium);
  cursor: pointer;
  font-family: inherit;
  transition: all var(--val-dur-fast) var(--val-ease-out);
}
.val-theme-toggle:hover {
  color: var(--val-text);
  border-color: var(--val-border-lt);
}

/* ══════════════════════════════ PAGE HEADER ══════════════════════════════ */

.val-page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--val-s-5);
  margin-bottom: var(--val-s-8);
}
.val-page-header__title {
  font-size: 34px;
  font-weight: var(--val-w-bold);
  color: var(--val-text);
  letter-spacing: var(--val-track-tight);
  margin: 0;
  line-height: 1;
}
.val-page-header__sub {
  font-size: var(--val-size-14);
  color: var(--val-text-dim);
  font-weight: var(--val-w-medium);
  margin-top: var(--val-s-2);
}
.val-page-header__actions {
  display: flex;
  align-items: center;
  gap: var(--val-s-2);
  flex-shrink: 0;
}

/* ══════════════════════════════ STAT STRIP ══════════════════════════════ */

.val-stat-strip {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--val-s-1);
  margin-bottom: var(--val-s-6);
  background: var(--val-bg-panel);
  border: 1px solid var(--val-border);
  border-radius: var(--val-r-lg);
  overflow: hidden;
}
.val-stat {
  padding: var(--val-s-4) var(--val-s-5);
  border-right: 1px solid var(--val-border);
}
.val-stat:last-child { border-right: none; }
.val-stat__label {
  font-size: 10px;
  font-weight: var(--val-w-semibold);
  letter-spacing: var(--val-track-widest);
  text-transform: uppercase;
  color: var(--val-text-dim);
}
.val-stat__value {
  font-size: 22px;
  font-weight: var(--val-w-bold);
  color: var(--val-text);
  margin-top: 4px;
  letter-spacing: var(--val-track-snug);
  font-variant-numeric: tabular-nums;
}

/* ══════════════════════════════ TYPE PILLS ══════════════════════════════ */

.val-type-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: var(--val-r-xs);
  font-size: var(--val-size-11);
  font-weight: var(--val-w-semibold);
  letter-spacing: var(--val-track-snug);
}
.val-type-pill--btr       { background: rgba(82,196,152,0.15);  color: var(--val-green); }
.val-type-pill--bts       { background: rgba(92,165,220,0.15);  color: var(--val-blue); }
.val-type-pill--hotel     { background: rgba(201,168,76,0.18);  color: var(--val-gold); }
.val-type-pill--flip      { background: rgba(240,164,41,0.15);  color: var(--val-amber); }
.val-type-pill--mixeduse  { background: rgba(46,158,114,0.15);  color: var(--val-green); }
.val-type-pill--commercial{ background: rgba(92,165,220,0.15);  color: var(--val-blue); }
.val-type-pill--industrial{ background: rgba(148,152,160,0.18); color: var(--val-text-mid); }

/* ══════════════════════════════ DEAL CARD ══════════════════════════════ */

.val-deal-card {
  background: var(--val-bg-panel);
  border: 1px solid var(--val-border);
  border-radius: var(--val-r-lg);
  padding: var(--val-s-5);
  transition: border-color var(--val-dur-base) var(--val-ease-out),
              transform var(--val-dur-base) var(--val-ease-out);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: var(--val-s-4);
}
.val-deal-card:hover {
  border-color: var(--val-border-lt);
  transform: translateY(-1px);
}
.val-deal-card__header {
  display: flex;
  align-items: center;
  gap: var(--val-s-2);
  justify-content: space-between;
}
.val-deal-card__header-left { display: flex; align-items: center; gap: var(--val-s-2); }
.val-deal-card__date {
  font-size: var(--val-size-11);
  color: var(--val-text-dim);
  font-weight: var(--val-w-medium);
  font-variant-numeric: tabular-nums;
}
.val-deal-card__title {
  font-size: var(--val-size-17);
  font-weight: var(--val-w-bold);
  color: var(--val-text);
  letter-spacing: var(--val-track-snug);
  margin: 0;
  line-height: 1.2;
}
.val-deal-card__loc {
  font-size: var(--val-size-12);
  color: var(--val-text-dim);
  font-weight: var(--val-w-medium);
  margin-top: 2px;
}
.val-deal-card__metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--val-s-2);
  background: var(--val-bg-panel-2);
  border-radius: var(--val-r-md);
  padding: var(--val-s-3);
}
.val-deal-card__metric-label {
  font-size: 10px;
  font-weight: var(--val-w-semibold);
  letter-spacing: var(--val-track-wide);
  text-transform: uppercase;
  color: var(--val-text-dim);
}
.val-deal-card__metric-value {
  font-size: var(--val-size-15);
  font-weight: var(--val-w-bold);
  color: var(--val-text);
  margin-top: 2px;
  font-variant-numeric: tabular-nums;
}
.val-deal-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--val-size-12);
  color: var(--val-text-dim);
}
.val-deal-card__footer-value {
  font-weight: var(--val-w-bold);
  color: var(--val-green);
  font-variant-numeric: tabular-nums;
}

/* ══════════════════════════════ TAB FILTER (sub-tabs) ══════════════════════════════ */

.val-filter-tabs {
  display: flex;
  gap: var(--val-s-5);
  border-bottom: 1px solid var(--val-border);
  margin-bottom: var(--val-s-5);
}
.val-filter-tab {
  padding: var(--val-s-2) 0;
  background: transparent;
  border: none;
  font-family: inherit;
  font-size: var(--val-size-13);
  font-weight: var(--val-w-medium);
  color: var(--val-text-dim);
  cursor: pointer;
  position: relative;
  letter-spacing: var(--val-track-wide);
  text-transform: uppercase;
}
.val-filter-tab--active {
  color: var(--val-green);
  font-weight: var(--val-w-bold);
}
.val-filter-tab--active::after {
  content: '';
  position: absolute;
  left: 0; right: 0; bottom: -1px;
  height: 2px;
  background: var(--val-green);
}

/* ══════════════════════════════ TOP NAV ══════════════════════════════ */

.val-nav {
  height: var(--val-nav-h);
  background: var(--val-bg-panel);
  border-bottom: 1px solid var(--val-border);
  display: flex;
  align-items: center;
  padding: 0 var(--val-s-6);
  gap: var(--val-s-6);
  position: sticky;
  top: 0;
  z-index: 40;
}

.val-nav__brand {
  font-weight: var(--val-w-bold);
  font-size: var(--val-size-22);
  letter-spacing: var(--val-track-snug);
  color: var(--val-text);
}

.val-breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--val-s-2);
  font-size: var(--val-size-13);
  color: var(--val-text-dim);
  font-weight: var(--val-w-medium);
}
.val-breadcrumb__sep { opacity: 0.5; }
.val-breadcrumb__current { color: var(--val-text); }

.val-nav__right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--val-s-4);
}

.val-avatar-stack {
  display: flex;
  align-items: center;
}
.val-avatar {
  width: 28px;
  height: 28px;
  border-radius: var(--val-r-pill);
  background: var(--val-bg-panel-2);
  border: 2px solid var(--val-bg-panel);
  display: grid;
  place-items: center;
  font-size: var(--val-size-12);
  font-weight: var(--val-w-bold);
  color: var(--val-text);
  margin-left: -6px;
}
.val-avatar:first-child { margin-left: 0; }
.val-avatar--me { background: var(--val-green); color: var(--val-bg-app); }

/* ══════════════════════════════ TAB BAR ══════════════════════════════ */

.val-tabbar {
  display: flex;
  gap: var(--val-s-1);
  padding: 0 var(--val-s-6);
  height: var(--val-tabbar-h);
  background: var(--val-bg-app);
  border-bottom: 1px solid var(--val-border);
  position: sticky;
  top: var(--val-nav-h);
  z-index: 30;
}
.val-tab {
  padding: 0 var(--val-s-4);
  display: grid;
  place-items: center;
  font-size: var(--val-size-14);
  font-weight: var(--val-w-medium);
  color: var(--val-text-dim);
  cursor: pointer;
  border: none;
  background: transparent;
  position: relative;
  transition: color var(--val-dur-fast) var(--val-ease-out);
}
.val-tab:hover { color: var(--val-text-mid); }
.val-tab--active {
  color: var(--val-text);
  font-weight: var(--val-w-bold);
}
.val-tab--active::after {
  content: '';
  position: absolute;
  left: var(--val-s-3); right: var(--val-s-3);
  bottom: -1px;
  height: 3px;
  background: var(--val-gold);
  border-radius: 2px 2px 0 0;
}

/* ══════════════════════════════ DEAL HEADER ══════════════════════════════ */

.val-deal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: var(--val-s-5) var(--val-s-6);
  background: var(--val-bg-panel);
  border: 1px solid var(--val-border);
  border-radius: var(--val-r-lg);
  margin-bottom: var(--val-s-6);
}
.val-deal-header__title {
  font-size: var(--val-size-22);
  font-weight: var(--val-w-bold);
  color: var(--val-text);
  letter-spacing: var(--val-track-snug);
  margin: 0;
}
.val-deal-header__sub {
  font-size: var(--val-size-13);
  color: var(--val-text-dim);
  font-weight: var(--val-w-medium);
  margin-top: var(--val-s-1);
}

/* ══════════════════════════════ CARD ══════════════════════════════ */

.val-card {
  background: var(--val-bg-panel);
  border: 1px solid var(--val-border);
  border-radius: var(--val-r-lg);
  padding: var(--val-s-5);
  display: flex;
  flex-direction: column;
  gap: var(--val-s-3);
}
.val-card__title {
  font-size: var(--val-size-15);
  font-weight: var(--val-w-bold);
  color: var(--val-text);
  letter-spacing: var(--val-track-snug);
  margin: 0 0 var(--val-s-1);
}
.val-card__sub {
  font-size: var(--val-size-12);
  color: var(--val-text-dim);
  font-weight: var(--val-w-medium);
  margin-top: -6px;
  margin-bottom: var(--val-s-2);
}

/* ══════════════════════════════ METRIC ROW ══════════════════════════════ */

.val-metric-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--val-s-1) 0;
  border-bottom: 1px solid transparent;
}
.val-metric-row + .val-metric-row {
  border-top: 1px solid rgba(255,255,255,0.03);
}
.val-metric-row__label {
  font-size: var(--val-size-13);
  font-weight: var(--val-w-medium);
  color: var(--val-text-dim);
}
.val-metric-row__value {
  font-size: var(--val-size-14);
  font-weight: var(--val-w-bold);
  font-feature-settings: 'tnum';   /* tabular figures so columns line up */
  color: var(--val-text);
  letter-spacing: var(--val-track-snug);
}
.val-metric-row--total {
  padding-top: var(--val-s-3);
  margin-top: var(--val-s-2);
  border-top: 1px solid var(--val-border);
}
.val-metric-row--total .val-metric-row__label {
  color: var(--val-text);
  font-weight: var(--val-w-bold);
}
.val-metric-row--total .val-metric-row__value {
  color: var(--val-gold);
}

/* state-coloured values */
.val-v--gold   { color: var(--val-gold)  !important; }
.val-v--green  { color: var(--val-green) !important; }
.val-v--amber  { color: var(--val-amber) !important; }
.val-v--red    { color: var(--val-red)   !important; }
.val-v--blue   { color: var(--val-blue)  !important; }
.val-v--mid    { color: var(--val-text-mid) !important; }
.val-v--dim    { color: var(--val-text-dim) !important; }

/* ══════════════════════════════ CHIP / STATUS ══════════════════════════════ */

.val-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--val-s-2);
  padding: var(--val-s-1) var(--val-s-3);
  border-radius: var(--val-r-pill);
  font-size: var(--val-size-12);
  font-weight: var(--val-w-semibold);
  letter-spacing: var(--val-track-snug);
  line-height: 1.4;
}
.val-chip__dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.val-chip--green  { background: var(--val-green-tint);  color: var(--val-green);  border: 1px solid rgba(82,196,152,0.35); }
.val-chip--amber  { background: var(--val-amber-tint);  color: var(--val-amber);  border: 1px solid rgba(240,164,41,0.3); }
.val-chip--red    { background: var(--val-red-tint);    color: var(--val-red);    border: 1px solid rgba(244,100,95,0.3); }
.val-chip--blue   { background: var(--val-blue-tint);   color: var(--val-blue);   border: 1px solid rgba(92,165,220,0.3); }
.val-chip--neutral{ background: rgba(255,255,255,0.04); color: var(--val-text-mid); border: 1px solid var(--val-border); }

/* confidence / provenance chip (smaller, flat) */
.val-chip-sm {
  display: inline-flex;
  align-items: center;
  gap: var(--val-s-1);
  padding: 2px 8px;
  border-radius: var(--val-r-xs);
  font-size: var(--val-size-11);
  font-weight: var(--val-w-medium);
  letter-spacing: var(--val-track-wide);
}

/* ══════════════════════════════ BUTTON ══════════════════════════════ */

.val-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--val-s-2);
  height: 36px;
  padding: 0 var(--val-s-4);
  font-family: inherit;
  font-size: var(--val-size-13);
  font-weight: var(--val-w-semibold);
  letter-spacing: var(--val-track-snug);
  border-radius: var(--val-r-sm);
  border: 1px solid transparent;
  cursor: pointer;
  transition: background var(--val-dur-fast) var(--val-ease-out),
              border-color var(--val-dur-fast) var(--val-ease-out),
              transform var(--val-dur-fast) var(--val-ease-out);
}
.val-btn:active { transform: translateY(1px); }
.val-btn:focus-visible { outline: none; box-shadow: var(--val-ring); }

.val-btn--primary {
  background: var(--val-green);
  color: var(--val-bg-app);
}
.val-btn--primary:hover { background: #5DD3A4; }

.val-btn--secondary {
  background: transparent;
  color: var(--val-text-mid);
  border-color: var(--val-border-lt);
}
.val-btn--secondary:hover {
  color: var(--val-text);
  border-color: var(--val-text-dim);
}

.val-btn--ghost {
  background: transparent;
  color: var(--val-text-dim);
}
.val-btn--ghost:hover {
  color: var(--val-text);
  background: rgba(255,255,255,0.04);
}

.val-btn--sm { height: 28px; padding: 0 var(--val-s-3); font-size: var(--val-size-12); }
.val-btn--lg { height: 44px; padding: 0 var(--val-s-5); font-size: var(--val-size-14); }

/* ══════════════════════════════ INPUT ══════════════════════════════ */

.val-input {
  width: 100%;
  height: 40px;
  padding: 0 var(--val-s-3);
  background: var(--val-bg-panel-2);
  border: 1px solid var(--val-border-lt);
  border-radius: var(--val-r-md);
  color: var(--val-text);
  font-family: inherit;
  font-size: var(--val-size-14);
  font-weight: var(--val-w-medium);
  transition: border-color var(--val-dur-fast) var(--val-ease-out);
}
.val-input::placeholder { color: var(--val-text-faint); }
.val-input:hover { border-color: var(--val-text-dim); }
.val-input:focus {
  outline: none;
  border-color: var(--val-green);
  box-shadow: 0 0 0 3px var(--val-green-tint);
}
.val-input--mono { font-family: var(--val-font-mono); font-variant-numeric: tabular-nums; }

.val-label {
  display: block;
  font-size: var(--val-size-11);
  font-weight: var(--val-w-semibold);
  letter-spacing: var(--val-track-wide);
  text-transform: uppercase;
  color: var(--val-text-dim);
  margin-bottom: var(--val-s-2);
}

.val-input-group { display: flex; flex-direction: column; gap: 0; }

/* ══════════════════════════════ SECTION TITLE ══════════════════════════════ */

.val-section-title {
  font-size: var(--val-size-11);
  font-weight: var(--val-w-semibold);
  letter-spacing: var(--val-track-widest);
  text-transform: uppercase;
  color: var(--val-text-dim);
  margin: var(--val-s-10) 0 var(--val-s-3);
}

/* ══════════════════════════════ GRID / STACK ══════════════════════════════ */

.val-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--val-s-5); }
.val-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--val-s-5); }
.val-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--val-s-4); }
.val-stack  { display: flex; flex-direction: column; gap: var(--val-s-5); }
.val-row    { display: flex; align-items: center; gap: var(--val-s-3); }

/* ══════════════════════════════ DIVIDER ══════════════════════════════ */

.val-divider {
  height: 1px;
  background: var(--val-border);
  margin: var(--val-s-6) 0;
}

/* ══════════════════════════════ COPILOT PANEL ══════════════════════════════ */

.val-copilot {
  width: var(--val-copilot-w);
  flex-shrink: 0;
  background: #20242C;                  /* slightly distinct so it reads as separate */
  border-left: 1px solid var(--val-border);
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--val-nav-h));
  position: sticky;
  top: var(--val-nav-h);
}
.val-copilot__header {
  padding: var(--val-s-4) var(--val-s-5);
  border-bottom: 1px solid var(--val-border);
  display: flex;
  align-items: center;
  gap: var(--val-s-3);
}
.val-copilot__title {
  font-size: var(--val-size-17);
  font-weight: var(--val-w-bold);
  color: var(--val-text);
  line-height: 1.2;
}
.val-copilot__sub {
  font-size: var(--val-size-11);
  color: var(--val-text-dim);
  font-weight: var(--val-w-medium);
  margin-top: 2px;
}
.val-copilot__sparkle {
  width: 20px; height: 20px;
  background:
    radial-gradient(circle at center, var(--val-green) 0%, transparent 70%);
  border-radius: 50%;
  position: relative;
}
.val-copilot__sparkle::before, .val-copilot__sparkle::after {
  content: '';
  position: absolute;
  background: var(--val-green);
}
.val-copilot__sparkle::before { inset: 8px 0; width: 100%; height: 4px; }
.val-copilot__sparkle::after  { inset: 0 8px; width: 4px; height: 100%; }

.val-copilot__body {
  flex: 1;
  overflow-y: auto;
  padding: var(--val-s-5);
  display: flex;
  flex-direction: column;
  gap: var(--val-s-5);
}

.val-copilot__context {
  background: var(--val-bg-panel);
  border: 1px solid var(--val-border);
  border-radius: var(--val-r-md);
  padding: var(--val-s-3);
}
.val-copilot__context-title {
  font-size: var(--val-size-11);
  font-weight: var(--val-w-bold);
  color: var(--val-green);
  letter-spacing: var(--val-track-wide);
  display: flex; align-items: center; gap: 6px;
}
.val-copilot__context-body {
  font-size: var(--val-size-12);
  color: var(--val-text-dim);
  font-weight: var(--val-w-medium);
  margin-top: 4px;
}

.val-msg { display: flex; flex-direction: column; gap: var(--val-s-2); max-width: 88%; }
.val-msg--user   { align-self: flex-end; }
.val-msg--bot    { align-self: flex-start; }
.val-msg__bubble {
  padding: var(--val-s-3) var(--val-s-4);
  border-radius: var(--val-r-xl);
  font-size: var(--val-size-13);
  line-height: var(--val-lh-normal);
}
.val-msg--user .val-msg__bubble {
  background: rgba(82,196,152,0.14);
  border: 1px solid rgba(82,196,152,0.2);
  color: var(--val-text);
  border-bottom-right-radius: var(--val-r-sm);
}
.val-msg--bot .val-msg__bubble {
  background: transparent;
  padding-left: 0;
  color: var(--val-text);
}
.val-msg__meta {
  font-size: var(--val-size-10);
  color: var(--val-text-dim);
  font-weight: var(--val-w-medium);
}

.val-copilot__input-wrap {
  border-top: 1px solid var(--val-border);
  padding: var(--val-s-3) var(--val-s-4) var(--val-s-4);
  background: #20242C;
}
.val-copilot__suggestions {
  display: flex;
  gap: var(--val-s-2);
  flex-wrap: wrap;
  margin-bottom: var(--val-s-3);
}
.val-sug-chip {
  padding: 4px 12px;
  border-radius: var(--val-r-pill);
  border: 1px solid var(--val-border-lt);
  background: transparent;
  color: var(--val-text-mid);
  font-size: var(--val-size-11);
  font-weight: var(--val-w-medium);
  cursor: pointer;
  transition: all var(--val-dur-fast) var(--val-ease-out);
}
.val-sug-chip:hover {
  border-color: var(--val-green);
  color: var(--val-green);
}

.val-copilot__input {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--val-bg-panel-2);
  border: 1px solid var(--val-border-lt);
  border-radius: var(--val-r-md);
  padding-right: var(--val-s-2);
}
.val-copilot__input input {
  flex: 1;
  background: transparent;
  border: none;
  padding: var(--val-s-3);
  color: var(--val-text);
  font-size: var(--val-size-14);
  font-family: inherit;
  font-weight: var(--val-w-medium);
}
.val-copilot__input input:focus { outline: none; }
.val-copilot__input input::placeholder { color: var(--val-text-faint); }
.val-copilot__send {
  width: 32px; height: 32px;
  border-radius: var(--val-r-sm);
  border: none;
  background: var(--val-green);
  color: var(--val-bg-app);
  font-size: var(--val-size-16);
  font-weight: var(--val-w-bold);
  cursor: pointer;
  display: grid; place-items: center;
}
.val-copilot__disclaimer {
  font-size: var(--val-size-10);
  color: var(--val-text-dim);
  font-weight: var(--val-w-regular);
  margin-top: var(--val-s-2);
}

/* ══════════════════════════════ UTILITY ══════════════════════════════ */

.val-muted { color: var(--val-text-dim) !important; }
.val-bold  { font-weight: var(--val-w-bold) !important; }
.val-mono  { font-family: var(--val-font-mono) !important; font-variant-numeric: tabular-nums; }
.val-hide-mobile { }
@media (max-width: 900px) {
  .val-hide-mobile { display: none !important; }
  .val-copilot { display: none; }
  :root { --val-copilot-w: 0; }
}

/* ══════════════════════════════ FOCUS VISIBLE ══════════════════════════════ */

:focus-visible {
  outline: 2px solid var(--val-green);
  outline-offset: 2px;
}
button:focus-visible, a:focus-visible { box-shadow: var(--val-ring); outline: none; }`;

const fmt = (n: number, prefix = "£") => {
  if (!n || !isFinite(n) || isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${prefix}${(n / 1e9).toFixed(2)}bn`;
  if (abs >= 1e6) return `${prefix}${(n / 1e6).toFixed(2)}m`;
  if (abs >= 1e3) return `${prefix}${(n / 1e3).toFixed(0)}k`;
  return `${prefix}${n.toFixed(0)}`;
};
const fmtPct = (n: number) => (!n || !isFinite(n) || isNaN(n) ? "—" : `${(n * 100).toFixed(1)}%`);
const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const fmtDateTime = (d: string) => new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const CURRENCY_SYMBOLS: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", AED: "د.إ", SGD: "S$", AUD: "A$", JPY: "¥", CHF: "Fr", CAD: "C$", HKD: "HK$" };

const STAGES = [
  { id: "prospect",       label: "Prospect",       dotMod: "prospect" },
  { id: "feasibility",    label: "Feasibility",    dotMod: "feasibility" },
  { id: "under_offer",    label: "Under Offer",    dotMod: "under_offer" },
  { id: "in_development", label: "In Development", dotMod: "in_development" },
  { id: "completed",      label: "Completed",      dotMod: "completed" },
];

// Map asset_type (DB value) to the val-type-pill modifier class suffix
const ASSET_PILL: Record<string, string> = {
  BTR: "btr",
  BTS: "bts",
  Hotel: "hotel",
  Flip: "flip",
  MixedUse: "mixeduse",
  Commercial: "commercial",
  Industrial: "industrial",
};
const ASSET_LABEL: Record<string, string> = {
  BTR: "BTR",
  BTS: "BTS",
  Hotel: "Hotel",
  Flip: "Flip",
  MixedUse: "Mixed Use",
  Commercial: "Commercial",
  Industrial: "Industrial",
};

const PRIORITY_LABEL: Record<string, string> = { low: "Low", medium: "Medium", high: "High", urgent: "Urgent" };

export default function PipelinePage() {
  const router = useRouter();

  // ── Theme — defensive sync across every mechanism the app might use ──
  //
  // Different pages in the app historically used different theme mechanisms
  // (body.light class; data-theme attribute; various localStorage keys).
  // Pipeline detects whichever signal is present, and writes to ALL of them
  // on toggle so every page stays in sync regardless of which one it reads.
  const detectTheme = (): "dark" | "light" => {
    if (typeof document === "undefined") return "dark";
    // 1. body.light class (dashboard's live signal)
    if (document.body && document.body.classList.contains("light")) return "light";
    // 2. <html data-theme="...">
    const htmlTheme = document.documentElement.getAttribute("data-theme");
    if (htmlTheme === "light" || htmlTheme === "dark") return htmlTheme;
    // 3. localStorage — try every key the app might use
    try {
      for (const key of ["valora-theme", "val-theme", "theme"]) {
        const v = localStorage.getItem(key);
        if (v === "light" || v === "dark") return v;
      }
    } catch {}
    return "dark";
  };
  const applyTheme = (t: "dark" | "light") => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", t);
    document.body.classList.toggle("light", t === "light");
    try { localStorage.setItem("valora-theme", t); } catch {}
    try { localStorage.setItem("val-theme", t); } catch {}
  };

  const [theme, setTheme] = useState<"dark" | "light">(() => detectTheme());
  useEffect(() => { applyTheme(theme); }, [theme]);

  // Watch for theme changes from anywhere else — storage events (other tabs),
  // body.light flipped by dashboard, data-theme attribute changed on html,
  // focus / visibility returning to the pipeline tab.
  useEffect(() => {
    let disposed = false;
    const resync = () => {
      if (disposed) return;
      const t = detectTheme();
      setTheme(prev => prev === t ? prev : t);
    };
    const onStorage = (e: StorageEvent) => { if (e.key && /theme/i.test(e.key)) resync(); };

    const bodyObs = new MutationObserver(resync);
    bodyObs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    const htmlObs = new MutationObserver(resync);
    htmlObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", resync);
    document.addEventListener("visibilitychange", resync);

    return () => {
      disposed = true;
      bodyObs.disconnect();
      htmlObs.disconnect();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", resync);
      document.removeEventListener("visibilitychange", resync);
    };
  }, []);

  // ── Data state ──
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Record<string, any[]>>({});
  const [notes, setNotes] = useState<Record<string, any[]>>({});
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Drag & side-panel state ──
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const dragItem = useRef<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [panelTab, setPanelTab] = useState<"tasks" | "notes" | "activity">("tasks");

  // ── Form state ──
  const [newTask, setNewTask] = useState({ description: "", due_at: "", priority: "medium" });
  const [savingTask, setSavingTask] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      setUser(session.user);
      await loadAll(session.user.id);
    };
    init();
  }, [router]);

  const loadAll = async (userId: string) => {
    setLoading(true);
    const [{ data: projData }, { data: taskData }, { data: noteData }, { data: actData }] = await Promise.all([
      supabase.from("projects").select(`*,appraisals(id,gdv,profit,profit_on_cost,irr_unlevered,status,created_at)`).eq("created_by", userId).is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("tasks").select("*").or(`created_by.eq.${userId},assigned_to.eq.${userId}`).order("created_at", { ascending: false }),
      // ── unified notes table — filter by user and only project-linked notes ──
      supabase.from("notes").select("*").eq("user_id", userId).not("project_id", "is", null).order("created_at", { ascending: false }),
      supabase.from("activity").select("*").eq("created_by", userId).order("created_at", { ascending: false }).limit(50),
    ]);
    setProjects(projData || []);
    const tm: Record<string, any[]> = {};
    (taskData || []).forEach(t => { if (!tm[t.project_id]) tm[t.project_id] = []; tm[t.project_id].push(t); });
    setTasks(tm);
    const nm: Record<string, any[]> = {};
    (noteData || []).forEach(n => { if (n.project_id) { if (!nm[n.project_id]) nm[n.project_id] = []; nm[n.project_id].push(n); } });
    setNotes(nm);
    setActivity(actData || []);
    setLoading(false);
  };

  const logActivity = async (projectId: string, action: string, meta?: any) => {
    if (!user) return;
    const { data: a } = await supabase.from("activity").insert({ project_id: projectId, created_by: user.id, action, meta }).select().single();
    if (a) setActivity(prev => [a, ...prev].slice(0, 50));
  };

  const moveProject = async (projectId: string, newStage: string) => {
    const p = projects.find(x => x.id === projectId);
    const old = p?.pipeline_stage || "prospect";
    if (old === newStage) return;
    setProjects(prev => prev.map(x => x.id === projectId ? { ...x, pipeline_stage: newStage } : x));
    await supabase.from("projects").update({ pipeline_stage: newStage }).eq("id", projectId);
    await logActivity(projectId, `Moved to ${STAGES.find(s => s.id === newStage)?.label || newStage}`, { from: old, to: newStage });
  };

  const onDragStart = (e: React.DragEvent, p: any) => { dragItem.current = p; setDraggingId(p.id); e.dataTransfer.effectAllowed = "move"; };
  const onDragEnd = () => { setDraggingId(null); setDragOverCol(null); };
  const onDragOver = (e: React.DragEvent, sid: string) => { e.preventDefault(); setDragOverCol(sid); };
  const onDrop = (e: React.DragEvent, sid: string) => {
    e.preventDefault();
    if (dragItem.current && (dragItem.current.pipeline_stage || "prospect") !== sid) moveProject(dragItem.current.id, sid);
    setDraggingId(null); setDragOverCol(null); dragItem.current = null;
  };

  const openPanel = (p: any, tab: "tasks" | "notes" | "activity" = "tasks") => { setSelectedProject(p); setPanelTab(tab); };
  const openProject = (p: any) => { const l = p.appraisals?.[0]; router.push(l ? `/appraisal?project=${p.id}&appraisal=${l.id}` : `/appraisal?project=${p.id}`); };

  const addTask = async () => {
    if (!newTask.description.trim() || !selectedProject || !user) return;
    setSavingTask(true);
    const { data } = await supabase.from("tasks").insert({
      project_id: selectedProject.id, created_by: user.id, created_by_email: user.email,
      title: newTask.description.trim(), description: newTask.description.trim(),
      due_date: newTask.due_at || null, priority: newTask.priority, status: "not_started", completed: false,
    }).select().single();
    if (data) {
      setTasks(prev => ({ ...prev, [selectedProject.id]: [...(prev[selectedProject.id] || []), data] }));
      setNewTask({ description: "", due_at: "", priority: "medium" });
      await logActivity(selectedProject.id, `Task added: "${data.description}"`, { priority: data.priority });
    }
    setSavingTask(false);
  };

  const toggleTask = async (task: any) => {
    const u = { ...task, completed: !task.completed };
    await supabase.from("tasks").update({ completed: u.completed }).eq("id", task.id);
    setTasks(prev => ({ ...prev, [task.project_id]: prev[task.project_id].map(t => t.id === task.id ? u : t) }));
    if (u.completed) await logActivity(task.project_id, `Task completed: "${task.description}"`);
  };

  const deleteTask = async (task: any) => {
    await supabase.from("tasks").delete().eq("id", task.id);
    setTasks(prev => ({ ...prev, [task.project_id]: prev[task.project_id].filter(t => t.id !== task.id) }));
  };

  // ── UNIFIED addNote — writes to shared notes table ──
  const addNote = async () => {
    if (!newNote.trim() || !selectedProject || !user) return;
    setSavingNote(true);
    const now = new Date().toISOString();
    const { data } = await supabase.from("notes").insert({
      user_id: user.id,
      project_id: selectedProject.id,
      body: newNote.trim(),
      source: "pipeline",
      created_at: now,
      updated_at: now,
    }).select().single();
    if (data) {
      setNotes(prev => ({ ...prev, [selectedProject.id]: [data, ...(prev[selectedProject.id] || [])] }));
      setNewNote("");
      await logActivity(selectedProject.id, `Note added`, { preview: data.body.slice(0, 60) });
    }
    setSavingNote(false);
  };

  const deleteNote = async (note: any) => {
    await supabase.from("notes").delete().eq("id", note.id).eq("user_id", user.id);
    setNotes(prev => ({ ...prev, [note.project_id]: prev[note.project_id].filter(n => n.id !== note.id) }));
  };

  const signOut = async () => { await supabase.auth.signOut(); router.push("/"); };

  // ── Derived stats ──
  const totalGDV = projects.reduce((s, p) => s + (p.appraisals?.[0]?.gdv || 0), 0);
  const avgPoC = (() => { const v = projects.filter(p => p.appraisals?.[0]?.profit_on_cost); return v.length ? v.reduce((s, p) => s + (p.appraisals[0].profit_on_cost || 0), 0) / v.length : 0; })();
  const active = projects.filter(p => p.pipeline_stage !== "completed").length;
  const done = projects.filter(p => p.pipeline_stage === "completed").length;
  const openTasks = Object.values(tasks).flat().filter(t => !t.completed).length;

  if (loading) return (
    <>
      <style>{VALORA_CSS}</style>
      <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=null;if(document.body&&document.body.classList.contains('light'))t='light';if(!t){var h=document.documentElement.getAttribute('data-theme');if(h==='light'||h==='dark')t=h;}if(!t){var keys=['valora-theme','val-theme','theme'];for(var i=0;i<keys.length;i++){var v=localStorage.getItem(keys[i]);if(v==='light'||v==='dark'){t=v;break;}}}if(!t)t='dark';document.documentElement.setAttribute('data-theme',t);if(t==='light'&&document.body)document.body.classList.add('light');try{localStorage.setItem('valora-theme',t);localStorage.setItem('val-theme',t);}catch(e){}}catch(e){}})()` }} />
      <div className="pipe-loading">
        <div className="pipe-loading__brand">Valora</div>
        <div className="pipe-loading__spinner" />
        <div className="pipe-loading__label">Loading pipeline…</div>
      </div>
    </>
  );

  return (
    <div className="val-app">
      <style>{VALORA_CSS}</style>
      <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=null;if(document.body&&document.body.classList.contains('light'))t='light';if(!t){var h=document.documentElement.getAttribute('data-theme');if(h==='light'||h==='dark')t=h;}if(!t){var keys=['valora-theme','val-theme','theme'];for(var i=0;i<keys.length;i++){var v=localStorage.getItem(keys[i]);if(v==='light'||v==='dark'){t=v;break;}}}if(!t)t='dark';document.documentElement.setAttribute('data-theme',t);if(t==='light'&&document.body)document.body.classList.add('light');try{localStorage.setItem('valora-theme',t);localStorage.setItem('val-theme',t);}catch(e){}}catch(e){}})()` }} />

      {/* ── SIDEBAR ── */}
      <aside className="val-sidebar">
        <div className="val-sidebar__brand">
          <div className="val-sidebar__brand-name">Valora</div>
          <div className="val-sidebar__brand-sub">Development Appraisal</div>
        </div>

        <div className="val-sidebar__section-title">My Work</div>
        <nav className="val-sidebar__nav">
          <button className="val-nav-item" onClick={() => router.push("/dashboard")}>Portfolio</button>
          <button className="val-nav-item val-nav-item--active">Pipeline</button>
          <button className="val-nav-item" onClick={() => router.push("/tasks")}>Tasks</button>
          <button className="val-nav-item" onClick={() => router.push("/notes")}>Notes</button>
          <button className="val-nav-item" onClick={() => router.push("/learn")}>+ Learn</button>
        </nav>

        <div className="val-sidebar__section-title">Team</div>
        <nav className="val-sidebar__nav">
          <button className="val-nav-item" onClick={() => router.push("/workspace")}>◆ Workspace</button>
          <button className="val-nav-item" onClick={() => router.push("/team")}>Team</button>
        </nav>

        <div className="val-sidebar__footer">
          <div className="val-sidebar__footer-email">{user?.email}</div>
          <div className="val-sidebar__footer-row">
            <button className="val-nav-item" onClick={signOut} style={{ padding: "4px 0", fontSize: "var(--val-size-12)" }}>Sign Out</button>
            <button className="val-theme-toggle" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} title={theme === "dark" ? "Switch to light" : "Switch to dark"}>
              <span>{theme === "dark" ? "◐" : "◑"}</span>
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="val-main">
        <main className="val-content">

          {/* Page header */}
          <div className="val-page-header">
            <div>
              <h1 className="val-page-header__title">Deal Pipeline</h1>
              <div className="val-page-header__sub">
                {projects.length} deal{projects.length !== 1 ? "s" : ""} · drag to move stage
              </div>
            </div>
            <div className="val-page-header__actions">
              {openTasks > 0 && (
                <span className="val-chip val-chip--amber" style={{ fontSize: "var(--val-size-11)" }}>
                  {openTasks} open
                </span>
              )}
              <button className="val-btn val-btn--primary" onClick={() => router.push("/dashboard")}>+ New</button>
            </div>
          </div>

          {/* Stat strip */}
          <div className="val-stat-strip">
            <div className="val-stat">
              <div className="val-stat__label">Active</div>
              <div className="val-stat__value val-v--blue">{active}</div>
            </div>
            <div className="val-stat">
              <div className="val-stat__label">Done</div>
              <div className={`val-stat__value ${done > 0 ? "val-v--green" : ""}`}>{done}</div>
            </div>
            <div className="val-stat">
              <div className="val-stat__label">GDV</div>
              <div className="val-stat__value val-v--green">{fmt(totalGDV)}</div>
            </div>
            <div className="val-stat">
              <div className="val-stat__label">Avg PoC</div>
              <div className={`val-stat__value ${avgPoC > 0.2 ? "val-v--green" : avgPoC > 0.1 ? "val-v--amber" : "val-v--mid"}`}>{fmtPct(avgPoC)}</div>
            </div>
            <div className="val-stat">
              <div className="val-stat__label">Tasks</div>
              <div className={`val-stat__value ${openTasks > 0 ? "val-v--amber" : "val-v--dim"}`}>{openTasks}</div>
            </div>
          </div>

          {/* Empty state */}
          {projects.length === 0 && (
            <div className="pipe-empty">
              <div className="pipe-empty__icon">◆</div>
              <div className="pipe-empty__title">No deals in pipeline</div>
              <div className="pipe-empty__sub">Create your first appraisal to start tracking deals.</div>
              <button className="val-btn val-btn--primary" onClick={() => router.push("/dashboard")}>+ Create First Appraisal</button>
            </div>
          )}

          {/* Kanban board */}
          {projects.length > 0 && (
            <div className="kb-board">
              {STAGES.map(stage => {
                const cols = projects.filter(p => (p.pipeline_stage || "prospect") === stage.id);
                const gdv = cols.reduce((s, p) => s + (p.appraisals?.[0]?.gdv || 0), 0);
                return (
                  <div key={stage.id}
                    className={`kb-col ${dragOverCol === stage.id ? "kb-col--drag-over" : ""}`}
                    onDragOver={e => onDragOver(e, stage.id)}
                    onDrop={e => onDrop(e, stage.id)}>

                    <div className="kb-col__head">
                      <span className={`kb-col__dot kb-col__dot--${stage.dotMod}`} />
                      <span className="kb-col__label">{stage.label}</span>
                      <span className="kb-col__count">{cols.length}</span>
                    </div>
                    {gdv > 0 && <div className="kb-col__total">{fmt(gdv)}</div>}

                    {cols.length === 0 && <div className="kb-drop">Drop here</div>}

                    {cols.map(project => {
                      const latest = project.appraisals?.[0];
                      const poc = latest?.profit_on_cost;
                      const sym = CURRENCY_SYMBOLS[project.currency] || "£";
                      const pillMod = ASSET_PILL[project.asset_type] || "btr";
                      const assetLabel = ASSET_LABEL[project.asset_type] || project.asset_type || "BTR";
                      const pt = (tasks[project.id] || []).filter(t => !t.completed);
                      const pn = (notes[project.id] || []).length;
                      const pocClass = poc > 0.2 ? "val-v--green" : poc > 0.1 ? "val-v--amber" : "val-v--red";
                      return (
                        <div key={project.id}
                          className={`kb-card ${draggingId === project.id ? "kb-card--dragging" : ""} ${selectedProject?.id === project.id ? "kb-card--selected" : ""}`}
                          draggable
                          onDragStart={e => onDragStart(e, project)}
                          onDragEnd={onDragEnd}
                          onClick={() => openPanel(project, "tasks")}>

                          {pt.length > 0 && <div className="kb-card__task-count">{pt.length}</div>}

                          <span className={`val-type-pill val-type-pill--${pillMod}`} style={{ alignSelf: "flex-start" }}>
                            {assetLabel}
                          </span>

                          <div>
                            <h3 className="kb-card__title">{project.name || "Untitled"}</h3>
                            <div className="kb-card__loc">{project.location || "—"}</div>
                          </div>

                          {latest ? (
                            <div className="kb-card__row">
                              <span className="kb-card__row-left">{fmt(latest.gdv, sym)}</span>
                              <span className={pocClass}>{fmtPct(poc)}</span>
                            </div>
                          ) : (
                            <div style={{ fontSize: "var(--val-size-11)", color: "var(--val-text-dim)" }}>No appraisal yet</div>
                          )}

                          {(pt.length > 0 || pn > 0) && (
                            <div className="kb-card__mini-stats">
                              {pt.length > 0 && <span className="kb-card__mini-stat" style={{ color: "var(--val-amber)" }}>✓ {pt.length}</span>}
                              {pn > 0 && <span className="kb-card__mini-stat">📝 {pn}</span>}
                            </div>
                          )}

                          <select className="kb-select"
                            value={project.pipeline_stage || "prospect"}
                            onClick={e => e.stopPropagation()}
                            onChange={e => { e.stopPropagation(); moveProject(project.id, e.target.value); }}>
                            {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                          </select>

                          <div className="kb-card__actions" onClick={e => e.stopPropagation()}>
                            <button className="kb-card__btn" onClick={e => { e.stopPropagation(); openPanel(project, "tasks"); }}>Tasks</button>
                            <button className="kb-card__btn" onClick={e => { e.stopPropagation(); openPanel(project, "notes"); }}>Notes</button>
                            <button className="kb-card__btn" onClick={e => { e.stopPropagation(); openProject(project); }}>Open →</button>
                          </div>
                        </div>
                      );
                    })}

                    <button className="kb-col__add" onClick={() => router.push("/dashboard")}>+ Add</button>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ── SIDE PANEL ── */}
      {selectedProject && (
        <>
          <div className="side-panel-overlay" onClick={() => setSelectedProject(null)} />
          <aside className="side-panel">
            <div className="side-panel__head">
              <div className="side-panel__title-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="side-panel__title">{selectedProject.name || "Untitled"}</div>
                  <div className="side-panel__sub">
                    {selectedProject.location || "—"} · {ASSET_LABEL[selectedProject.asset_type] || selectedProject.asset_type}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "var(--val-s-2)", flexShrink: 0 }}>
                  <button className="val-btn val-btn--secondary val-btn--sm" onClick={() => openProject(selectedProject)}>Open ↗</button>
                  <button className="side-panel__close" onClick={() => setSelectedProject(null)}>×</button>
                </div>
              </div>
              <div className="side-panel__tabs">
                {(["tasks", "notes", "activity"] as const).map(tab => (
                  <button key={tab}
                    className={`side-panel__tab ${panelTab === tab ? "side-panel__tab--active" : ""}`}
                    onClick={() => setPanelTab(tab)}>
                    {tab === "tasks"
                      ? `Tasks (${(tasks[selectedProject.id] || []).filter(t => !t.completed).length})`
                      : tab === "notes"
                        ? `Notes (${(notes[selectedProject.id] || []).length})`
                        : "Activity"}
                  </button>
                ))}
              </div>
            </div>

            <div className="side-panel__body">
              {panelTab === "tasks" && (
                <>
                  <div className="side-panel__form">
                    <div className="val-label">New Task</div>
                    <textarea
                      className="side-panel__textarea"
                      placeholder="Task description…"
                      value={newTask.description}
                      onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                      style={{ height: 64 }} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--val-s-2)" }}>
                      <div>
                        <div className="val-label">Due</div>
                        <input
                          className="val-input"
                          type="datetime-local"
                          value={newTask.due_at}
                          onChange={e => setNewTask(p => ({ ...p, due_at: e.target.value }))}
                          style={{ fontSize: "var(--val-size-12)", colorScheme: theme as any }} />
                      </div>
                      <div>
                        <div className="val-label">Priority</div>
                        <select
                          className="val-input"
                          value={newTask.priority}
                          onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}
                          style={{ fontSize: "var(--val-size-12)", cursor: "pointer" }}>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>
                    <button
                      className="val-btn val-btn--primary"
                      onClick={addTask}
                      disabled={!newTask.description.trim() || savingTask}
                      style={{ width: "100%" }}>
                      {savingTask ? "Adding…" : "+ Add Task"}
                    </button>
                  </div>

                  {(tasks[selectedProject.id] || []).length === 0 ? (
                    <div className="side-panel__empty">No tasks yet</div>
                  ) : (
                    <>
                      {(tasks[selectedProject.id] || []).filter(t => !t.completed).map(task => {
                        const overdue = task.due_at && new Date(task.due_at) < new Date();
                        const priMod = (task.priority as string) || "medium";
                        return (
                          <div key={task.id} className="task-item">
                            <button className="task-item__check" onClick={() => toggleTask(task)} aria-label="Complete" />
                            <div className="task-item__body">
                              <div className="task-item__desc">{task.description}</div>
                              <div className="task-item__meta">
                                <span className={`pri-chip pri-chip--${priMod}`}>{PRIORITY_LABEL[priMod] || priMod}</span>
                                {task.due_at && (
                                  <span className={`task-item__due ${overdue ? "task-item__due--overdue" : ""}`}>
                                    {overdue ? "⚠ " : ""}{fmtDateTime(task.due_at)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button className="task-item__delete" onClick={() => deleteTask(task)}>×</button>
                          </div>
                        );
                      })}

                      {(tasks[selectedProject.id] || []).filter(t => t.completed).length > 0 && (
                        <>
                          <div className="side-panel__section-title">Completed</div>
                          {(tasks[selectedProject.id] || []).filter(t => t.completed).map(task => (
                            <div key={task.id} className="task-item task-item--done">
                              <button className="task-item__check task-item__check--checked" onClick={() => toggleTask(task)} aria-label="Reopen" />
                              <div className="task-item__body">
                                <div className="task-item__desc">{task.description}</div>
                              </div>
                              <button className="task-item__delete" onClick={() => deleteTask(task)}>×</button>
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </>
              )}

              {panelTab === "notes" && (
                <>
                  <div className="side-panel__form">
                    <div className="val-label">New Note</div>
                    <textarea
                      className="side-panel__textarea"
                      placeholder="Add a note…"
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      style={{ height: 96, lineHeight: "var(--val-lh-loose)" }} />
                    <button
                      className="val-btn val-btn--primary"
                      onClick={addNote}
                      disabled={!newNote.trim() || savingNote}
                      style={{ width: "100%" }}>
                      {savingNote ? "Saving…" : "+ Add Note"}
                    </button>
                  </div>

                  {(notes[selectedProject.id] || []).length === 0 ? (
                    <div className="side-panel__empty">No notes yet</div>
                  ) : (
                    (notes[selectedProject.id] || []).map(note => (
                      <div key={note.id} className="note-item">
                        <div className="note-item__head">
                          <span className="note-item__date">{fmtDate(note.created_at)}</span>
                          <button className="task-item__delete" onClick={() => deleteNote(note)}>×</button>
                        </div>
                        <div className="note-item__body">{note.body}</div>
                      </div>
                    ))
                  )}
                </>
              )}

              {panelTab === "activity" && (
                <>
                  {activity.filter(a => a.project_id === selectedProject.id).length === 0 ? (
                    <div className="side-panel__empty">No activity yet</div>
                  ) : (
                    activity.filter(a => a.project_id === selectedProject.id).map(act => (
                      <div key={act.id} className="activity-row">
                        <div className="activity-row__icon">
                          {act.action.startsWith("Moved") ? "→"
                            : act.action.startsWith("Task completed") ? "✓"
                            : act.action.startsWith("Task added") ? "✚"
                            : "📝"}
                        </div>
                        <div className="activity-row__body">
                          <div className="activity-row__action">{act.action}</div>
                          {act.meta?.preview && (
                            <div className="activity-row__preview">
                              "{act.meta.preview}{act.meta.preview?.length >= 60 ? "…" : ""}"
                            </div>
                          )}
                          <div className="activity-row__time">{fmtDateTime(act.created_at)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
