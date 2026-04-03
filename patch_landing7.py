with open("app/page.tsx", "r") as f:
    content = f.read()

results = []

# Fix 1: Standardise all feature icons to same geometric glyphs
# The FEATURES array has icons like ⟳ ◈ ▦ ◎ ◉ ⊛ ⬡ ⬛ ◫ ⊞ ⊡ ⬙
# Replace with consistent single-weight geometric set
old_features = '''const FEATURES = [
  { icon:"⟳", label:"True Monthly Cash Flow Engine", desc:"Full month-by-month P&L from acquisition to exit. S-curve drawdown model with interest rolled monthly on actual drawn balances — no approximations.", tag:"Core" },
  { icon:"◈", label:"Residual Land Value", desc:"Real-time RLV calculation that updates as you type. Uses exact cashflow interest for maximum accuracy. Instantly shows what you can afford to pay for land.", tag:"Valuation" },
  { icon:"▦", label:"Sensitivity Matrices", desc:"45-scenario yield vs rent matrices with colour-coded RAG. Exit yield, levered profit, and profit on cost — all recalculated live using the full finance model.", tag:"Risk" },
  { icon:"◎", label:"Live Benchmark Curves", desc:"SONIA, SOFR, EURIBOR, EIBOR, SORA, AONIA, TONA, SARON, CORRA, HONIA. Finance costs calculated against the actual forward curve, not a flat estimate.", tag:"Finance" },
  { icon:"◉", label:"3-Tier Promote Waterfall", desc:"Configurable IRR hurdles with developer and investor allocations across all tiers. Visual split bar per hurdle. Fully scenario-aware.", tag:"JV" },
  { icon:"⊛", label:"DSCR / ICR & Equity Multiple", desc:"Debt service cover ratio, ICR, equity multiple (MOIC), payback period and break-even yield — the exact metrics a lender or equity partner will stress test.", tag:"Institutional" },
  { icon:"⬡", label:"AI Sense Check", desc:"Automatically benchmarks your assumptions against market data. Flags DSCR breaches, aggressive exit yields, LTC limits, and build cost issues before credit committee.", tag:"AI" },
  { icon:"⬛", label:"AI Investor Brochures", desc:"Upload photos, generate a full investment memorandum with Claude AI. Branded PDF with live share links — investors always see the latest version.", tag:"AI" },
  { icon:"◫", label:"Team Workspace", desc:"Collaborate on appraisals with your team. Shared workspace with notes, tasks, activity feed and role-based permissions — everything linked to the deal.", tag:"Team" },
  { icon:"⊞", label:"Auto SDLT Calculator", desc:"Full UK SDLT banding — residential, commercial, mixed-use and SPV share deal modes. +3% surcharge toggle. Calculated automatically from purchase price.", tag:"Tax" },
  { icon:"⊡", label:"Deal Pipeline & Tasks", desc:"Kanban pipeline boards with customisable deal stages. Tasks, notes and activity feed on every deal. Move projects from Prospect through to Completion.", tag:"PM" },
  { icon:"⬙", label:"IRR — Levered & Unlevered", desc:"True levered IRR using monthly equity cash flows with progressive loan repayment. Unlevered IRR includes the full stabilisation ramp — not a simplified endpoint model.", tag:"Returns" },
];'''

new_features = '''const FEATURES = [
  { icon:"◈", label:"True Monthly Cash Flow Engine", desc:"Full month-by-month P&L from acquisition to exit. S-curve drawdown model with interest rolled monthly on actual drawn balances — no approximations.", tag:"Core" },
  { icon:"◈", label:"Residual Land Value", desc:"Real-time RLV calculation that updates as you type. Uses exact cashflow interest for maximum accuracy. Instantly shows what you can afford to pay for land.", tag:"Valuation" },
  { icon:"◈", label:"Sensitivity Matrices", desc:"45-scenario yield vs rent matrices with colour-coded RAG. Exit yield, levered profit, and profit on cost — all recalculated live using the full finance model.", tag:"Risk" },
  { icon:"◈", label:"Live Benchmark Curves", desc:"SONIA, SOFR, EURIBOR, EIBOR, SORA, AONIA, TONA, SARON, CORRA, HONIA. Finance costs calculated against the actual forward curve, not a flat estimate.", tag:"Finance" },
  { icon:"◈", label:"3-Tier Promote Waterfall", desc:"Configurable IRR hurdles with developer and investor allocations across all tiers. Visual split bar per hurdle. Fully scenario-aware.", tag:"JV" },
  { icon:"◈", label:"DSCR / ICR & Equity Multiple", desc:"Debt service cover ratio, ICR, equity multiple (MOIC), payback period and break-even yield — the exact metrics a lender or equity partner will stress test.", tag:"Institutional" },
  { icon:"◈", label:"AI Sense Check", desc:"Automatically benchmarks your assumptions against market data. Flags DSCR breaches, aggressive exit yields, LTC limits, and build cost issues before credit committee.", tag:"AI" },
  { icon:"◈", label:"AI Investor Brochures", desc:"Upload photos, generate a full investment memorandum with Claude AI. Branded PDF with live share links — investors always see the latest version.", tag:"AI" },
  { icon:"◈", label:"Team Workspace", desc:"Collaborate on appraisals with your team. Shared workspace with notes, tasks, activity feed and role-based permissions — everything linked to the deal.", tag:"Team" },
  { icon:"◈", label:"Auto SDLT Calculator", desc:"Full UK SDLT banding — residential, commercial, mixed-use and SPV share deal modes. +3% surcharge toggle. Calculated automatically from purchase price.", tag:"Tax" },
  { icon:"◈", label:"Deal Pipeline & Tasks", desc:"Kanban pipeline boards with customisable deal stages. Tasks, notes and activity feed on every deal. Move projects from Prospect through to Completion.", tag:"PM" },
  { icon:"◈", label:"IRR — Levered & Unlevered", desc:"True levered IRR using monthly equity cash flows with progressive loan repayment. Unlevered IRR includes the full stabilisation ramp — not a simplified endpoint model.", tag:"Returns" },
];'''

