with open("app/workspace/[id]/page.tsx", "r") as f:
    content = f.read()

# Remove the old visibility button + dropdown entirely
old = '''                {/* Visibility selector */}
                <div style={{ marginBottom:14 }}>
                  <button
                    onClick={() => setVisibilityOpen(o => !o)}
                    style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:7, padding:"7px 12px", color:"var(--text-m)", fontSize:12, cursor:"pointer", fontFamily:"var(--font-body)", display:"flex", alignItems:"center", gap:8, transition:"border-color .2s" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--gold)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                    {visibilityLabel()}
                    <span style={{ marginLeft:"auto", fontSize:10 }}>{visibilityOpen ? "▲" : "▼"}</span>
                  </button>

                  {visibilityOpen && (
                    <div style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 4px", marginTop:6 }}>
                      <div style={{ fontSize:10, color:"var(--text-d)", textTransform:"uppercase", letterSpacing:".08em", padding:"4px 10px 8px" }}>
                        Who can see this note?
                      </div>

                      {/* Everyone option */}
                      <div
                        className="member-check"
                        onClick={() => setNoteVisibility([])}
                        style={{ cursor:"pointer" }}
                      >
                        <div style={{ width:16, height:16, borderRadius:3, border:`2px solid ${noteVisibility.length===0?"var(--gold)":"var(--border-m)"}`, background:noteVisibility.length===0?"var(--gold)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .15s" }}>
                          {noteVisibility.length===0 && <span style={{ color:"#06070a", fontSize:9, fontWeight:900, lineHeight:1 }}>✓</span>}
                        </div>
                        <div style={{ width:26, height:26, borderRadius:"50%", background:"var(--gold-bg)", border:"1px solid var(--gold-border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"var(--gold)", fontWeight:600 }}>✦</div>
                        <span style={{ fontSize:12, color:"var(--text)" }}>Everyone on this project</span>
                      </div>

                      {/* Individual members */}
                      {otherMembers.map(m => {
                        const isChecked = noteVisibility.length === 0 || noteVisibility.includes(m.user_id);
                        return (
                          <div
                            key={m.id}
                            className="member-check"
                            style={{ cursor:"pointer" }}
                            onClick={() => {
                              if (noteVisibility.length === 0) {
                                setNoteVisibility(otherMembers.filter(x => x.user_id !== m.user_id).map(x => x.user_id));
                              } else if (noteVisibility.includes(m.user_id)) {
                                setNoteVisibility(prev => prev.filter(id => id !== m.user_id));
                              } else {
                                setNoteVisibility(prev => [...prev, m.user_id]);
                              }
                            }}
                          >
                            <div style={{ width:16, height:16, borderRadius:3, border:`2px solid ${isChecked?"var(--gold)":"var(--border-m)"}`, background:isChecked?"var(--gold)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .15s" }}>
                              {isChecked && <span style={{ color:"#06070a", fontSize:9, fontWeight:900, lineHeight:1 }}>✓</span>}
                            </div>
                            <div style={{ width:26, height:26, borderRadius:"50%", background:"var(--bg4)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"var(--text-m)", fontWeight:600 }}>
                              {(m.email||"?")[0].toUpperCase()}
                            </div>
                            <div>
                              <span style={{ fontSize:12, color:"var(--text)" }}>{m.email||"Team member"}</span>
                              <span style={{ fontSize:10, color:"var(--text-d)", marginLeft:6 }}>{m.role}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>'''

new = '''                {/* Visibility selector — always visible, no dropdown */}
                <div style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 12px", marginBottom:14 }}>
                  <div style={{ fontSize:10, color:"var(--text-d)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:8 }}>Visible to</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {/* Everyone toggle */}
                    <button
                      type="button"
                      onClick={() => setNoteVisibility([])}
                      style={{ padding:"5px 12px", borderRadius:20, border:`1px solid ${noteVisibility.length===0?"var(--gold)":"var(--border)"}`, background:noteVisibility.length===0?"var(--gold-bg)":"transparent", color:noteVisibility.length===0?"var(--gold)":"var(--text-d)", fontSize:12, cursor:"pointer", fontFamily:"var(--font-body)", transition:"all .15s" }}
                    >
                      ✦ Everyone
                    </button>
                    {/* Per-member toggles */}
                    {otherMembers.map(m => {
                      const isChecked = noteVisibility.length === 0 || noteVisibility.includes(m.user_id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            if (noteVisibility.length === 0) {
                              setNoteVisibility(otherMembers.filter(x => x.user_id !== m.user_id).map(x => x.user_id));
                            } else if (noteVisibility.includes(m.user_id)) {
                              setNoteVisibility(prev => prev.filter(id => id !== m.user_id));
                            } else {
                              setNoteVisibility(prev => [...prev, m.user_id]);
                            }
                          }}
                          style={{ padding:"5px 12px", borderRadius:20, border:`1px solid ${isChecked?"var(--gold)":"var(--border)"}`, background:isChecked?"var(--gold-bg)":"transparent", color:isChecked?"var(--gold)":"var(--text-d)", fontSize:12, cursor:"pointer", fontFamily:"var(--font-body)", transition:"all .15s" }}
                        >
                          {isChecked ? "✓ " : ""}{m.email?.split("@")[0] || "member"}
                        </button>
                      );
                    })}
                  </div>
                </div>'''

if old in content:
    content = content.replace(old, new)
    with open("app/workspace/[id]/page.tsx", "w") as f:
        f.write(content)
    print("SUCCESS — patched")
else:
    print("ERROR — old string not found, trying alternate...")
    # Check what's actually there
    idx = content.find("Visibility selector")
    if idx >= 0:
        print("Found 'Visibility selector' at char", idx)
        print(repr(content[idx:idx+200]))
    else:
        print("No visibility selector found at all")
