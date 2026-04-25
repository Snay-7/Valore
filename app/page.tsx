"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
/* ═══════════════════════════════════════════════════════════════════
   VALORA — LANDING (Client Component)
   High-conversion, SEO-friendly, semantic HTML.
   ═══════════════════════════════════════════════════════════════════ */
const CALENDLY = "https://calendly.com/hello-valoraplatform/30min";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --navy:#1A1E26; --navy-d:#0F1115; --navy-m:#242933;
  --cream:#F5F0E1; --cream-d:#EAE5D8; --cream-l:#FAF6ED;
  --text:#0F1115; --text-m:#3D4351; --text-d:#6B7280; --text-faint:#A0A5AE;
  --green:#2E9E72; --green-l:#52C498; --green-hot:#6DFFB1;
  --green-bg:rgba(46,158,114,.08); --green-border:rgba(46,158,114,.25);
  --gold:#A8843A;
  --border:rgba(15,17,21,.08); --border-m:rgba(15,17,21,.16);
  --border-dark:rgba(255,255,255,.08); --border-dark-m:rgba(255,255,255,.16);
  --font-display:'Poppins',system-ui,-apple-system,sans-serif;
  --font-body:'Poppins',system-ui,-apple-system,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
  --ease:cubic-bezier(0.16,1,0.3,1);
}
html,body{background:var(--cream);color:var(--text);font-family:var(--font-body);font-size:16px;line-height:1.55;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;scroll-behavior:smooth}
body{overflow-x:hidden}
img,svg{display:block;max-width:100%}
a{color:inherit;text-decoration:none}
button{font-family:inherit;cursor:pointer}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulseDot{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes typingDot{0%,80%,100%{opacity:.3;transform:scale(.9)}40%{opacity:1;transform:scale(1.1)}}
.fade-up{animation:fadeUp .6s var(--ease) both}

/* ── NAV ── */
.nav{position:sticky;top:0;z-index:50;backdrop-filter:blur(14px);background:rgba(245,240,225,.85);border-bottom:1px solid var(--border)}
.nav-inner{max-width:1240px;margin:0 auto;padding:16px 32px;display:flex;align-items:center;justify-content:space-between;gap:24px}
.nav-logo{display:flex;align-items:center;gap:10px;font-family:var(--font-display);font-weight:800;font-size:20px;letter-spacing:-.02em;color:var(--navy)}
.nav-logo-mark{width:26px;height:26px;border-radius:6px;background:var(--green);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:800}
.nav-links{display:flex;gap:28px;font-size:14px;font-weight:500;color:var(--text-m)}
.nav-links a{transition:color .15s;cursor:pointer}
.nav-links a:hover{color:var(--navy)}
.nav-cta{display:flex;gap:10px;align-items:center}

/* ── Buttons ── */
.btn{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;border-radius:10px;font-family:var(--font-body);font-size:14px;font-weight:600;letter-spacing:-.01em;cursor:pointer;transition:all .2s var(--ease);border:1px solid transparent;text-decoration:none;white-space:nowrap}
.btn-primary{background:var(--green);color:#fff;border-color:var(--green)}
.btn-primary:hover{background:var(--green-l);border-color:var(--green-l);transform:translateY(-1px)}
.btn-ghost{background:transparent;color:var(--navy);border-color:var(--border-m)}
.btn-ghost:hover{border-color:var(--navy);background:rgba(15,17,21,.03)}
.btn-dark{background:var(--navy);color:var(--cream);border-color:var(--navy)}
.btn-dark:hover{background:#000}
.btn-lg{padding:14px 26px;font-size:15px;font-weight:700}
.btn-sm{padding:8px 14px;font-size:13px}

/* ── Sections ── */
.section{padding:112px 32px}
.section-narrow{max-width:820px;margin:0 auto}
.section-wide{max-width:1240px;margin:0 auto}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:var(--green);margin-bottom:20px}
.eyebrow-mark{width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;color:var(--green);font-size:10px}
.h1{font-family:var(--font-display);font-size:72px;font-weight:800;letter-spacing:-.04em;line-height:1.02;color:var(--navy)}
.h2{font-family:var(--font-display);font-size:48px;font-weight:800;letter-spacing:-.03em;line-height:1.08;color:var(--navy)}
.h3{font-family:var(--font-display);font-size:22px;font-weight:700;letter-spacing:-.02em;line-height:1.25;color:var(--navy)}
.lede{font-size:19px;line-height:1.55;color:var(--text-m);font-weight:400}
.small{font-size:13px;color:var(--text-d)}

/* ── HERO ── */
.hero{padding:88px 32px 104px;background:linear-gradient(180deg,var(--cream-l) 0%,var(--cream) 100%);position:relative;overflow:hidden}
.hero-grid{max-width:1240px;margin:0 auto;display:grid;grid-template-columns:1.15fr 1fr;gap:80px;align-items:center}
.hero-copy{max-width:620px}
.hero .h1{margin-bottom:24px}
.hero .h1 em{font-style:normal;color:var(--green);font-weight:800}
.hero .lede{margin-bottom:36px;max-width:540px}
.hero-cta{display:flex;gap:12px;align-items:center;margin-bottom:24px;flex-wrap:wrap}
.hero-trust{font-size:13px;color:var(--text-d);font-weight:500;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.hero-trust-dot{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 10px var(--green);animation:pulseDot 2s infinite}

/* Copilot demo card in hero */
.demo-card{background:#fff;border:1px solid var(--border);border-radius:20px;padding:24px;box-shadow:0 30px 80px rgba(15,17,21,.08),0 2px 6px rgba(15,17,21,.03);position:relative}
.demo-header{display:flex;align-items:center;gap:10px;padding-bottom:16px;margin-bottom:16px;border-bottom:1px solid var(--border)}
.demo-logo{width:30px;height:30px;border-radius:8px;background:var(--green-bg);border:1px solid var(--green-border);display:flex;align-items:center;justify-content:center;color:var(--green);font-size:14px;font-weight:800}
.demo-title{font-size:13px;font-weight:700;color:var(--navy)}
.demo-subtitle{font-size:10px;color:var(--text-d);letter-spacing:.08em;text-transform:uppercase;font-weight:600;margin-top:2px}
.demo-bubble{padding:14px 16px;border-radius:12px;margin-bottom:12px;font-size:13.5px;line-height:1.55}
.demo-user{background:var(--green);color:#fff;margin-left:40px;border-radius:12px 12px 2px 12px;font-weight:500}
.demo-assistant{background:#F5F3EE;color:var(--text);margin-right:40px;border-radius:12px 12px 12px 2px}
.demo-assistant strong{color:var(--navy);font-weight:800}
.demo-assistant em{font-style:normal;color:var(--green);font-weight:700}
.demo-suggestion{background:#F8F5EE;border:1.5px solid var(--green-border);border-radius:11px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:4px}
.demo-suggestion-label{font-size:9px;font-weight:800;color:var(--green);letter-spacing:.14em;text-transform:uppercase;margin-bottom:4px}
.demo-suggestion-desc{font-size:12px;color:var(--navy);font-weight:600;line-height:1.4}
.demo-apply{background:var(--green);color:#fff;border:none;border-radius:7px;padding:8px 14px;font-size:12px;font-weight:800;cursor:default;flex-shrink:0}

/* ── TRUST STRIP ── */
.trust-strip{background:var(--navy);color:var(--cream);padding:36px 32px}
.trust-inner{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:48px;align-items:center}
.trust-stat{text-align:center}
.trust-stat-num{font-family:var(--font-display);font-size:36px;font-weight:800;color:var(--green-l);letter-spacing:-.03em;line-height:1}
.trust-stat-lbl{font-size:11px;color:rgba(245,240,225,.6);text-transform:uppercase;letter-spacing:.14em;margin-top:8px;font-weight:600}

/* ── TWO PRODUCTS ── */
.products{background:var(--cream);padding:112px 32px}
.products-header{text-align:center;max-width:720px;margin:0 auto 64px}
.products-grid{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:24px}
.product-card{background:#fff;border:1px solid var(--border);border-radius:20px;padding:40px;display:flex;flex-direction:column;gap:20px;transition:border-color .25s var(--ease),transform .25s var(--ease)}
.product-card:hover{transform:translateY(-3px);border-color:var(--green-border);box-shadow:0 24px 60px rgba(15,17,21,.08)}
.product-tag{display:inline-flex;align-items:center;gap:8px;font-size:10px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--green);background:var(--green-bg);border:1px solid var(--green-border);padding:6px 12px;border-radius:99px;width:fit-content}
.product-demo{background:#F9F5EB;border:1px solid var(--border);border-radius:12px;padding:18px;font-family:var(--font-mono);font-size:12px;line-height:1.7;color:var(--text-m)}
.product-demo-user{color:var(--green);font-weight:700;margin-bottom:8px}
.product-demo-ai{color:var(--navy);font-weight:400}
.product-feats{display:flex;flex-direction:column;gap:8px;font-size:13.5px;color:var(--text-m);margin-top:4px}
.product-feats div{display:flex;align-items:flex-start;gap:10px;line-height:1.45}
.product-feats div::before{content:"→";color:var(--green);font-weight:800;flex-shrink:0}

/* ── ASSET CLASSES ── */
.assets{background:var(--navy);color:var(--cream);padding:112px 32px}
.assets-header{text-align:center;max-width:780px;margin:0 auto 64px}
.assets-header .h2{color:var(--cream)}
.assets-header .lede{color:rgba(245,240,225,.7)}
.assets-grid{max-width:1240px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.asset-card{background:rgba(255,255,255,.03);border:1px solid var(--border-dark-m);border-radius:14px;padding:24px;transition:all .25s var(--ease)}
.asset-card:hover{background:rgba(82,196,152,.06);border-color:rgba(82,196,152,.35);transform:translateY(-3px)}
.asset-card.wide{grid-column:span 4;background:linear-gradient(135deg,rgba(82,196,152,.12) 0%,rgba(82,196,152,.04) 100%);border-color:rgba(82,196,152,.35)}
.asset-icon{width:28px;height:28px;color:var(--green-l);margin-bottom:14px}
.asset-name{font-size:16px;font-weight:800;color:var(--cream);letter-spacing:-.01em;margin-bottom:4px}
.asset-desc{font-size:12.5px;color:rgba(245,240,225,.6);line-height:1.5}

/* ── DIFFERENTIATORS ── */
.diff{padding:112px 32px;background:var(--cream)}
.diff-header{text-align:center;max-width:760px;margin:0 auto 72px}
.diff-grid{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:32px}
.diff-card{padding:0}
.diff-icon{width:48px;height:48px;border-radius:13px;background:var(--green-bg);border:1px solid var(--green-border);color:var(--green);display:flex;align-items:center;justify-content:center;margin-bottom:22px}
.diff-card .h3{margin-bottom:10px}
.diff-card p{color:var(--text-m);font-size:14.5px;line-height:1.65}

/* ── USE CASES (personas) ── */
.personas{background:var(--cream-d);padding:112px 32px}
.personas-header{text-align:center;max-width:720px;margin:0 auto 64px}
.personas-grid{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
.persona{background:#fff;border:1px solid var(--border);border-radius:16px;padding:28px;display:flex;flex-direction:column;gap:14px}
.persona-head{display:flex;align-items:center;gap:12px;padding-bottom:14px;border-bottom:1px solid var(--border)}
.persona-icon{width:40px;height:40px;border-radius:11px;background:var(--green-bg);border:1px solid var(--green-border);color:var(--green);display:flex;align-items:center;justify-content:center;font-size:18px}
.persona-title{font-size:17px;font-weight:800;color:var(--navy);letter-spacing:-.015em}
.persona-subtitle{font-size:11px;color:var(--text-d);letter-spacing:.08em;text-transform:uppercase;font-weight:700;margin-top:3px}
.persona ul{list-style:none;display:flex;flex-direction:column;gap:8px;font-size:13.5px;color:var(--text-m);line-height:1.55}
.persona ul li{padding-left:22px;position:relative}
.persona ul li::before{content:"✓";position:absolute;left:0;top:0;color:var(--green);font-weight:800}

/* ── FLOW ── */
.flow{padding:112px 32px;background:var(--cream)}
.flow-header{text-align:center;max-width:720px;margin:0 auto 72px}
.flow-steps{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:32px;position:relative}
.flow-step{background:#fff;border:1px solid var(--border);border-radius:18px;padding:30px;position:relative}
.flow-num{position:absolute;top:-18px;left:28px;background:var(--navy);color:var(--cream);width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:13px;font-weight:800}
.flow-verb{font-family:var(--font-display);font-size:14px;font-weight:800;color:var(--green);letter-spacing:.18em;text-transform:uppercase;margin:14px 0 10px}
.flow-what{font-family:var(--font-display);font-size:22px;font-weight:800;color:var(--navy);letter-spacing:-.02em;margin-bottom:12px}
.flow-how{font-size:14px;color:var(--text-m);line-height:1.65}

/* ── ARTIFACTS (PDF showcase) ── */
.artifacts{background:var(--navy);color:var(--cream);padding:112px 32px;overflow:hidden}
.artifacts-inner{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center}
.artifacts-copy .h2{color:var(--cream);margin-bottom:18px}
.artifacts-copy .lede{color:rgba(245,240,225,.72);margin-bottom:26px}
.artifacts-list{display:flex;flex-direction:column;gap:14px;list-style:none}
.artifacts-list li{display:flex;align-items:flex-start;gap:14px;color:rgba(245,240,225,.85);font-size:14px;line-height:1.55}
.artifacts-list li strong{color:#fff;font-weight:700;margin-right:6px}
.artifacts-list li::before{content:"◆";color:var(--green-l);font-size:13px;flex-shrink:0;margin-top:3px}
.artifacts-visual{position:relative;min-height:440px;display:flex;align-items:center;justify-content:center}
.pdf-mock{position:absolute;background:var(--cream);color:var(--navy);border-radius:10px;padding:22px;width:260px;aspect-ratio:1/1.41;box-shadow:0 30px 80px rgba(0,0,0,.4),inset 0 0 0 1px rgba(15,17,21,.08);display:flex;flex-direction:column;gap:10px;font-size:9px;transition:transform .3s var(--ease)}
.pdf-mock-1{transform:rotate(-6deg) translate(-55px,-10px);z-index:2}
.pdf-mock-1:hover{transform:rotate(-6deg) translate(-55px,-14px)}
.pdf-mock-2{transform:rotate(4deg) translate(55px,20px);z-index:3;background:var(--navy);color:var(--cream)}
.pdf-mock-2:hover{transform:rotate(4deg) translate(55px,16px)}
.pdf-mock-logo{width:18px;height:18px;border-radius:4px;background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800}
.pdf-mock-h{font-size:18px;font-weight:800;margin:auto 0}
.pdf-mock-m{font-size:8px;color:var(--text-d);letter-spacing:.1em;font-weight:600;text-transform:uppercase}
.pdf-mock-2 .pdf-mock-m{color:rgba(255,255,255,.55)}
.pdf-mock-range{font-size:7.5px;color:var(--text-d)}
.pdf-mock-2 .pdf-mock-range{color:rgba(255,255,255,.6)}

/* ── PRICING ── */
.pricing{padding:112px 32px;background:var(--cream)}
.pricing-header{text-align:center;max-width:720px;margin:0 auto 64px}
.pricing-grid{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.price-card{background:#fff;border:1px solid var(--border);border-radius:18px;padding:32px;display:flex;flex-direction:column;gap:18px;transition:border-color .2s}
.price-card.featured{border:2px solid var(--green);transform:scale(1.03);box-shadow:0 20px 50px rgba(46,158,114,.14)}
.price-tier{font-size:13px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--green)}
.price-amount{font-family:var(--font-display);font-size:44px;font-weight:800;letter-spacing:-.03em;color:var(--navy);line-height:1}
.price-amount small{font-size:14px;font-weight:500;color:var(--text-d)}
.price-feats{list-style:none;display:flex;flex-direction:column;gap:11px;font-size:14px;color:var(--text-m);margin:4px 0}
.price-feats li{display:flex;align-items:flex-start;gap:10px;line-height:1.5}
.price-feats li::before{content:"✓";color:var(--green);font-weight:800;flex-shrink:0}

/* ── FAQ ── */
.faq{padding:112px 32px;background:var(--cream-d)}
.faq-header{text-align:center;max-width:720px;margin:0 auto 56px}
.faq-list{max-width:880px;margin:0 auto;display:flex;flex-direction:column;gap:10px}
.faq-item{background:#fff;border:1px solid var(--border);border-radius:12px;overflow:hidden;transition:border-color .2s}
.faq-item[open]{border-color:var(--green-border)}
.faq-q{list-style:none;cursor:pointer;padding:20px 24px;font-size:16px;font-weight:700;color:var(--navy);display:flex;justify-content:space-between;align-items:center;gap:20px;letter-spacing:-.005em}
.faq-q::marker,.faq-q::-webkit-details-marker{display:none}
.faq-q-icon{width:22px;height:22px;border-radius:50%;background:var(--green-bg);border:1px solid var(--green-border);color:var(--green);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;transition:transform .25s var(--ease);flex-shrink:0}
.faq-item[open] .faq-q-icon{transform:rotate(45deg)}
.faq-a{padding:0 24px 22px;font-size:14.5px;color:var(--text-m);line-height:1.7}

/* ── FINAL CTA ── */
.final-cta{background:linear-gradient(135deg,var(--green) 0%,#1F8B5F 100%);color:#fff;padding:96px 32px;text-align:center}
.final-cta .h2{color:#fff;margin-bottom:16px}
.final-cta p{color:rgba(255,255,255,.9);font-size:17px;margin-bottom:32px;max-width:620px;margin-left:auto;margin-right:auto}
.final-cta .btn-dark{background:var(--navy);border-color:var(--navy)}
.final-cta .btn-dark:hover{background:#000}
.final-cta .btn-ghost{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.35);color:#fff}
.final-cta .btn-ghost:hover{background:rgba(255,255,255,.18)}

/* ── FOOTER ── */
.footer{background:var(--navy);color:var(--cream);padding:64px 32px 36px}
.footer-grid{max-width:1240px;margin:0 auto;display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:48px;margin-bottom:48px}
.footer-brand{display:flex;flex-direction:column;gap:14px}
.footer-logo{font-family:var(--font-display);font-size:22px;font-weight:800;color:var(--cream);letter-spacing:-.02em}
.footer-tagline{font-size:13px;color:rgba(245,240,225,.55);max-width:300px;line-height:1.6}
.footer-col-title{font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:rgba(245,240,225,.4);margin-bottom:16px}
.footer-col a{display:block;font-size:13.5px;color:rgba(245,240,225,.75);padding:5px 0;transition:color .15s;cursor:pointer}
.footer-col a:hover{color:var(--green-l)}
.footer-bottom{max-width:1240px;margin:0 auto;padding-top:28px;border-top:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;align-items:center;font-size:12px;color:rgba(245,240,225,.4);flex-wrap:wrap;gap:12px}

/* ── RESPONSIVE ── */
@media(max-width:1080px){
  .hero-grid{grid-template-columns:1fr;gap:48px}
  .assets-grid{grid-template-columns:repeat(3,1fr)}
  .asset-card.wide{grid-column:span 3}
  .artifacts-inner{grid-template-columns:1fr;gap:48px}
}
@media(max-width:900px){
  .section,.hero,.products,.assets,.diff,.personas,.flow,.artifacts,.pricing,.faq{padding:72px 24px}
  .final-cta{padding:72px 24px}
  .h1{font-size:48px}
  .h2{font-size:34px}
  .lede{font-size:17px}
  .trust-inner{grid-template-columns:repeat(2,1fr);gap:32px}
  .products-grid,.diff-grid,.personas-grid,.flow-steps,.pricing-grid{grid-template-columns:1fr}
  .assets-grid{grid-template-columns:repeat(2,1fr)}
  .asset-card.wide{grid-column:span 2}
  .nav-links{display:none}
  .footer-grid{grid-template-columns:1fr 1fr;gap:32px}
  .price-card.featured{transform:none}
}
@media(max-width:520px){
  .assets-grid{grid-template-columns:1fr}
  .asset-card.wide{grid-column:span 1}
  .footer-grid{grid-template-columns:1fr}
  .footer-bottom{flex-direction:column;gap:10px;text-align:center}
  .hero-cta{flex-direction:column;align-items:stretch}
  .hero-cta .btn{justify-content:center}
  .h1{font-size:38px}
  .h2{font-size:28px}
}
`;

// Line-SVG persona icons — matches the asset/Copilot icon style (1.5px stroke, currentColor)
function PersonaIcon({
  type,
  size = 20,
}: {
  type: "Lender" | "Developer" | "Advisor" | "Analyst";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (type) {
    case "Lender": // Classical bank façade — pediment + columns
      return (
        <svg {...common}>
          <polyline points="3 9 12 3 21 9" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="5" y1="11" x2="5" y2="19" />
          <line x1="9" y1="11" x2="9" y2="19" />
          <line x1="15" y1="11" x2="15" y2="19" />
          <line x1="19" y1="11" x2="19" y2="19" />
          <line x1="3" y1="21" x2="21" y2="21" />
        </svg>
      );
    case "Developer": // Blueprint / architectural compass
      return (
        <svg {...common}>
          <path d="M12 2v4" />
          <path d="M12 18v4" />
          <path d="M4.93 4.93l2.83 2.83" />
          <path d="M16.24 16.24l2.83 2.83" />
          <path d="M2 12h4" />
          <path d="M18 12h4" />
          <path d="M4.93 19.07l2.83-2.83" />
          <path d="M16.24 7.76l2.83-2.83" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
    case "Advisor": // Two figures — handshake / client work
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "Analyst": // Line chart with trend arrow
      return (
        <svg {...common}>
          <path d="M3 3v18h18" />
          <polyline points="7 14 11 10 15 13 21 7" />
          <polyline points="17 7 21 7 21 11" />
        </svg>
      );
    default:
      return null;
  }
}

// Line-SVG asset icons (same style as the Copilot)
function AssetIcon({ type, size = 28 }: { type: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (type) {
    case "BTR":
      return (
        <svg {...common}>
          <rect x="4" y="2" width="16" height="20" rx="1" />
          <line x1="8" y1="6" x2="8.01" y2="6" />
          <line x1="12" y1="6" x2="12.01" y2="6" />
          <line x1="16" y1="6" x2="16.01" y2="6" />
          <line x1="8" y1="10" x2="8.01" y2="10" />
          <line x1="12" y1="10" x2="12.01" y2="10" />
          <line x1="16" y1="10" x2="16.01" y2="10" />
          <line x1="8" y1="14" x2="8.01" y2="14" />
          <line x1="12" y1="14" x2="12.01" y2="14" />
          <line x1="16" y1="14" x2="16.01" y2="14" />
          <rect x="10" y="18" width="4" height="4" />
        </svg>
      );
    case "BTS":
      return (
        <svg {...common}>
          <path d="M3 11l9-8 9 8" />
          <path d="M5 9v12h14V9" />
          <rect x="10" y="14" width="4" height="7" />
        </svg>
      );
    case "Hotel":
      return (
        <svg {...common}>
          <path d="M3 21V9l9-6 9 6v12" />
          <path d="M3 21h18" />
          <line x1="8" y1="12" x2="8.01" y2="12" />
          <line x1="12" y1="12" x2="12.01" y2="12" />
          <line x1="16" y1="12" x2="16.01" y2="12" />
          <line x1="8" y1="16" x2="8.01" y2="16" />
          <line x1="16" y1="16" x2="16.01" y2="16" />
          <path d="M10 21v-4h4v4" />
        </svg>
      );
    case "Flip":
      return (
        <svg {...common}>
          <path d="M3 12a9 9 0 0114.85-6.85L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 01-14.85 6.85L3 16" />
          <path d="M3 21v-5h5" />
        </svg>
      );
    case "Commercial":
      return (
        <svg {...common}>
          <rect x="5" y="3" width="14" height="18" rx=".5" />
          <path d="M5 8h14" />
          <path d="M5 13h14" />
          <path d="M5 18h14" />
          <rect x="10" y="19" width="4" height="2" />
        </svg>
      );
    case "MixedUse":
      return (
        <svg {...common}>
          <path d="M2 21V11l5-3 5 3" />
          <path d="M12 21V7l5-3 5 3v14" />
          <path d="M2 21h20" />
        </svg>
      );
    case "Industrial":
      return (
        <svg {...common}>
          <path d="M3 21V9l6 4V9l6 4V9l6 4v8" />
          <path d="M3 21h18" />
          <path d="M7 17h2M12 17h2M17 17h2" />
        </svg>
      );
    case "Valuation":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
          <line x1="11" y1="8" x2="11" y2="14" />
        </svg>
      );
    default:
      return null;
  }
}

export default function LandingClient() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/dashboard");
        return;
      }
      setCheckingAuth(false);
    });
  }, [router]);

  if (checkingAuth) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F5F0E1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            border: "2px solid rgba(46,158,114,.15)",
            borderTopColor: "#2E9E72",
            borderRadius: "50%",
            animation: "spin .7s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div>
      <style>{CSS}</style>

      {/* ─── NAV ─── */}
      <nav className="nav" aria-label="Main">
        <div className="nav-inner">
          <a href="#top" className="nav-logo" aria-label="Valora home">
            <span className="nav-logo-mark">◆</span> Valora
          </a>
          <div className="nav-links">
            <a onClick={() => router.push("/for-funds")}>For funds</a>
            <a onClick={() => router.push("/for-developers")}>For developers</a>
            <a
              onClick={() =>
                document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Underwriting
            </a>
            <a
              onClick={() =>
                document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Valuation
            </a>
            <a
              onClick={() =>
                document.getElementById("assets")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Assets
            </a>
            <a
              onClick={() =>
                document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Pricing
            </a>
            <a
              onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })}
            >
              FAQ
            </a>
          </div>
          <div className="nav-cta">
            <button className="btn btn-ghost btn-sm" onClick={() => router.push("/auth")}>
              Sign in
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => router.push("/auth")}>
              Start free
            </button>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <header className="hero" id="top">
        <div className="hero-grid">
          <div className="hero-copy fade-up">
            <div className="eyebrow">
              <span className="eyebrow-mark">◆</span> Institutional Real Estate AI
            </div>
            <h1 className="h1">
              Know if a deal works.
              <br />
              <em>In 60 seconds.</em>
            </h1>
            <p className="lede">
              From one sentence to full underwriting, valuation, and IC-ready output &mdash; for any
              institutional asset, anywhere in the world.
            </p>
            <div className="hero-cta">
              <button className="btn btn-primary btn-lg" onClick={() => router.push("/auth")}>
                Start free &rarr;
              </button>
              <button
                className="btn btn-ghost btn-lg"
                onClick={() => window.open(CALENDLY, "_blank")}
              >
                Book a demo
              </button>
            </div>
            <div className="hero-trust">
              <span className="hero-trust-dot" />
              Used by PE funds, family offices, hotel operators &amp; deal-desk analysts
            </div>
          </div>
          <aside
            className="demo-card fade-up"
            style={{ animationDelay: ".15s" }}
            aria-label="Copilot demo"
          >
            <div className="demo-header">
              <div className="demo-logo">◆</div>
              <div>
                <div className="demo-title">Valora Copilot</div>
                <div className="demo-subtitle">Dashboard &middot; session chat</div>
              </div>
            </div>
            <div className="demo-bubble demo-user">
              Hotel in Mayfair, 80 keys, 4-star, &pound;45m, 60% LTC
            </div>
            <div className="demo-bubble demo-assistant">
              Modelled as a <strong>4-star Mayfair hotel</strong>. ADR <em>&pound;240</em>,
              occupancy <em>74%</em>, 6% exit cap, 5-yr hold. IRR levered <strong>24.8%</strong>,
              DSCR <strong>1.72&times;</strong>.
            </div>
            <div className="demo-suggestion">
              <div>
                <div className="demo-suggestion-label">Suggested create</div>
                <div className="demo-suggestion-desc">
                  Hotel &middot; 80 keys &middot; &pound;45m &middot; 60% LTC &middot; 5-yr hold
                </div>
              </div>
              <button className="demo-apply">Apply</button>
            </div>
          </aside>
        </div>
      </header>

      {/* ─── TRUST STRIP ─── */}
      <section className="trust-strip" aria-label="Usage stats">
        <div className="trust-inner">
          <div className="trust-stat">
            <div className="trust-stat-num">&pound;1.2bn</div>
            <div className="trust-stat-lbl">GDV Modelled</div>
          </div>
          <div className="trust-stat">
            <div className="trust-stat-num">60s</div>
            <div className="trust-stat-lbl">Idea &rarr; IC-ready</div>
          </div>
          <div className="trust-stat">
            <div className="trust-stat-num">7</div>
            <div className="trust-stat-lbl">Asset classes</div>
          </div>
          <div className="trust-stat">
            <div className="trust-stat-num">Global</div>
            <div className="trust-stat-lbl">
              UK &middot; US &middot; UAE &middot; SG &middot; EU
            </div>
          </div>
        </div>
      </section>

      {/* ─── TWO PRODUCTS ─── */}
      <section className="products" id="products" aria-labelledby="products-h">
        <div className="products-header fade-up">
          <div className="eyebrow">
            <span className="eyebrow-mark">◆</span> Two sides of Valora
          </div>
          <h2 className="h2" id="products-h">
            Underwrite a deal. Value a property.
            <br />
            Same Copilot.
          </h2>
          <p className="lede" style={{ marginTop: 18 }}>
            One platform. Two AI-driven workflows. Both produce IC-grade output the same day you
            typed the one-line prompt.
          </p>
        </div>
        <div className="products-grid">
          <article className="product-card fade-up">
            <div className="product-tag">◆ Underwriting</div>
            <h3 className="h3">Describe the deal. Get the model.</h3>
            <p className="lede" style={{ fontSize: 16 }}>
              Full development appraisal or acquisition underwriting. Fields pre-filled with
              institutional defaults. IRR, DSCR, cashflows, sensitivity &mdash; all live.
            </p>
            <div className="product-demo">
              <div className="product-demo-user">
                &gt; BTR in Manchester, 180 units, &pound;58m build, 5% exit
              </div>
              <div className="product-demo-ai">
                Modelled: 180 units &middot; &pound;58m build &middot; &pound;1,650 avg rent
                &middot; 5.00% exit yield &middot; 30-yr hold. Applied.
              </div>
            </div>
            <div className="product-feats">
              <div>
                Seven asset classes (BTR, BTS, Hotel, Flip, Commercial, Mixed Use, Industrial)
              </div>
              <div>USALI cascade for hotels, year-by-year NOI for commercial</div>
              <div>IC-ready PDF brochure in one click</div>
              <div>Live investor share links</div>
            </div>
          </article>
          <article className="product-card fade-up" style={{ animationDelay: ".1s" }}>
            <div className="product-tag">◆ Valuation</div>
            <h3 className="h3">Describe the property. Get the price.</h3>
            <p className="lede" style={{ fontSize: 16 }}>
              Comparative market valuation for any property, anywhere. Price range, real
              comparables, valuation drivers, risk assessment.
            </p>
            <div className="product-demo">
              <div className="product-demo-user">
                &gt; 3-bed terrace in Fulham, 1,200 sqft, refurbished
              </div>
              <div className="product-demo-ai">
                Central &pound;1.10m (range &pound;1.02m&ndash;&pound;1.18m). 4 comps within 0.3 mi.
                Drivers: Zone 1, refurb, layout. Confidence: high.
              </div>
            </div>
            <div className="product-feats">
              <div>Global coverage &mdash; UK, US, UAE, Singapore, EU, APAC</div>
              <div>4&ndash;6 real comparables with addresses, prices, dates, adjustments</div>
              <div>IC-ready valuation PDF report &mdash; one click</div>
              <div>Shareable client-facing link (live, not static)</div>
            </div>
          </article>
        </div>
      </section>

      {/* ─── ASSET CLASSES ─── */}
      <section className="assets" id="assets" aria-labelledby="assets-h">
        <div className="assets-header fade-up">
          <div className="eyebrow" style={{ color: "var(--green-l)" }}>
            <span className="eyebrow-mark">◆</span> Asset coverage
          </div>
          <h2 className="h2" id="assets-h">
            Seven asset classes. One calc engine.
          </h2>
          <p className="lede" style={{ marginTop: 16 }}>
            Every asset modelled with its own institutional conventions &mdash; USALI cascades for
            hotels, zone-by-zone cashflows for mixed use, refurb-to-sale for flips. Plus
            cross-border valuation for any property type.
          </p>
        </div>
        <div className="assets-grid">
          {[
            {
              id: "BTR",
              name: "Build to Rent",
              desc: "Stabilised residential income. Unit mix, rental growth, exit yield.",
            },
            {
              id: "BTS",
              name: "Build to Sell",
              desc: "Residential for open-market sale. Absorption, pricing, VAT.",
            },
            {
              id: "Hotel",
              name: "Hotel",
              desc: "Simple + USALI Advanced. ADR, occupancy, GOP, EBITDA.",
            },
            {
              id: "Flip",
              name: "Residential Flip",
              desc: "Buy, refurb, sell or hold. SDLT, bridging, ROI on cost.",
            },
            {
              id: "Commercial",
              name: "Commercial",
              desc: "Office, retail, industrial. Year-by-year NOI + rent reviews.",
            },
            {
              id: "MixedUse",
              name: "Mixed Use",
              desc: "Multi-zone: resi + commercial blended. Zone-level P&L.",
            },
            {
              id: "Industrial",
              name: "Industrial",
              desc: "Logistics, light industrial. Yield, occupancy, covenant.",
            },
          ].map((a) => (
            <div key={a.id} className="asset-card">
              <div className="asset-icon">
                <AssetIcon type={a.id} />
              </div>
              <div className="asset-name">{a.name}</div>
              <div className="asset-desc">{a.desc}</div>
            </div>
          ))}
          <div className="asset-card wide">
            <div className="asset-icon">
              <AssetIcon type="Valuation" size={32} />
            </div>
            <div className="asset-name">+ Valuation &mdash; any property, anywhere</div>
            <div className="asset-desc">
              Comparative market valuations across residential, commercial, and hospitality assets
              in the UK, US, UAE, Singapore, Europe, and APAC. One sentence in, institution-grade
              report out.
            </div>
          </div>
        </div>
      </section>

      {/* ─── DIFFERENTIATORS ─── */}
      <section className="diff" aria-labelledby="diff-h">
        <div className="diff-header fade-up">
          <div className="eyebrow">
            <span className="eyebrow-mark">◆</span> How Valora&rsquo;s different
          </div>
          <h2 className="h2" id="diff-h">
            Not a chatbot. A real calc engine with AI on top.
          </h2>
          <p className="lede" style={{ marginTop: 14 }}>
            Valora is built on a peer-reviewed calc engine with jurisdiction-aware defaults,
            institutional methodology, and IC-grade output. The AI doesn&rsquo;t hallucinate numbers
            &mdash; it runs the real math.
          </p>
        </div>
        <div className="diff-grid">
          <article className="diff-card fade-up">
            <div className="diff-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 3h20v18H2z" />
                <path d="M2 9h20" />
                <path d="M9 3v18" />
              </svg>
            </div>
            <h3 className="h3">Institutional defaults</h3>
            <p>
              Jurisdiction-aware profiles &mdash; SDLT, VAT, SONIA, SOFR, EURIBOR, USALI.
              Asset-specific benchmarks (hotel ADR by star tier, BTR rental growth, commercial exit
              cap). Every default comes from institutional comp sets, not ChatGPT guesswork.
            </p>
          </article>
          <article className="diff-card fade-up" style={{ animationDelay: ".1s" }}>
            <div className="diff-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3v18h18" />
                <path d="M7 14l4-4 4 4 5-5" />
              </svg>
            </div>
            <h3 className="h3">Live sensitivity + Monte Carlo</h3>
            <p>
              Change any field and watch IRR, DSCR, Debt Yield, PoC recompute instantly. Stress-test
              vacancy, rates, exit cap. Run Monte Carlo with P10/P50/P90. Ask &ldquo;what if exit
              cap is 5.5%?&rdquo; in chat and Apply the scenario in one click.
            </p>
          </article>
          <article className="diff-card fade-up" style={{ animationDelay: ".2s" }}>
            <div className="diff-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6" />
                <line x1="9" y1="15" x2="15" y2="15" />
                <line x1="9" y1="11" x2="15" y2="11" />
              </svg>
            </div>
            <h3 className="h3">IC-ready output</h3>
            <p>
              One-click PDF brochures and valuation reports your investment committee would actually
              read. Executive summary, deal strengths, risks, cashflows, sensitivity, comparables.
              Plus live share links &mdash; recipients see the real model, not a static file.
            </p>
          </article>
        </div>
      </section>

      {/* ─── USE CASES ─── */}
      <section className="personas" aria-labelledby="personas-h">
        <div className="personas-header fade-up">
          <div className="eyebrow">
            <span className="eyebrow-mark">◆</span> Who uses Valora
          </div>
          <h2 className="h2" id="personas-h">
            Built for every seat at the deal table.
          </h2>
          <p className="lede" style={{ marginTop: 14 }}>
            Institutional output without institutional headcount &mdash; whether you&rsquo;re
            underwriting debt, developing assets, advising clients, or running the analyst desk.
          </p>
        </div>
        <div className="personas-grid">
          <article className="persona fade-up">
            <div className="persona-head">
              <div className="persona-icon">
                <PersonaIcon type="Lender" />
              </div>
              <div>
                <div className="persona-title">For lenders</div>
                <div className="persona-subtitle">Banks · debt funds · specialist lenders</div>
              </div>
            </div>
            <ul>
              <li>DSCR, LTV, Debt Yield calculated across every scenario in seconds</li>
              <li>Stress-test vacancy, rates, exit cap before committee</li>
              <li>Covenant-ready documentation generated automatically</li>
              <li>See risk before you underwrite, not after</li>
            </ul>
          </article>
          <article className="persona fade-up" style={{ animationDelay: ".08s" }}>
            <div className="persona-head">
              <div className="persona-icon">
                <PersonaIcon type="Developer" />
              </div>
              <div>
                <div className="persona-title">For developers</div>
                <div className="persona-subtitle">Sponsors · operators · owner-occupiers</div>
              </div>
            </div>
            <ul>
              <li>Screen 10 deals in the time it takes to build 1 in Excel</li>
              <li>Type deal &rarr; full feasibility model in 30 seconds</li>
              <li>Seven asset classes covered institutionally</li>
              <li>Profit on cost, IRR, cashflows &mdash; before exclusivity</li>
            </ul>
          </article>
          <article className="persona fade-up" style={{ animationDelay: ".16s" }}>
            <div className="persona-head">
              <div className="persona-icon">
                <PersonaIcon type="Advisor" />
              </div>
              <div>
                <div className="persona-title">For advisors &amp; brokers</div>
                <div className="persona-subtitle">Agents · consultants · BD teams</div>
              </div>
            </div>
            <ul>
              <li>Value any asset in under a minute</li>
              <li>Generate investor-ready pitch documents in one click</li>
              <li>Share live models with clients (real numbers, not PDFs)</li>
              <li>White-label PDF output for your firm</li>
            </ul>
          </article>
          <article className="persona fade-up" style={{ animationDelay: ".24s" }}>
            <div className="persona-head">
              <div className="persona-icon">
                <PersonaIcon type="Analyst" />
              </div>
              <div>
                <div className="persona-title">For PE + family office analysts</div>
                <div className="persona-subtitle">Deal-desk · underwriting · IC prep</div>
              </div>
            </div>
            <ul>
              <li>Stop rebuilding the same Excel model for every deal</li>
              <li>Ask &ldquo;why is my IRR low?&rdquo; &mdash; get concrete levers</li>
              <li>Monte Carlo, stress tests, sensitivity &mdash; in conversation</li>
              <li>Every number defensible in an IC meeting</li>
            </ul>
          </article>
        </div>
      </section>

      {/* ─── FLOW ─── */}
      <section className="flow" aria-labelledby="flow-h">
        <div className="flow-header fade-up">
          <div className="eyebrow">
            <span className="eyebrow-mark">◆</span> From idea to IC
          </div>
          <h2 className="h2" id="flow-h">
            Three steps. Under a minute.
          </h2>
        </div>
        <div className="flow-steps">
          <article className="flow-step fade-up">
            <div className="flow-num">01</div>
            <div className="flow-verb">Describe</div>
            <div className="flow-what">One sentence.</div>
            <div className="flow-how">
              Type your deal or property as you&rsquo;d say it to an analyst. Paste a Rightmove,
              Zillow, Bayut, or Christie &amp; Co link and Valora extracts the rest.
            </div>
          </article>
          <article className="flow-step fade-up" style={{ animationDelay: ".1s" }}>
            <div className="flow-num">02</div>
            <div className="flow-verb">Build</div>
            <div className="flow-what">Full model.</div>
            <div className="flow-how">
              Copilot pre-fills every field with institutional defaults. Metrics compute live
              &mdash; GDV, profit, IRR, DSCR, payback. Edit anything and watch it recompute.
            </div>
          </article>
          <article className="flow-step fade-up" style={{ animationDelay: ".2s" }}>
            <div className="flow-num">03</div>
            <div className="flow-verb">Present</div>
            <div className="flow-what">IC brochure.</div>
            <div className="flow-how">
              One-click PDF: cover, executive summary, sensitivity matrix, cashflows, comps. Or
              share a live link &mdash; recipients see the real model.
            </div>
          </article>
        </div>
      </section>

      {/* ─── ARTIFACTS (PDF showcase) ─── */}
      <section className="artifacts" aria-labelledby="artifacts-h">
        <div className="artifacts-inner">
          <div className="artifacts-copy fade-up">
            <div className="eyebrow" style={{ color: "var(--green-l)" }}>
              <span className="eyebrow-mark">◆</span> What you ship
            </div>
            <h2 className="h2" id="artifacts-h">
              IC-ready, same day.
            </h2>
            <p className="lede">
              Every Valora deal and valuation comes with a polished PDF report and a shareable live
              link. Your committee gets something investor-grade, not a spreadsheet screenshot.
            </p>
            <ul className="artifacts-list">
              <li>
                <span>
                  <strong>IC brochures</strong> &mdash; executive summary, deal strengths, risk
                  assessment, cashflow waterfall, sensitivity tables
                </span>
              </li>
              <li>
                <span>
                  <strong>Valuation reports</strong> &mdash; price range, comparables, drivers,
                  risks, methodology disclosure
                </span>
              </li>
              <li>
                <span>
                  <strong>Live share links</strong> &mdash; clients open the real model with current
                  numbers, not a PDF
                </span>
              </li>
              <li>
                <span>
                  <strong>White-label</strong> available on Enterprise &mdash; your firm branding on
                  every export
                </span>
              </li>
            </ul>
          </div>
          <div className="artifacts-visual fade-up" style={{ animationDelay: ".1s" }}>
            <div className="pdf-mock pdf-mock-1">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="pdf-mock-logo">V</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800 }}>Valora</div>
                  <div className="pdf-mock-m">APPRAISAL REPORT</div>
                </div>
              </div>
              <div style={{ marginTop: 40 }}>
                <div
                  style={{
                    fontSize: 8,
                    color: "var(--green)",
                    fontWeight: 800,
                    letterSpacing: ".14em",
                    marginBottom: 4,
                  }}
                >
                  UK &middot; HOTEL &middot; ADVANCED
                </div>
                <div className="pdf-mock-h">&pound;82.4m</div>
                <div className="pdf-mock-range">
                  GDV &middot; IRR 24.8% &middot; DSCR 1.72&times;
                </div>
              </div>
              <div style={{ marginTop: "auto" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--navy)" }}>
                  Mayfair Hotel
                </div>
                <div style={{ fontSize: 8, color: "var(--text-d)", marginTop: 2 }}>
                  80 keys &middot; 4-star &middot; Mayfair, London
                </div>
              </div>
            </div>
            <div className="pdf-mock pdf-mock-2">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="pdf-mock-logo">V</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800 }}>Valora</div>
                  <div className="pdf-mock-m">VALUATION REPORT</div>
                </div>
              </div>
              <div style={{ marginTop: 40 }}>
                <div
                  style={{
                    fontSize: 8,
                    color: "var(--green-hot)",
                    fontWeight: 800,
                    letterSpacing: ".14em",
                    marginBottom: 4,
                  }}
                >
                  UK &middot; COMPARATIVE MARKET
                </div>
                <div className="pdf-mock-h">&pound;1.10m</div>
                <div className="pdf-mock-range">
                  &pound;1.02m &mdash; &pound;1.18m &middot; HIGH confidence
                </div>
              </div>
              <div style={{ marginTop: "auto" }}>
                <div style={{ fontSize: 10, fontWeight: 700 }}>Fulham Road</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,.55)", marginTop: 2 }}>
                  3-bed &middot; 1,200 sqft &middot; refurbished
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="pricing" id="pricing" aria-labelledby="pricing-h">
        <div className="pricing-header fade-up">
          <div className="eyebrow">
            <span className="eyebrow-mark">◆</span> Pricing
          </div>
          <h2 className="h2" id="pricing-h">
            Start free. Upgrade when it earns its keep.
          </h2>
          <p className="lede" style={{ marginTop: 14 }}>
            14-day free trial on paid plans. Annual billing saves 20%. No credit card to start.
          </p>
        </div>
        <div className="pricing-grid">
          <article className="price-card fade-up">
            <div className="price-tier">Free</div>
            <div className="price-amount">
              $0<small> /month</small>
            </div>
            <div className="small" style={{ marginTop: -6 }}>
              Forever free
            </div>
            <ul className="price-feats">
              <li>1 full appraisal &mdash; all features unlocked</li>
              <li>3 free valuations</li>
              <li>All 7 asset models</li>
              <li>AI Market Comps + sensitivity matrix</li>
              <li>IC PDF + live share link</li>
            </ul>
            <button className="btn btn-ghost" onClick={() => router.push("/auth")}>
              Start free
            </button>
          </article>
          <article className="price-card featured fade-up" style={{ animationDelay: ".08s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="price-tier">Pro</div>
              <span
                style={{
                  background: "var(--green)",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: 999,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                }}
              >
                Most Popular
              </span>
            </div>
            <div className="price-amount">
              $119<small> /mo</small>
            </div>
            <div className="small" style={{ marginTop: -6 }}>
              Billed annually &middot; $149/mo monthly
            </div>
            <ul className="price-feats">
              <li>Unlimited appraisals &amp; valuations</li>
              <li>Full Copilot &mdash; 300 AI messages / mo</li>
              <li>Live investor share links</li>
              <li>Monte Carlo + stress tests</li>
              <li>Year-by-year NOI hold model</li>
              <li>URL import (Rightmove, Zillow, Bayut&hellip;)</li>
            </ul>
            <button className="btn btn-primary" onClick={() => router.push("/pricing")}>
              Start 14-day trial
            </button>
          </article>
          <article className="price-card fade-up" style={{ animationDelay: ".16s" }}>
            <div className="price-tier">Enterprise</div>
            <div className="price-amount">
              $319<small> /mo</small>
            </div>
            <div className="small" style={{ marginTop: -6 }}>
              Billed annually &middot; $399/mo monthly
            </div>
            <ul className="price-feats">
              <li>Everything in Pro</li>
              <li>5 team members ($75/user after)</li>
              <li>Shared firm workspace</li>
              <li>White-label PDF exports</li>
              <li>Custom jurisdictions</li>
              <li>Dedicated onboarding + SLA</li>
            </ul>
            <button className="btn btn-ghost" onClick={() => window.open(CALENDLY, "_blank")}>
              Talk to us
            </button>
          </article>
        </div>
        <div style={{ textAlign: "center", marginTop: 36, fontSize: 13, color: "var(--text-d)" }}>
          Full feature comparison on the{" "}
          <a
            onClick={() => router.push("/pricing")}
            style={{ color: "var(--green)", fontWeight: 700, cursor: "pointer" }}
          >
            pricing page
          </a>
          .
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="faq" id="faq" aria-labelledby="faq-h">
        <div className="faq-header fade-up">
          <div className="eyebrow">
            <span className="eyebrow-mark">◆</span> Frequently asked
          </div>
          <h2 className="h2" id="faq-h">
            Everything you&rsquo;d ask in a demo.
          </h2>
        </div>
        <div className="faq-list">
          {[
            {
              q: "What is Valora?",
              a: "Valora is an AI-native platform for institutional real estate. Describe a deal or property in one sentence and Valora's Copilot builds a full underwriting model or comparative market valuation — IRR, DSCR, cashflows, sensitivities, comparables, drivers, risks — and produces an IC-ready PDF in under 60 seconds.",
            },
            {
              q: "Which asset classes does Valora cover?",
              a: "Seven institutional asset classes: Build to Rent (BTR), Build to Sell (BTS), Hotel with USALI Advanced, Residential Flip, Commercial (office, retail, industrial), Mixed Use, and Industrial. Plus cross-border valuations for any property type.",
            },
            {
              q: "Which markets does Valora support?",
              a: "UK, US, UAE, Singapore, Europe (Germany, France, and more), and APAC. Valora is jurisdiction-aware — it handles SDLT, VAT, SONIA, SOFR, EURIBOR, USALI, and local conventions automatically.",
            },
            {
              q: "Is Valora a replacement for RICS Red Book valuations?",
              a: "No. Valora produces directional valuations for internal decision-support — deal screening, investor pitching, IC preparation. Formal Red Book or USPAP valuations should still be commissioned separately for regulated purposes like secured lending.",
            },
            {
              q: "How much does Valora cost?",
              a: "Free forever — 1 full appraisal and 3 free valuations unlocked with every feature. Pro is $119/mo billed annually ($149/mo monthly) with unlimited appraisals, valuations, and Copilot messages. Enterprise is $319/mo billed annually with team features and white-labelling.",
            },
            {
              q: "What outputs does Valora produce?",
              a: "Complete institutional models with IRR, DSCR, Debt Yield, Equity Multiple, MOIC, payback, and sensitivity matrices. IC-ready PDF brochures and valuation reports. Live investor share links with real models, not static files.",
            },
            {
              q: "Is Valora just ChatGPT with a prompt?",
              a: "No. Valora combines a peer-reviewed calc engine (with Simple↔Advanced reconciliation tests, USALI cascades, Monte Carlo, stress tests) with an AI Copilot on top. The AI parses your input and runs the real math — it doesn't hallucinate the numbers.",
            },
            {
              q: "Can I import a property URL from Rightmove or Zillow?",
              a: "Yes. Paste a listing URL from Rightmove, Zoopla, Zillow, Redfin, Bayut, PropertyFinder, PropertyGuru, Immobilienscout24, and similar sites. The Copilot extracts property data and pre-fills your model.",
            },
            {
              q: "Who uses Valora?",
              a: "PE funds, family offices, development teams, hotel operators, brokers, investment advisors, and solo analysts — anyone who needs institutional output without institutional headcount.",
            },
            {
              q: "Is my data private?",
              a: "Yes. Your deals are stored in your private workspace. Copilot conversations are session-only by default. Team workspaces on Enterprise keep firm data isolated with row-level security.",
            },
          ].map((item, i) => (
            <details className="faq-item" key={i}>
              <summary className="faq-q">
                <span>{item.q}</span>
                <span className="faq-q-icon">+</span>
              </summary>
              <div className="faq-a">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="final-cta" aria-label="Final call to action">
        <h2 className="h2">Stop modelling. Start underwriting.</h2>
        <p>Try Valora free. No credit card. One full appraisal and three valuations unlocked.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-dark btn-lg" onClick={() => router.push("/auth")}>
            Start free &rarr;
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => window.open(CALENDLY, "_blank")}>
            Book a demo
          </button>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">◆ Valora</div>
            <div className="footer-tagline">
              Institutional Real Estate AI &mdash; underwriting and valuation at the speed of
              thought.
            </div>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Product</div>
            <a
              onClick={() =>
                document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Underwriting
            </a>
            <a
              onClick={() =>
                document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Valuation
            </a>
            <a
              onClick={() =>
                document.getElementById("assets")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Asset classes
            </a>
            <a onClick={() => router.push("/pricing")}>Pricing</a>
            <a onClick={() => router.push("/learn")}>Methodology</a>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Company</div>
            <a
              href="https://www.linkedin.com/company/valora-platform"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <a href={CALENDLY} target="_blank" rel="noopener noreferrer">
              Book a demo
            </a>
            <a href="mailto:hello@valoraplatform.io">Contact</a>
            <a
              onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })}
            >
              FAQ
            </a>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Legal</div>
            <a onClick={() => router.push("/privacy")}>Privacy</a>
            <a onClick={() => router.push("/terms")}>Terms</a>
            <a onClick={() => router.push("/security")}>Security</a>
          </div>
        </div>
        <div className="footer-bottom">
          <div>&copy; {new Date().getFullYear()} Valora Platform Ltd. All rights reserved.</div>
          <div>Institutional Real Estate AI &middot; built for analysts</div>
        </div>
      </footer>
    </div>
  );
}