if old_features in content:
    content = content.replace(old_features, new_features)
    results.append("✅ Feature icons standardised")
else:
    results.append("❌ Features array not found")

# Fix 2: Built For panel - remove individual boxes from list items
old_panel_items = '''            {p.points.map(([icon,title,sub],j)=>(
              <div key={j} style={{display:"flex",gap:16,padding:"16px 20px",borderBottom:j<p.points.length-1?"1px solid var(--border)":"none",transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background="var(--bg3)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <span style={{color:p.color,fontSize:9,marginTop:4,flexShrink:0}}>{icon}</span>
                <div>
                  <div style={{fontSize:13,fontWeight:500,color:"var(--text)",marginBottom:2}}>{title}</div>
                  <div style={{fontSize:12,color:"var(--text-d)",lineHeight:1.5}}>{sub}</div>
                </div>
              </div>
            ))}'''

new_panel_items = '''            {p.points.map(([icon,title,sub],j)=>(
              <div key={j} style={{display:"flex",gap:14,padding:"14px 0",borderBottom:j<p.points.length-1?"1px solid var(--border)":"none"}}>
                <span style={{color:p.color,fontSize:8,marginTop:5,flexShrink:0}}>◆</span>
                <div>
                  <div style={{fontSize:13,fontWeight:500,color:"var(--text)",marginBottom:3}}>{title}</div>
                  <div style={{fontSize:12,color:"var(--text-d)",lineHeight:1.5}}>{sub}</div>
                </div>
              </div>
            ))}'''

# Also fix the container - remove the bg2/border box
old_panel_container = '''          <div key={active} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:48,alignItems:"center",animation:"revealUp .4s cubic-bezier(.16,1,.3,1) forwards"}}>
          <div>
            <div style={{fontSize:11,color:p.color,textTransform:"uppercase",letterSpacing:".1em",marginBottom:14,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>{p.icon}</span>{p.label}</div>
            <h3 style={{fontFamily:"var(--font-display)",fontSize:"clamp(22px,2.5vw,34px)",fontWeight:300,lineHeight:1.15,marginBottom:18,color:"var(--text)"}}>{p.headline}</h3>
            <p style={{fontSize:14,color:"var(--text-m)",lineHeight:1.8,marginBottom:0}}>{p.desc}</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:0,background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,overflow:"hidden"}}>'''

new_panel_container = '''          <div key={active} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:64,alignItems:"start",animation:"revealUp .4s cubic-bezier(.16,1,.3,1) forwards"}}>
          <div>
            <div style={{fontSize:10,color:p.color,textTransform:"uppercase",letterSpacing:".14em",marginBottom:16,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:14}}>{p.icon}</span>{p.label}</div>
            <h3 style={{fontFamily:"var(--font-display)",fontSize:"clamp(24px,2.5vw,38px)",fontWeight:300,lineHeight:1.12,marginBottom:20,color:"var(--text)"}}>{p.headline}</h3>
            <p style={{fontSize:14,color:"var(--text-m)",lineHeight:1.85,marginBottom:0}}>{p.desc}</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",paddingTop:8}}>'''

if old_panel_items in content:
    content = content.replace(old_panel_items, new_panel_items)
    results.append("✅ Panel list items cleaned up")
else:
    results.append("❌ Panel list items not found")

if old_panel_container in content:
    content = content.replace(old_panel_container, new_panel_container)
    results.append("✅ Panel container cleaned up")
else:
    results.append("❌ Panel container not found")

with open("app/page.tsx", "w") as f:
    f.write(content)

for r in results:
    print(r)
