"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

// ═══════════════════════════════════════════════════════════════════════
// VALORA PIPELINE v5 — Poppins + val-* design system
//
// REQUIRES: tokens.css + components.css imported globally (e.g. in
// app/layout.tsx or a global.css). Every val-* class and --val-* token
// used here is defined in those two files.
//
// Pipeline-specific classes (.kb-*, .side-panel*, .pri-*) are inlined
// below since they don't belong in the shared component library.
// All Supabase queries, drag/drop, side-panel, task/note/activity logic
// preserved from the production pipeline page.
// ═══════════════════════════════════════════════════════════════════════

const PIPELINE_CSS = `
/* ── Kanban board ── */
.kb-board {
  display: grid;
  grid-template-columns: repeat(5, minmax(280px, 1fr));
  gap: var(--val-s-4);
  align-items: flex-start;
  overflow-x: auto;
  padding-bottom: var(--val-s-4);
}
.kb-col {
  display: flex;
  flex-direction: column;
  gap: var(--val-s-3);
  min-width: 280px;
}
.kb-col__head {
  display: flex;
  align-items: center;
  gap: var(--val-s-2);
  padding: 0 var(--val-s-2) var(--val-s-1);
}
.kb-col__dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.kb-col__dot--prospect       { background: var(--val-text-dim); }
.kb-col__dot--feasibility    { background: var(--val-amber); }
.kb-col__dot--under_offer    { background: var(--val-blue); }
.kb-col__dot--in_development { background: var(--val-green); }
.kb-col__dot--completed      { background: var(--val-green); }
.kb-col__label {
  font-size: 10px;
  font-weight: var(--val-w-semibold);
  letter-spacing: var(--val-track-widest);
  text-transform: uppercase;
  color: var(--val-text);
}
.kb-col__count {
  font-size: var(--val-size-11);
  color: var(--val-text-dim);
  background: var(--val-bg-panel-2);
  padding: 1px 8px;
  border-radius: var(--val-r-pill);
  font-weight: var(--val-w-semibold);
}
.kb-col__total {
  font-size: var(--val-size-11);
  color: var(--val-text-dim);
  padding: 0 var(--val-s-2);
  font-variant-numeric: tabular-nums;
  font-family: var(--val-font-mono);
}
.kb-col--drag-over .kb-drop,
.kb-col--drag-over .kb-card {
  border-color: var(--val-green);
}
.kb-drop {
  padding: var(--val-s-5) var(--val-s-3);
  border: 1px dashed var(--val-border);
  border-radius: var(--val-r-md);
  text-align: center;
  font-size: var(--val-size-12);
  color: var(--val-text-dim);
}
.kb-card {
  background: var(--val-bg-panel);
  border: 1px solid var(--val-border);
  border-radius: var(--val-r-lg);
  padding: var(--val-s-4);
  display: flex;
  flex-direction: column;
  gap: var(--val-s-3);
  cursor: grab;
  transition: border-color var(--val-dur-fast) var(--val-ease-out),
              transform var(--val-dur-fast) var(--val-ease-out);
  position: relative;
  user-select: none;
}
.kb-card:hover { border-color: var(--val-border-lt); transform: translateY(-1px); }
.kb-card--dragging { opacity: 0.4; cursor: grabbing; }
.kb-card--selected { border-color: var(--val-green); box-shadow: 0 0 0 3px var(--val-green-tint); }
.kb-card__title {
  font-size: var(--val-size-14);
  font-weight: var(--val-w-bold);
  color: var(--val-text);
  letter-spacing: var(--val-track-snug);
  line-height: 1.3;
  margin: 0;
}
.kb-card__loc {
  font-size: var(--val-size-11);
  color: var(--val-text-dim);
  font-weight: var(--val-w-medium);
  margin-top: 2px;
}
.kb-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--val-size-13);
  font-weight: var(--val-w-bold);
  font-variant-numeric: tabular-nums;
  font-family: var(--val-font-mono);
}
.kb-card__row .kb-card__row-left  { color: var(--val-text-mid); }
.kb-card__task-count {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--val-green);
  color: var(--val-bg-app);
  border-radius: var(--val-r-pill);
  min-width: 18px;
  padding: 0 6px;
  font-size: 10px;
  font-weight: var(--val-w-bold);
  font-family: var(--val-font-mono);
  line-height: 18px;
  text-align: center;
}
.kb-card__mini-stats {
  display: flex;
  gap: var(--val-s-1);
}
.kb-card__mini-stat {
  font-size: 10px;
  font-weight: var(--val-w-semibold);
  padding: 2px 8px;
  border-radius: var(--val-r-xs);
  background: var(--val-bg-panel-2);
  color: var(--val-text-dim);
  letter-spacing: var(--val-track-wide);
}
.kb-card__actions {
  display: flex;
  gap: var(--val-s-1);
  margin-top: 2px;
}
.kb-card__btn {
  flex: 1;
  font-size: var(--val-size-11);
  padding: 5px 8px;
  background: var(--val-bg-panel-2);
  border: 1px solid var(--val-border);
  border-radius: var(--val-r-sm);
  color: var(--val-text-mid);
  cursor: pointer;
  font-family: inherit;
  font-weight: var(--val-w-medium);
  transition: color var(--val-dur-fast) var(--val-ease-out),
              border-color var(--val-dur-fast) var(--val-ease-out);
}
.kb-card__btn:hover { color: var(--val-green); border-color: var(--val-green); }
.kb-select {
  background: var(--val-bg-panel-2);
  border: 1px solid var(--val-border);
  border-radius: var(--val-r-sm);
  padding: 4px 8px;
  font-size: var(--val-size-11);
  color: var(--val-text-mid);
  font-family: inherit;
  cursor: pointer;
  outline: none;
}
.kb-col__add {
  padding: var(--val-s-3);
  background: transparent;
  border: 1px dashed var(--val-border);
  border-radius: var(--val-r-md);
  color: var(--val-text-dim);
  font-size: var(--val-size-12);
  font-weight: var(--val-w-medium);
  cursor: pointer;
  font-family: inherit;
  text-align: center;
  transition: color var(--val-dur-fast) var(--val-ease-out),
              border-color var(--val-dur-fast) var(--val-ease-out);
}
.kb-col__add:hover { color: var(--val-green); border-color: var(--val-green); }

/* ── Empty state ── */
.pipe-empty {
  text-align: center;
  padding: var(--val-s-16) var(--val-s-8);
  background: var(--val-bg-panel);
  border: 1px dashed var(--val-border);
  border-radius: var(--val-r-lg);
}
.pipe-empty__icon {
  font-size: 48px;
  color: var(--val-green);
  margin-bottom: var(--val-s-3);
  opacity: .7;
}
.pipe-empty__title {
  font-size: var(--val-size-17);
  font-weight: var(--val-w-bold);
  color: var(--val-text);
}
.pipe-empty__sub {
  font-size: var(--val-size-13);
  color: var(--val-text-dim);
  margin-top: var(--val-s-2);
  margin-bottom: var(--val-s-5);
}

/* ── Side panel (Tasks / Notes / Activity) ── */
@keyframes sidePanelSlide {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}
.side-panel-overlay {
  position: fixed;
  inset: 0;
  background: var(--val-bg-overlay);
  backdrop-filter: blur(3px);
  z-index: 159;
}
.side-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: min(440px, 100vw);
  height: 100%;
  background: var(--val-bg-panel);
  border-left: 1px solid var(--val-border);
  z-index: 160;
  display: flex;
  flex-direction: column;
  animation: sidePanelSlide var(--val-dur-base) var(--val-ease-out);
  box-shadow: var(--val-shadow-lg);
}
.side-panel__head {
  padding: var(--val-s-5) var(--val-s-5) 0;
  border-bottom: 1px solid var(--val-border);
  flex-shrink: 0;
}
.side-panel__title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--val-s-3);
}
.side-panel__title {
  font-size: var(--val-size-17);
  font-weight: var(--val-w-bold);
  color: var(--val-text);
  letter-spacing: var(--val-track-snug);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.side-panel__sub {
  font-size: var(--val-size-12);
  color: var(--val-text-dim);
  margin-top: 2px;
}
.side-panel__close {
  background: none;
  border: none;
  color: var(--val-text-dim);
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
  padding: 0 6px;
}
.side-panel__close:hover { color: var(--val-text); }
.side-panel__tabs {
  display: flex;
  gap: var(--val-s-4);
  margin-top: var(--val-s-4);
}
.side-panel__tab {
  padding: var(--val-s-2) 0;
  background: none;
  border: none;
  font-family: inherit;
  font-size: var(--val-size-12);
  font-weight: var(--val-w-medium);
  color: var(--val-text-dim);
  cursor: pointer;
  position: relative;
  letter-spacing: var(--val-track-wide);
  text-transform: uppercase;
}
.side-panel__tab:hover { color: var(--val-text-mid); }
.side-panel__tab--active { color: var(--val-green); font-weight: var(--val-w-bold); }
.side-panel__tab--active::after {
  content: '';
  position: absolute;
  left: 0; right: 0; bottom: -1px;
  height: 2px;
  background: var(--val-green);
}
.side-panel__body {
  flex: 1;
  overflow-y: auto;
  padding: var(--val-s-5);
  display: flex;
  flex-direction: column;
  gap: var(--val-s-4);
}
.side-panel__form {
  background: var(--val-bg-panel-2);
  border: 1px solid var(--val-border);
  border-radius: var(--val-r-md);
  padding: var(--val-s-4);
  display: flex;
  flex-direction: column;
  gap: var(--val-s-3);
}
.side-panel__textarea {
  width: 100%;
  padding: var(--val-s-3);
  background: var(--val-bg-panel);
  border: 1px solid var(--val-border-lt);
  border-radius: var(--val-r-md);
  color: var(--val-text);
  font-family: inherit;
  font-size: var(--val-size-13);
  font-weight: var(--val-w-medium);
  resize: vertical;
  min-height: 64px;
  outline: none;
  transition: border-color var(--val-dur-fast) var(--val-ease-out);
}
.side-panel__textarea:focus { border-color: var(--val-green); box-shadow: 0 0 0 3px var(--val-green-tint); }
.side-panel__textarea::placeholder { color: var(--val-text-faint); }

/* ── Task & note items ── */
.task-item {
  background: var(--val-bg-panel-2);
  border: 1px solid var(--val-border);
  border-radius: var(--val-r-md);
  padding: var(--val-s-3);
  display: flex;
  gap: var(--val-s-3);
  align-items: flex-start;
  transition: border-color var(--val-dur-fast) var(--val-ease-out);
}
.task-item:hover { border-color: var(--val-border-lt); }
.task-item--done { opacity: 0.45; }
.task-item__check {
  width: 18px; height: 18px;
  border-radius: var(--val-r-xs);
  border: 1.5px solid var(--val-border-lt);
  background: none;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
  display: grid;
  place-items: center;
  transition: border-color var(--val-dur-fast) var(--val-ease-out),
              background var(--val-dur-fast) var(--val-ease-out);
}
.task-item__check:hover { border-color: var(--val-green); }
.task-item__check--checked {
  border-color: var(--val-green);
  background: var(--val-green);
}
.task-item__check--checked::after {
  content: '✓';
  color: var(--val-bg-app);
  font-size: 11px;
  font-weight: var(--val-w-bold);
}
.task-item__body { flex: 1; min-width: 0; }
.task-item__desc {
  font-size: var(--val-size-13);
  color: var(--val-text);
  line-height: var(--val-lh-normal);
  margin-bottom: var(--val-s-2);
}
.task-item--done .task-item__desc { text-decoration: line-through; color: var(--val-text-dim); }
.task-item__meta {
  display: flex;
  gap: var(--val-s-2);
  flex-wrap: wrap;
  align-items: center;
}
.task-item__due {
  font-size: var(--val-size-11);
  color: var(--val-text-dim);
  font-family: var(--val-font-mono);
  font-variant-numeric: tabular-nums;
}
.task-item__due--overdue { color: var(--val-red); }
.task-item__delete {
  background: none;
  border: none;
  color: var(--val-text-dim);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0 4px;
  flex-shrink: 0;
  transition: color var(--val-dur-fast) var(--val-ease-out);
}
.task-item__delete:hover { color: var(--val-red); }

.note-item {
  background: var(--val-bg-panel-2);
  border: 1px solid var(--val-border);
  border-radius: var(--val-r-md);
  padding: var(--val-s-3);
}
.note-item__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--val-s-2);
}
.note-item__date {
  font-size: var(--val-size-11);
  color: var(--val-text-dim);
  font-family: var(--val-font-mono);
  font-variant-numeric: tabular-nums;
  letter-spacing: var(--val-track-wide);
}
.note-item__body {
  font-size: var(--val-size-13);
  line-height: var(--val-lh-loose);
  white-space: pre-wrap;
  color: var(--val-text);
}

.activity-row {
  display: flex;
  gap: var(--val-s-3);
  padding: var(--val-s-3) 0;
  border-bottom: 1px solid var(--val-border);
}
.activity-row:last-child { border-bottom: none; }
.activity-row__icon {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--val-bg-panel-2);
  border: 1px solid var(--val-border);
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 12px;
}
.activity-row__body { flex: 1; min-width: 0; }
.activity-row__action {
  font-size: var(--val-size-13);
  color: var(--val-text);
  line-height: var(--val-lh-snug);
}
.activity-row__preview {
  font-size: var(--val-size-12);
  color: var(--val-text-dim);
  font-style: italic;
  margin-top: 2px;
  line-height: var(--val-lh-snug);
}
.activity-row__time {
  font-size: var(--val-size-11);
  color: var(--val-text-dim);
  font-family: var(--val-font-mono);
  font-variant-numeric: tabular-nums;
  margin-top: 4px;
}

.side-panel__empty {
  text-align: center;
  padding: var(--val-s-10) 0;
  color: var(--val-text-dim);
  font-size: var(--val-size-13);
}
.side-panel__section-title {
  font-size: 10px;
  font-weight: var(--val-w-semibold);
  letter-spacing: var(--val-track-widest);
  text-transform: uppercase;
  color: var(--val-text-dim);
  margin: var(--val-s-4) 0 var(--val-s-2);
}

/* ── Priority chip ── */
.pri-chip {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: var(--val-r-xs);
  font-weight: var(--val-w-semibold);
  letter-spacing: var(--val-track-wide);
  text-transform: uppercase;
}
.pri-chip--low    { background: rgba(148,156,160,0.15); color: var(--val-text-mid); }
.pri-chip--medium { background: var(--val-blue-tint);   color: var(--val-blue); }
.pri-chip--high   { background: var(--val-amber-tint);  color: var(--val-amber); }
.pri-chip--urgent { background: var(--val-red-tint);    color: var(--val-red); }

/* ── Loading screen ── */
@keyframes pipeSpin { to { transform: rotate(360deg); } }
.pipe-loading {
  min-height: 100vh;
  background: var(--val-bg-app);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--val-s-3);
}
.pipe-loading__brand {
  font-size: var(--val-size-22);
  font-weight: var(--val-w-bold);
  letter-spacing: var(--val-track-snug);
  color: var(--val-text);
}
.pipe-loading__spinner {
  width: 26px; height: 26px;
  border: 2px solid var(--val-green-tint);
  border-top-color: var(--val-green);
  border-radius: 50%;
  animation: pipeSpin 0.7s linear infinite;
}
.pipe-loading__label {
  font-size: var(--val-size-11);
  color: var(--val-text-dim);
  letter-spacing: var(--val-track-wide);
}

@media (max-width: 900px) {
  .kb-board { grid-template-columns: repeat(5, 280px); }
  .side-panel { width: 100vw; }
}
`;

