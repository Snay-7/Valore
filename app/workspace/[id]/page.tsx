"use client";
export const dynamic = 'force-dynamic'
import { useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function WorkspaceProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;

  useEffect(() => {
    const init = async () => {
      if (!projectId) { router.push("/workspace"); return; }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }

      // Check user has access to this project (own or via firm)
      const { data: memberRow } = await supabase
        .from("firm_members")
        .select("firm_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      // Try to get the latest appraisal for this project
      const { data: project } = await supabase
        .from("projects")
        .select("id, appraisals(id, created_at)")
        .eq("id", projectId)
        .maybeSingle();

      if (!project) {
        // Try via project_members for shared access
        const { data: pm } = await supabase
          .from("project_members")
          .select("project_id, projects(id, appraisals(id, created_at))")
          .eq("project_id", projectId)
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (!pm) { router.push("/workspace"); return; }

        const appraisals = (pm.projects as any)?.appraisals || [];
        const latest = appraisals.sort((a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

        if (latest) {
          router.push(`/appraisal?project=${projectId}&appraisal=${latest.id}`);
        } else {
          router.push(`/appraisal?project=${projectId}`);
        }
        return;
      }

      const appraisals = (project.appraisals as any[]) || [];
      const latest = appraisals.sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      if (latest) {
        router.push(`/appraisal?project=${projectId}&appraisal=${latest.id}`);
      } else {
        router.push(`/appraisal?project=${projectId}`);
      }
    };
    init();
  }, [projectId, router]);

  return (
    <div style={{ minHeight: "100vh", background: "#06070a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 28, height: 28, border: "2px solid rgba(201,168,76,.2)", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
