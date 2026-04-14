import { supabase } from "../../../lib/supabase";

export async function generateMetadata({ params }: { params: { token: string } }) {
  const { data } = await supabase
    .from("appraisals")
    .select("name, snapshot")
    .eq("share_token", params.token)
    .single();

  const name = data?.name || "Valora Appraisal";
  const snap = data?.snapshot || {};
  const location = snap.location || "";
  const assetType = snap.assetType || "";

  return {
    title: `${name} — Valora`,
    description: `${assetType} appraisal${location ? ` · ${location}` : ""} · View returns, cost breakdown and financials.`,
    openGraph: {
      title: `${name} — Valora`,
      description: `${assetType} appraisal${location ? ` · ${location}` : ""} · View returns, cost breakdown and financials.`,
      siteName: "Valora",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${name} — Valora`,
      description: `${assetType} appraisal${location ? ` · ${location}` : ""}`,
    },
  };
}

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
