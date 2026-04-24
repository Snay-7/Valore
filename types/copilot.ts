/**
 * Valora — Persistent Copilot types
 *
 * Strict TypeScript types for the Copilot data layer.
 * These match the schema in supabase/migrations/20260424000001_copilot_threads_schema.sql.
 *
 * Tip: you can also auto-generate these with:
 *   supabase gen types typescript --project-id <your-project-id> > src/types/database.ts
 * and import the `Database` type from there. These hand-written types are
 * more ergonomic for app code (they use the same names as your UI).
 */

// -----------------------------------------------------------------------------
// Enums (mirror the Postgres enums)
// -----------------------------------------------------------------------------

export type MessageRole = 'user' | 'valora' | 'system' | 'comment';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type ArtifactType =
  | 'underwrite_run'
  | 'valuation'
  | 'comp_set'
  | 'scenario'
  | 'export'
  | 'file_ref';

export type ProjectStage =
  | 'draft'
  | 'underwritten'
  | 'under_review'
  | 'ic_ready'
  | 'approved'
  | 'closed';

// -----------------------------------------------------------------------------
// Message content structure
// Stored as JSONB; lets us extend with blocks without schema changes.
// -----------------------------------------------------------------------------

export type MessageBlock =
  | { type: 'text'; text: string }
  | { type: 'artifact_ref'; artifact_id: string }
  | { type: 'mention'; user_id: string; display_name: string };

export interface MessageContent {
  /** Plain-text rendering (for search, notifications, PDF export) */
  text: string;
  /** Rich blocks for UI rendering — optional, falls back to `text` */
  blocks?: MessageBlock[];
}

export interface MessageAttachment {
  name: string;
  url: string;
  size_bytes: number;
  mime_type: string;
  /** e.g. 'OM', 'brochure', 'comps', 'operator_data' */
  kind?: string;
}

export interface MessageMetadata {
  /** For Valora responses: which model produced this */
  model?: string;
  /** For Valora responses: token counts */
  tokens?: { prompt: number; completion: number };
  /** End-to-end latency in ms */
  latency_ms?: number;
  /** Number of comps considered, confidence source, etc. */
  [key: string]: unknown;
}

// -----------------------------------------------------------------------------
// Core row types
// -----------------------------------------------------------------------------

export interface CopilotThread {
  id: string;
  project_id: string;
  workspace_id: string;
  created_at: string;         // ISO timestamp
  last_message_at: string;    // ISO timestamp
  pinned_message_ids: string[];
  model_version: string;
  archived_at: string | null;
}

export interface Message {
  id: string;
  thread_id: string;
  role: MessageRole;
  parent_message_id: string | null;
  author_id: string | null;
  content: MessageContent;
  attachments: MessageAttachment[];
  confidence: ConfidenceLevel | null;
  created_at: string;
  deleted_at: string | null;
  metadata: MessageMetadata;
}

// ---------- Artifact payload shapes (discriminated by `type`) ----------

export interface UnderwriteRunPayload {
  irr_levered: number;
  cash_on_cash: number;
  dscr_avg: number;
  exit_value: number;
  hold_years: number;
  /** Full cash-flow table; keep flexible */
  cash_flows: Array<{ year: number; noi: number; debt_service: number; cf_to_equity: number }>;
}

export interface ValuationPayload {
  estimate: number;
  confidence_interval_low: number;
  confidence_interval_high: number;
  currency: string;
  methodology: 'income' | 'comp' | 'cost' | 'blended';
  comp_ids: string[];
}

export interface CompSetPayload {
  comps: Array<{
    name: string;
    address: string;
    distance_m: number;
    price_per_unit: number;
    yield_pct: number;
    source: string;
  }>;
  radius_m: number;
}

export interface ScenarioPayload {
  scenarios: {
    base: { irr: number; cash_on_cash: number; dscr: number };
    bull: { irr: number; cash_on_cash: number; dscr: number };
    bear: { irr: number; cash_on_cash: number; dscr: number };
  };
  swing_variable: string;
}

export interface ExportPayload {
  format: 'ic_deck' | 'excel' | 'pdf_one_pager' | 'share_link';
  url: string;
  generated_at: string;
  /** For share links */
  share_hash?: string;
}

export interface FileRefPayload {
  name: string;
  url: string;
  mime_type: string;
  excerpt?: string;
}

export type ArtifactPayload =
  | UnderwriteRunPayload
  | ValuationPayload
  | CompSetPayload
  | ScenarioPayload
  | ExportPayload
  | FileRefPayload;

export interface Artifact<T extends ArtifactPayload = ArtifactPayload> {
  id: string;
  thread_id: string;
  message_id: string;
  type: ArtifactType;
  payload: T;
  created_at: string;
  supersedes_id: string | null;
}

// ---------- Assumption events ----------

export interface AssumptionEvent {
  id: string;
  thread_id: string;
  project_id: string;
  /** e.g. 'exit_cap', 'occupancy', 'adr', 'hold_years' */
  field: string;
  old_value: unknown;
  new_value: unknown;
  triggered_by_message_id: string | null;
  author_id: string | null;
  created_at: string;
}

// -----------------------------------------------------------------------------
// Compound UI types
// Use these in components to avoid ad-hoc joins.
// -----------------------------------------------------------------------------

export interface MessageWithArtifacts extends Message {
  artifacts: Artifact[];
  /** Only populated when the message has comments (replies) */
  comments?: MessageWithArtifacts[];
}

export interface ThreadSummary {
  thread: CopilotThread;
  message_count: number;
  contributor_count: number;
  pinned_count: number;
  first_message_at: string | null;
  last_message_at: string;
}