const fmt = (n: number, prefix = "£") => {
  if (!n || !isFinite(n) || isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${prefix}${(n / 1e9).toFixed(2)}bn`;
  if (abs >= 1e6) return `${prefix}${(n / 1e6).toFixed(2)}m`;
  if (abs >= 1e3) return `${prefix}${(n / 1e3).toFixed(0)}k`;
  return `${prefix}${n.toFixed(0)}`;
};
const fmtPct = (n: number) => (!n || !isFinite(n) || isNaN(n) ? "—" : `${(n * 100).toFixed(1)}%`);
const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const fmtDateTime = (d: string) => new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const CURRENCY_SYMBOLS: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", AED: "د.إ", SGD: "S$", AUD: "A$", JPY: "¥", CHF: "Fr", CAD: "C$", HKD: "HK$" };

const STAGES = [
  { id: "prospect",       label: "Prospect",       dotMod: "prospect" },
  { id: "feasibility",    label: "Feasibility",    dotMod: "feasibility" },
  { id: "under_offer",    label: "Under Offer",    dotMod: "under_offer" },
  { id: "in_development", label: "In Development", dotMod: "in_development" },
  { id: "completed",      label: "Completed",      dotMod: "completed" },
];

// Map asset_type (DB value) to the val-type-pill modifier class suffix
const ASSET_PILL: Record<string, string> = {
  BTR: "btr",
  BTS: "bts",
  Hotel: "hotel",
  Flip: "flip",
  MixedUse: "mixeduse",
  Commercial: "commercial",
  Industrial: "industrial",
};
const ASSET_LABEL: Record<string, string> = {
  BTR: "BTR",
  BTS: "BTS",
  Hotel: "Hotel",
  Flip: "Flip",
  MixedUse: "Mixed Use",
  Commercial: "Commercial",
  Industrial: "Industrial",
};

const PRIORITY_LABEL: Record<string, string> = { low: "Low", medium: "Medium", high: "High", urgent: "Urgent" };

export default function PipelinePage() {
  const router = useRouter();

  // ── Theme (data-theme on <html>, localStorage key 'val-theme') ──
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") return (localStorage.getItem("val-theme") || "dark") as "dark" | "light";
    return "dark";
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("val-theme", theme);
  }, [theme]);

  // ── Data state (preserved from pipeline-v3) ──
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Record<string, any[]>>({});
  const [notes, setNotes] = useState<Record<string, any[]>>({});
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Drag & side-panel state ──
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const dragItem = useRef<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [panelTab, setPanelTab] = useState<"tasks" | "notes" | "activity">("tasks");

  // ── Form state ──
  const [newTask, setNewTask] = useState({ description: "", due_at: "", priority: "medium" });
  const [savingTask, setSavingTask] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      setUser(session.user);
      await loadAll(session.user.id);
    };
    init();
  }, [router]);

  const loadAll = async (userId: string) => {
    setLoading(true);
    const [{ data: projData }, { data: taskData }, { data: noteData }, { data: actData }] = await Promise.all([
      supabase.from("projects").select(`*,appraisals(id,gdv,profit,profit_on_cost,irr_unlevered,status,created_at)`).eq("created_by", userId).is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("tasks").select("*").or(`created_by.eq.${userId},assigned_to.eq.${userId}`).order("created_at", { ascending: false }),
      // ── unified notes table — filter by user and only project-linked notes ──
      supabase.from("notes").select("*").eq("user_id", userId).not("project_id", "is", null).order("created_at", { ascending: false }),
      supabase.from("activity").select("*").eq("created_by", userId).order("created_at", { ascending: false }).limit(50),
    ]);
    setProjects(projData || []);
    const tm: Record<string, any[]> = {};
    (taskData || []).forEach(t => { if (!tm[t.project_id]) tm[t.project_id] = []; tm[t.project_id].push(t); });
    setTasks(tm);
    const nm: Record<string, any[]> = {};
    (noteData || []).forEach(n => { if (n.project_id) { if (!nm[n.project_id]) nm[n.project_id] = []; nm[n.project_id].push(n); } });
    setNotes(nm);
    setActivity(actData || []);
    setLoading(false);
  };

  const logActivity = async (projectId: string, action: string, meta?: any) => {
    if (!user) return;
    const { data: a } = await supabase.from("activity").insert({ project_id: projectId, created_by: user.id, action, meta }).select().single();
    if (a) setActivity(prev => [a, ...prev].slice(0, 50));
  };

  const moveProject = async (projectId: string, newStage: string) => {
    const p = projects.find(x => x.id === projectId);
    const old = p?.pipeline_stage || "prospect";
    if (old === newStage) return;
    setProjects(prev => prev.map(x => x.id === projectId ? { ...x, pipeline_stage: newStage } : x));
    await supabase.from("projects").update({ pipeline_stage: newStage }).eq("id", projectId);
    await logActivity(projectId, `Moved to ${STAGES.find(s => s.id === newStage)?.label || newStage}`, { from: old, to: newStage });
  };

  const onDragStart = (e: React.DragEvent, p: any) => { dragItem.current = p; setDraggingId(p.id); e.dataTransfer.effectAllowed = "move"; };
  const onDragEnd = () => { setDraggingId(null); setDragOverCol(null); };
  const onDragOver = (e: React.DragEvent, sid: string) => { e.preventDefault(); setDragOverCol(sid); };
  const onDrop = (e: React.DragEvent, sid: string) => {
    e.preventDefault();
    if (dragItem.current && (dragItem.current.pipeline_stage || "prospect") !== sid) moveProject(dragItem.current.id, sid);
    setDraggingId(null); setDragOverCol(null); dragItem.current = null;
  };

  const openPanel = (p: any, tab: "tasks" | "notes" | "activity" = "tasks") => { setSelectedProject(p); setPanelTab(tab); };
  const openProject = (p: any) => { const l = p.appraisals?.[0]; router.push(l ? `/appraisal?project=${p.id}&appraisal=${l.id}` : `/appraisal?project=${p.id}`); };

  const addTask = async () => {
    if (!newTask.description.trim() || !selectedProject || !user) return;
    setSavingTask(true);
    const { data } = await supabase.from("tasks").insert({
      project_id: selectedProject.id, created_by: user.id, created_by_email: user.email,
      title: newTask.description.trim(), description: newTask.description.trim(),
      due_date: newTask.due_at || null, priority: newTask.priority, status: "not_started", completed: false,
    }).select().single();
    if (data) {
      setTasks(prev => ({ ...prev, [selectedProject.id]: [...(prev[selectedProject.id] || []), data] }));
      setNewTask({ description: "", due_at: "", priority: "medium" });
      await logActivity(selectedProject.id, `Task added: "${data.description}"`, { priority: data.priority });
    }
    setSavingTask(false);
  };

  const toggleTask = async (task: any) => {
    const u = { ...task, completed: !task.completed };
    await supabase.from("tasks").update({ completed: u.completed }).eq("id", task.id);
    setTasks(prev => ({ ...prev, [task.project_id]: prev[task.project_id].map(t => t.id === task.id ? u : t) }));
    if (u.completed) await logActivity(task.project_id, `Task completed: "${task.description}"`);
  };

  const deleteTask = async (task: any) => {
    await supabase.from("tasks").delete().eq("id", task.id);
    setTasks(prev => ({ ...prev, [task.project_id]: prev[task.project_id].filter(t => t.id !== task.id) }));
  };

  // ── UNIFIED addNote — writes to shared notes table ──
  const addNote = async () => {
    if (!newNote.trim() || !selectedProject || !user) return;
    setSavingNote(true);
    const now = new Date().toISOString();
    const { data } = await supabase.from("notes").insert({
      user_id: user.id,
      project_id: selectedProject.id,
      body: newNote.trim(),
      source: "pipeline",
      created_at: now,
      updated_at: now,
    }).select().single();
    if (data) {
      setNotes(prev => ({ ...prev, [selectedProject.id]: [data, ...(prev[selectedProject.id] || [])] }));
      setNewNote("");
      await logActivity(selectedProject.id, `Note added`, { preview: data.body.slice(0, 60) });
    }
    setSavingNote(false);
  };

  const deleteNote = async (note: any) => {
    await supabase.from("notes").delete().eq("id", note.id).eq("user_id", user.id);
    setNotes(prev => ({ ...prev, [note.project_id]: prev[note.project_id].filter(n => n.id !== note.id) }));
  };

  const signOut = async () => { await supabase.auth.signOut(); router.push("/"); };

  // ── Derived stats ──
  const totalGDV = projects.reduce((s, p) => s + (p.appraisals?.[0]?.gdv || 0), 0);
  const avgPoC = (() => { const v = projects.filter(p => p.appraisals?.[0]?.profit_on_cost); return v.length ? v.reduce((s, p) => s + (p.appraisals[0].profit_on_cost || 0), 0) / v.length : 0; })();
  const active = projects.filter(p => p.pipeline_stage !== "completed").length;
  const done = projects.filter(p => p.pipeline_stage === "completed").length;
  const openTasks = Object.values(tasks).flat().filter(t => !t.completed).length;

  if (loading) return (
    <>
      <style>{PIPELINE_CSS}</style>
      <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('val-theme')||'dark';document.documentElement.setAttribute('data-theme',t);})()` }} />
      <div className="pipe-loading">
        <div className="pipe-loading__brand">Valora</div>
        <div className="pipe-loading__spinner" />
        <div className="pipe-loading__label">Loading pipeline…</div>
      </div>
    </>
  );

  return (
    <div className="val-app">
      <style>{PIPELINE_CSS}</style>
      <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('val-theme')||'dark';document.documentElement.setAttribute('data-theme',t);})()` }} />

      {/* ── SIDEBAR (matches pipeline.html mock) ── */}
      <aside className="val-sidebar">
        <div className="val-sidebar__brand">
          <div className="val-sidebar__brand-name">Valora</div>
          <div className="val-sidebar__brand-sub">Development Appraisal</div>
        </div>

        <div className="val-sidebar__section-title">My Work</div>
        <nav className="val-sidebar__nav">
          <button className="val-nav-item" onClick={() => router.push("/dashboard")}>Portfolio</button>
          <button className="val-nav-item val-nav-item--active">Pipeline</button>
          <button className="val-nav-item" onClick={() => router.push("/tasks")}>Tasks</button>
          <button className="val-nav-item" onClick={() => router.push("/notes")}>Notes</button>
          <button className="val-nav-item" onClick={() => router.push("/learn")}>+ Learn</button>
        </nav>

        <div className="val-sidebar__section-title">Team</div>
        <nav className="val-sidebar__nav">
          <button className="val-nav-item" onClick={() => router.push("/workspace")}>◆ Workspace</button>
          <button className="val-nav-item" onClick={() => router.push("/team")}>Team</button>
        </nav>

        <div className="val-sidebar__footer">
          <div className="val-sidebar__footer-email">{user?.email}</div>
          <div className="val-sidebar__footer-row">
            <button className="val-nav-item" onClick={signOut} style={{ padding: "4px 0", fontSize: "var(--val-size-12)" }}>Sign Out</button>
            <button className="val-theme-toggle" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} title={theme === "dark" ? "Switch to light" : "Switch to dark"}>
              <span>{theme === "dark" ? "◐" : "◑"}</span>
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="val-main">
        <main className="val-content">

          {/* Page header */}
          <div className="val-page-header">
            <div>
              <h1 className="val-page-header__title">Deal Pipeline</h1>
              <div className="val-page-header__sub">
                {projects.length} deal{projects.length !== 1 ? "s" : ""} · drag to move stage
              </div>
            </div>
            <div className="val-page-header__actions">
              {openTasks > 0 && (
                <span className="val-chip val-chip--amber" style={{ fontSize: "var(--val-size-11)" }}>
                  {openTasks} open
                </span>
              )}
              <button className="val-btn val-btn--primary" onClick={() => router.push("/dashboard")}>+ New</button>
            </div>
          </div>

          {/* Stat strip */}
          <div className="val-stat-strip">
            <div className="val-stat">
              <div className="val-stat__label">Active</div>
              <div className="val-stat__value val-v--blue">{active}</div>
            </div>
            <div className="val-stat">
              <div className="val-stat__label">Done</div>
              <div className={`val-stat__value ${done > 0 ? "val-v--green" : ""}`}>{done}</div>
            </div>
            <div className="val-stat">
              <div className="val-stat__label">GDV</div>
              <div className="val-stat__value val-v--green">{fmt(totalGDV)}</div>
            </div>
            <div className="val-stat">
              <div className="val-stat__label">Avg PoC</div>
              <div className={`val-stat__value ${avgPoC > 0.2 ? "val-v--green" : avgPoC > 0.1 ? "val-v--amber" : "val-v--mid"}`}>{fmtPct(avgPoC)}</div>
            </div>
            <div className="val-stat">
              <div className="val-stat__label">Tasks</div>
              <div className={`val-stat__value ${openTasks > 0 ? "val-v--amber" : "val-v--dim"}`}>{openTasks}</div>
            </div>
          </div>

          {/* Empty state */}
          {projects.length === 0 && (
            <div className="pipe-empty">
              <div className="pipe-empty__icon">◆</div>
              <div className="pipe-empty__title">No deals in pipeline</div>
              <div className="pipe-empty__sub">Create your first appraisal to start tracking deals.</div>
              <button className="val-btn val-btn--primary" onClick={() => router.push("/dashboard")}>+ Create First Appraisal</button>
            </div>
          )}

          {/* Kanban board */}
          {projects.length > 0 && (
            <div className="kb-board">
              {STAGES.map(stage => {
                const cols = projects.filter(p => (p.pipeline_stage || "prospect") === stage.id);
                const gdv = cols.reduce((s, p) => s + (p.appraisals?.[0]?.gdv || 0), 0);
                return (
                  <div key={stage.id}
                    className={`kb-col ${dragOverCol === stage.id ? "kb-col--drag-over" : ""}`}
                    onDragOver={e => onDragOver(e, stage.id)}
                    onDrop={e => onDrop(e, stage.id)}>

                    <div className="kb-col__head">
                      <span className={`kb-col__dot kb-col__dot--${stage.dotMod}`} />
                      <span className="kb-col__label">{stage.label}</span>
                      <span className="kb-col__count">{cols.length}</span>
                    </div>
                    {gdv > 0 && <div className="kb-col__total">{fmt(gdv)}</div>}

                    {cols.length === 0 && <div className="kb-drop">Drop here</div>}

                    {cols.map(project => {
                      const latest = project.appraisals?.[0];
                      const poc = latest?.profit_on_cost;
                      const sym = CURRENCY_SYMBOLS[project.currency] || "£";
                      const pillMod = ASSET_PILL[project.asset_type] || "btr";
                      const assetLabel = ASSET_LABEL[project.asset_type] || project.asset_type || "BTR";
                      const pt = (tasks[project.id] || []).filter(t => !t.completed);
                      const pn = (notes[project.id] || []).length;
                      const pocClass = poc > 0.2 ? "val-v--green" : poc > 0.1 ? "val-v--amber" : "val-v--red";
                      return (
                        <div key={project.id}
                          className={`kb-card ${draggingId === project.id ? "kb-card--dragging" : ""} ${selectedProject?.id === project.id ? "kb-card--selected" : ""}`}
                          draggable
                          onDragStart={e => onDragStart(e, project)}
                          onDragEnd={onDragEnd}
                          onClick={() => openPanel(project, "tasks")}>

                          {pt.length > 0 && <div className="kb-card__task-count">{pt.length}</div>}

                          <span className={`val-type-pill val-type-pill--${pillMod}`} style={{ alignSelf: "flex-start" }}>
                            {assetLabel}
                          </span>

                          <div>
                            <h3 className="kb-card__title">{project.name || "Untitled"}</h3>
                            <div className="kb-card__loc">{project.location || "—"}</div>
                          </div>

                          {latest ? (
                            <div className="kb-card__row">
                              <span className="kb-card__row-left">{fmt(latest.gdv, sym)}</span>
                              <span className={pocClass}>{fmtPct(poc)}</span>
                            </div>
                          ) : (
                            <div style={{ fontSize: "var(--val-size-11)", color: "var(--val-text-dim)" }}>No appraisal yet</div>
                          )}

                          {(pt.length > 0 || pn > 0) && (
                            <div className="kb-card__mini-stats">
                              {pt.length > 0 && <span className="kb-card__mini-stat" style={{ color: "var(--val-amber)" }}>✓ {pt.length}</span>}
                              {pn > 0 && <span className="kb-card__mini-stat">📝 {pn}</span>}
                            </div>
                          )}

                          <select className="kb-select"
                            value={project.pipeline_stage || "prospect"}
                            onClick={e => e.stopPropagation()}
                            onChange={e => { e.stopPropagation(); moveProject(project.id, e.target.value); }}>
                            {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                          </select>

                          <div className="kb-card__actions" onClick={e => e.stopPropagation()}>
                            <button className="kb-card__btn" onClick={e => { e.stopPropagation(); openPanel(project, "tasks"); }}>Tasks</button>
                            <button className="kb-card__btn" onClick={e => { e.stopPropagation(); openPanel(project, "notes"); }}>Notes</button>
                            <button className="kb-card__btn" onClick={e => { e.stopPropagation(); openProject(project); }}>Open →</button>
                          </div>
                        </div>
                      );
                    })}

                    <button className="kb-col__add" onClick={() => router.push("/dashboard")}>+ Add</button>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ── SIDE PANEL ── */}
      {selectedProject && (
        <>
          <div className="side-panel-overlay" onClick={() => setSelectedProject(null)} />
          <aside className="side-panel">
            <div className="side-panel__head">
              <div className="side-panel__title-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="side-panel__title">{selectedProject.name || "Untitled"}</div>
                  <div className="side-panel__sub">
                    {selectedProject.location || "—"} · {ASSET_LABEL[selectedProject.asset_type] || selectedProject.asset_type}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "var(--val-s-2)", flexShrink: 0 }}>
                  <button className="val-btn val-btn--secondary val-btn--sm" onClick={() => openProject(selectedProject)}>Open ↗</button>
                  <button className="side-panel__close" onClick={() => setSelectedProject(null)}>×</button>
                </div>
              </div>
              <div className="side-panel__tabs">
                {(["tasks", "notes", "activity"] as const).map(tab => (
                  <button key={tab}
                    className={`side-panel__tab ${panelTab === tab ? "side-panel__tab--active" : ""}`}
                    onClick={() => setPanelTab(tab)}>
                    {tab === "tasks"
                      ? `Tasks (${(tasks[selectedProject.id] || []).filter(t => !t.completed).length})`
                      : tab === "notes"
                        ? `Notes (${(notes[selectedProject.id] || []).length})`
                        : "Activity"}
                  </button>
                ))}
              </div>
            </div>

            <div className="side-panel__body">
              {/* ── TASKS ── */}
              {panelTab === "tasks" && (
                <>
                  <div className="side-panel__form">
                    <div className="val-label">New Task</div>
                    <textarea
                      className="side-panel__textarea"
                      placeholder="Task description…"
                      value={newTask.description}
                      onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                      style={{ height: 64 }} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--val-s-2)" }}>
                      <div>
                        <div className="val-label">Due</div>
                        <input
                          className="val-input"
                          type="datetime-local"
                          value={newTask.due_at}
                          onChange={e => setNewTask(p => ({ ...p, due_at: e.target.value }))}
                          style={{ fontSize: "var(--val-size-12)", colorScheme: theme as any }} />
                      </div>
                      <div>
                        <div className="val-label">Priority</div>
                        <select
                          className="val-input"
                          value={newTask.priority}
                          onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}
                          style={{ fontSize: "var(--val-size-12)", cursor: "pointer" }}>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>
                    <button
                      className="val-btn val-btn--primary"
                      onClick={addTask}
                      disabled={!newTask.description.trim() || savingTask}
                      style={{ width: "100%" }}>
                      {savingTask ? "Adding…" : "+ Add Task"}
                    </button>
                  </div>

                  {(tasks[selectedProject.id] || []).length === 0 ? (
                    <div className="side-panel__empty">No tasks yet</div>
                  ) : (
                    <>
                      {(tasks[selectedProject.id] || []).filter(t => !t.completed).map(task => {
                        const overdue = task.due_at && new Date(task.due_at) < new Date();
                        const priMod = (task.priority as string) || "medium";
                        return (
                          <div key={task.id} className="task-item">
                            <button className="task-item__check" onClick={() => toggleTask(task)} aria-label="Complete" />
                            <div className="task-item__body">
                              <div className="task-item__desc">{task.description}</div>
                              <div className="task-item__meta">
                                <span className={`pri-chip pri-chip--${priMod}`}>{PRIORITY_LABEL[priMod] || priMod}</span>
                                {task.due_at && (
                                  <span className={`task-item__due ${overdue ? "task-item__due--overdue" : ""}`}>
                                    {overdue ? "⚠ " : ""}{fmtDateTime(task.due_at)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button className="task-item__delete" onClick={() => deleteTask(task)}>×</button>
                          </div>
                        );
                      })}

                      {(tasks[selectedProject.id] || []).filter(t => t.completed).length > 0 && (
                        <>
                          <div className="side-panel__section-title">Completed</div>
                          {(tasks[selectedProject.id] || []).filter(t => t.completed).map(task => (
                            <div key={task.id} className="task-item task-item--done">
                              <button className="task-item__check task-item__check--checked" onClick={() => toggleTask(task)} aria-label="Reopen" />
                              <div className="task-item__body">
                                <div className="task-item__desc">{task.description}</div>
                              </div>
                              <button className="task-item__delete" onClick={() => deleteTask(task)}>×</button>
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </>
              )}

              {/* ── NOTES ── */}
              {panelTab === "notes" && (
                <>
                  <div className="side-panel__form">
                    <div className="val-label">New Note</div>
                    <textarea
                      className="side-panel__textarea"
                      placeholder="Add a note…"
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      style={{ height: 96, lineHeight: "var(--val-lh-loose)" }} />
                    <button
                      className="val-btn val-btn--primary"
                      onClick={addNote}
                      disabled={!newNote.trim() || savingNote}
                      style={{ width: "100%" }}>
                      {savingNote ? "Saving…" : "+ Add Note"}
                    </button>
                  </div>

                  {(notes[selectedProject.id] || []).length === 0 ? (
                    <div className="side-panel__empty">No notes yet</div>
                  ) : (
                    (notes[selectedProject.id] || []).map(note => (
                      <div key={note.id} className="note-item">
                        <div className="note-item__head">
                          <span className="note-item__date">{fmtDate(note.created_at)}</span>
                          <button className="task-item__delete" onClick={() => deleteNote(note)}>×</button>
                        </div>
                        <div className="note-item__body">{note.body}</div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* ── ACTIVITY ── */}
              {panelTab === "activity" && (
                <>
                  {activity.filter(a => a.project_id === selectedProject.id).length === 0 ? (
                    <div className="side-panel__empty">No activity yet</div>
                  ) : (
                    activity.filter(a => a.project_id === selectedProject.id).map(act => (
                      <div key={act.id} className="activity-row">
                        <div className="activity-row__icon">
                          {act.action.startsWith("Moved") ? "→"
                            : act.action.startsWith("Task completed") ? "✓"
                            : act.action.startsWith("Task added") ? "✚"
                            : "📝"}
                        </div>
                        <div className="activity-row__body">
                          <div className="activity-row__action">{act.action}</div>
                          {act.meta?.preview && (
                            <div className="activity-row__preview">
                              "{act.meta.preview}{act.meta.preview?.length >= 60 ? "…" : ""}"
                            </div>
                          )}
                          <div className="activity-row__time">{fmtDateTime(act.created_at)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
