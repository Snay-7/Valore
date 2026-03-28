"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }
      setUser(session.user);

      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      setProjects(data || []);
      setLoading(false);
    };
    getUser();
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#06070a", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:32, height:32, border:"2px solid rgba(201,168,76,.2)", borderTopColor:"#c9a84c", borderRadius:"50%", animation:"spin .7s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#06070a", color:"#eceae4", fontFamily:"system-ui, sans-serif" }}>
      {/* Nav */}
      <nav style={{ background:"#0c0e12", borderBottom:"1px solid rgba(255,255,255,.06)", padding:"0 40px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontFamily:"Georgia,serif", fontSize:22, color:"#c9a84c", letterSpacing:".1em", fontWeight:300 }}>VALORA</span>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <span style={{ fontSize:13, color:"#7d8590" }}>{user?.email}</span>
          <button onClick={signOut} style={{ background:"transparent", border:"1px solid rgba(255,255,255,.12)", borderRadius:7, color:"#eceae4", padding:"8px 16px", fontSize:12, cursor:"pointer" }}>Sign Out</button>
        </div>
      </nav>

      {/* Main */}
      <div style={{ maxWidth:1140, margin:"0 auto", padding:"48px 40px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:40 }}>
          <div>
            <h1 style={{ fontFamily:"Georgia,serif", fontSize:36, fontWeight:300, marginBottom:6 }}>Dashboard</h1>
            <p style={{ fontSize:14, color:"#7d8590" }}>Welcome back — {user?.email}</p>
          </div>
          <button style={{ background:"#c9a84c", color:"#06070a", border:"none", borderRadius:8, padding:"12px 24px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
            + New Appraisal
          </button>
        </div>

        {projects.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{ fontSize:48, marginBottom:20 }}>◈</div>
            <h2 style={{ fontFamily:"Georgia,serif", fontSize:28, fontWeight:300, marginBottom:12, color:"#eceae4" }}>No projects yet</h2>
            <p style={{ fontSize:15, color:"#7d8590", marginBottom:32 }}>Create your first appraisal to get started.</p>
            <button style={{ background:"#c9a84c", color:"#06070a", border:"none", borderRadius:8, padding:"14px 32px", fontSize:14, fontWeight:600, cursor:"pointer" }}>
              Create First Appraisal →
            </button>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
            {projects.map((p) => (
              <div key={p.id} style={{ background:"#12151a", border:"1px solid rgba(255,255,255,.06)", borderRadius:14, padding:24, cursor:"pointer", transition:"border-color .2s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(201,168,76,.3)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.06)"}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                  <span style={{ fontSize:10, padding:"2px 8px", borderRadius:10, background:"rgba(201,168,76,.1)", color:"#c9a84c", fontWeight:500 }}>{p.asset_type || "BTR"}</span>
                  <span style={{ fontSize:10, color:"#3d4249" }}>{new Date(p.created_at).toLocaleDateString()}</span>
                </div>
                <h3 style={{ fontSize:16, fontWeight:500, marginBottom:6 }}>{p.name}</h3>
                <p style={{ fontSize:12, color:"#7d8590", marginBottom:16 }}>{p.location || "No location set"}</p>
                <div style={{ fontSize:11, padding:"4px 10px", borderRadius:10, background:"rgba(61,220,132,.08)", color:"#3ddc84", width:"fit-content" }}>{p.stage}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}