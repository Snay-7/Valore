import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─────────────────────────────────────────────────────────────
// QUERY RULES — read before writing Supabase queries
//
// ❌ NEVER use .maybeSingle() on tables where a user
//    can have multiple rows (firm_members, project_members etc.)
//    It silently returns null if 2+ rows exist.
//
// ✅ ALWAYS use array + [0] for multi-row tables:
//
//    const { data } = await supabase
//      .from("firm_members")
//      .select("*")
//      .eq("user_id", uid)
//      .order("joined_at", { ascending: true });
//    const row = data?.[0] ?? null;
//
// ✅ .maybeSingle() is safe ONLY on guaranteed single-row
//    tables: subscriptions, profiles, appraisals (by id)
// ─────────────────────────────────────────────────────────────

export type Profile = {
  id: string
  firm_id: string | null
  full_name: string | null
  role: 'owner' | 'admin' | 'member' | 'viewer'
  asset_focus: string | null
  avatar_url: string | null
  created_at: string
}

export type Project = {
  id: string
  firm_id: string
  name: string
  location: string | null
  asset_type: 'BTR' | 'BTS' | 'Hotel' | 'Flip' | 'Mixed' | null
  stage: string
  currency: string
  benchmark_rate: string
  is_archived: boolean
  created_at: string
  updated_at: string
}

export type Appraisal = {
  id: string
  project_id: string
  firm_id: string
  name: string
  scenario: string
  status: string
  units_omr: number
  units_dmr: number
  rent_omr_pcm: number
  exit_yield: number
  gdv: number | null
  total_cost: number | null
  profit: number | null
  profit_on_cost: number | null
  irr_unlevered: number | null
  share_token: string
  is_shared: boolean
  created_at: string
  updated_at: string
}
