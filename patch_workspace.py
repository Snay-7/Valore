import re

with open("app/workspace/[id]/page.tsx", "r") as f:
    content = f.read()

old = '''                  {visibilityOpen && (
                    <div style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 4px", marginTop:6 }}>
                      <div style={{ fontSize:10, color:"var(--text-d)", textTransform:"uppercase", letterSpacing:".08em", padding:"4px 10px 8px" }}>
                        Who can see this note? (all ticked = everyone)
                      </div>

                      {/* Everyone option */}
                      <label className="member-check" onClick={() => setNoteVisibility([])}>
                        <input
                          type="checkbox"
                          checked={noteVisibility.length === 0}
                          onChange={() => setNoteVisibility([])}
                          style={{ accentColor:"var(--gold)", width:14, height:14 }}
                        />
                        <div style={{ width:26, height:26, borderRadius:"50%", background:"var(--gold-bg)", border:"1px solid var(--gold-border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"var(--gold)", fontWeight:600 }}>✦</div>
                        <span style={{ fontSize:12, color:"var(--text)" }}>Everyone on this project</span>
                      </label>

                      {/* Individual members */}
                      {otherMembers.map(m => (
                        <label key={m.id} className="member-check" onClick={() => toggleMemberVisibility(m.user_id)}>
                          <input
                            type="checkbox"
                            checked={noteVisibility.length === 0 || noteVisibility.includes(m.user_id)}
                            onChange={() => {
                              if (noteVisibility.length === 0) {
                                // switching from "everyone" to specific — pre-select all others except this one
                                setNoteVisibility(otherMembers.filter(x => x.user_id !== m.user_id).map(x => x.user_id));
                              } else {
                                toggleMemberVisibility(m.user_id);
                              }
                            }}
                            style={{ accentColor:"var(--gold)", width:14, height:14 }}
                          />
                          <div style={{ width:26, height:26, borderRadius:"50%", background:"var(--bg4)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"var(--text-m)", fontWeight:600 }}>
                            {(m.email || m.role || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <span style={{ fontSize:12, color:"var(--text)" }}>{m.email || "Team member"}</span>
                            <span style={{ fontSize:10, color:"var(--text-d)", marginLeft:6 }}>{m.role}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}'''

new = '''                  {visibilityOpen && (
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
                  )}'''

if old in content:
    content = content.replace(old, new)
    with open("app/workspace/[id]/page.tsx", "w") as f:
        f.write(content)
    print("SUCCESS — patched")
else:
    print("ERROR — old string not found")
