with open("app/workspace/page.tsx", "r") as f:
    content = f.read()

old = '''                    {/* Member selection */}
                    {firmMembers.length > 0 ? (
                      <div>
                        <div style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Share with</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                          {firmMembers.map(m => (
                            <label key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "6px 8px", borderRadius: 6, background: assigningProject === p.id && selectedMembers.includes(m.user_id) ? "var(--gold-bg)" : "transparent", transition: "background .15s" }}>
                              <input
                                type="checkbox"
                                checked={assigningProject === p.id && selectedMembers.includes(m.user_id)}
                                onChange={e => {
                                  setAssigningProject(p.id);
                                  setSelectedMembers(prev => e.target.checked ? [...prev, m.user_id] : prev.filter(id => id !== m.user_id));
                                }}
                                style={{ accentColor: "var(--gold)" }}
                              />
                              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--gold-bg)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "var(--gold)", fontWeight: 600 }}>
                                {m.user_id.toString()[0].toUpperCase()}
                              </div>
                              <span style={{ fontSize: 12, color: "var(--text-m)" }}>{m.role}</span>
                            </label>
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className="btn-primary"
                            style={{ flex: 1, padding: "8px", fontSize: 12 }}
                            disabled={saving || assigningProject !== p.id || selectedMembers.length === 0}
                            onClick={() => shareProject(p.id, selectedMembers)}
                          >
                            {saving && assigningProject === p.id ? "Sharing…" : "Share →"}
                          </button>
                          {isShared && (
                            <button className="btn-ghost" style={{ padding: "8px 12px", fontSize: 11 }} onClick={() => removeFromWorkspace(p.id)}>
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: 12, color: "var(--text-d)" }}>No members to share with yet. <span style={{ color: "var(--gold)", cursor: "pointer" }} onClick={() => router.push("/team")}>Invite team →</span></p>
                    )}'''

new = '''                    {/* Member selection */}
                    {firmMembers.length > 0 ? (
                      <div>
                        <div style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Share with</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                          {firmMembers.map(m => {
                            const isSelected = assigningProject === p.id && selectedMembers.includes(m.user_id);
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  setAssigningProject(p.id);
                                  setSelectedMembers(prev =>
                                    prev.includes(m.user_id)
                                      ? prev.filter(id => id !== m.user_id)
                                      : [...prev, m.user_id]
                                  );
                                }}
                                style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 20, border: `1px solid ${isSelected ? "var(--gold)" : "var(--border)"}`, background: isSelected ? "var(--gold-bg)" : "transparent", color: isSelected ? "var(--gold)" : "var(--text-m)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-body)", transition: "all .15s" }}
                              >
                                <div style={{ width: 20, height: 20, borderRadius: "50%", background: isSelected ? "var(--gold-bg)" : "var(--bg4)", border: `1px solid ${isSelected ? "var(--gold-border)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: isSelected ? "var(--gold)" : "var(--text-d)", fontWeight: 600 }}>
                                  {(m.email || m.role || "?")[0].toUpperCase()}
                                </div>
                                {m.email || m.role}
                              </button>
                            );
                          })}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className="btn-primary"
                            style={{ flex: 1, padding: "8px", fontSize: 12 }}
                            disabled={saving || assigningProject !== p.id || selectedMembers.length === 0}
                            onClick={() => shareProject(p.id, selectedMembers)}
                          >
                            {saving && assigningProject === p.id ? "Sharing…" : "Share →"}
                          </button>
                          {isShared && (
                            <button className="btn-ghost" style={{ padding: "8px 12px", fontSize: 11 }} onClick={() => removeFromWorkspace(p.id)}>
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: 12, color: "var(--text-d)" }}>No members to share with yet. <span style={{ color: "var(--gold)", cursor: "pointer" }} onClick={() => router.push("/team")}>Invite team →</span></p>
                    )}'''

if old in content:
    content = content.replace(old, new)
    with open("app/workspace/page.tsx", "w") as f:
        f.write(content)
    print("SUCCESS — patched")
else:
    print("ERROR — string not found")
