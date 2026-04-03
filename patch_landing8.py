with open("app/page.tsx", "r") as f:
    content = f.read()

results = []

# Remove the entire testimonials section
old_testi_section = '''      <section style={{padding:"90px 0",background:"var(--bg1)",borderTop:"1px solid var(--border)"}}>
        <div className="container">
          <div style={{textAlign:"center",marginBottom:56}}>
            <div className="badge" style={{marginBottom:20}}>What Developers Say</div>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(26px,3vw,42px)",fontWeight:300}}>Used by developers across London,<br/>the Gulf, and Southeast Asia</h2>
          </div>
          <div className="testi-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {TESTIMONIALS.map((t,i)=>(
              <div key={i} className="testi reveal" style={{animationDelay:`${i*0.07}s`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div className="stars">{"★".repeat(t.stars)}</div>
                  <span style={{fontSize:9,color:"var(--text-d)",background:"var(--bg4)",padding:"2px 8px",borderRadius:20,textTransform:"uppercase"}}>{t.tag}</span>
                </div>
                <p style={{fontSize:13,color:"var(--text-m)",lineHeight:1.8,fontStyle:"italic"}}>"{t.q}"</p>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:"var(--gold-bg)",border:"1px solid var(--gold-border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:"var(--gold)",flexShrink:0}}>{t.name.split(" ").map((n:string)=>n[0]).join("")}</div>
                  <div><div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{t.name}</div><div style={{fontSize:11,color:"var(--text-d)"}}>{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>'''

if old_testi_section in content:
    content = content.replace(old_testi_section, '')
    results.append("✅ Testimonials section removed")
else:
    results.append("❌ Testimonials section not found")

# Also remove the TESTIMONIALS constant to clean up
old_testi_const = '''const TESTIMONIALS = [
  { q:"We replaced three Excel models with Valora. The monthly CF engine and sensitivity matrices are exactly what we needed for our BTR fund.", name:"James Harrington", role:"MD, Harrington Capital", stars:5, tag:"BTR" },
  { q:"The AI sense check flagged our exit yield was aggressive before we took the appraisal to investment committee. That alone saved us.", name:"Priya Sharma", role:"Head of Development Finance, Apex Developments", stars:5, tag:"BTR" },
  { q:"The AI brochure is extraordinary. We share a live link and investors see the model update in real time. No more stale email attachments.", name:"Marcus Al-Rashid", role:"Partner, Gulf Bridge Investments", stars:5, tag:"Hotel" },
  { q:"The SONIA forward curve integration shows real industry understanding. Our lender reviewed the CF and approved without a single question.", name:"Sophie Chen", role:"Development Director, Meridian Homes", stars:5, tag:"BTS" },
  { q:"Finally an appraisal tool that understands hotel repositioning. The ADR, RevPAR and cap rate logic is native, not a spreadsheet hack.", name:"Tom Reeves", role:"Principal, Atlas Real Estate", stars:5, tag:"Hotel" },
  { q:"The promote waterfall is something no other tool offers. Our JV partners were impressed we could show the distribution split in real time.", name:"Charlotte Davies", role:"Investment Manager, NorthStar Capital", stars:5, tag:"JV" },
];'''

if old_testi_const in content:
    content = content.replace(old_testi_const, '')
    results.append("✅ TESTIMONIALS constant removed")
else:
    results.append("❌ TESTIMONIALS constant not found")

# Also remove stars CSS class since it's no longer needed
old_stars_css = '''.stars{display:flex;gap:3px;color:var(--gold);font-size:13px}
'''
if old_stars_css in content:
    content = content.replace(old_stars_css, '')
    results.append("✅ Stars CSS removed")
else:
    results.append("⚠️ Stars CSS not found — minor")

with open("app/page.tsx", "w") as f:
    f.write(content)

for r in results:
    print(r)
