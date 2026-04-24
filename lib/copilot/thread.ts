/**
 * Valora — Persistent Copilot client helpers
 *
 * Typed wrappers around Supabase queries for the Copilot data layer.
 * Use these from Next.js server components, API routes, and client components.
 *
 * For server-side (API routes / server actions) — use a service-role client
 * to bypass RLS for AI-generated responses:
 *
 *   import { createClient } from '@supabase/supabase-js';
 *   const supabase = createClient(url, SERVICE_ROLE_KEY);
 *
 * For client-side — use the anon client. RLS policies enforce access.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Artifact,
  ArtifactPayload,
  ArtifactType,
  AssumptionEvent,
  ConfidenceLevel,
  CopilotThread,
  Message,
  MessageAttachment,
  MessageContent,
  MessageMetadata,
  MessageRole,
  MessageWithArtifacts,
  ThreadSummary,
} from '@/types/copilot';

// -----------------------------------------------------------------------------
// Thread queries
// -----------------------------------------------------------------------------

/**
 * Fetch the thread attached to a project.
 * Projects auto-create a thread on insert (see DB trigger), so this always
 * returns a row for any valid project the current user can read.
 */
export async function getThreadForProject(
  supabase: SupabaseClient,
  projectId: string
): Promise<CopilotThread | null> {
  const { data, error } = await supabase
    .from('copilot_threads')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Summary stats for a thread — used in the sidebar header and on project cards.
 */
export async function getThreadSummary(
  supabase: SupabaseClient,
  threadId: string
): Promise<ThreadSummary | null> {
  const { data: thread, error: threadError } = await supabase
    .from('copilot_threads')
    .select('*')
    .eq('id', threadId)
    .maybeSingle();

  if (threadError) throw threadError;
  if (!thread) return null;

  const { data: stats, error: statsError } = await supabase
    .rpc('fn_thread_summary_stats', { p_thread_id: threadId })
    .single<{
      message_count: number;
      contributor_count: number;
      first_message_at: string | null;
    }>();

  // If the RPC isn't defined yet, fall back to separate counts
  if (statsError) {
    const { count: messageCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('thread_id', threadId)
      .is('deleted_at', null);

    return {
      thread,
      message_count: messageCount ?? 0,
      contributor_count: 0,
      pinned_count: thread.pinned_message_ids.length,
      first_message_at: null,
      last_message_at: thread.last_message_at,
    };
  }

  return {
    thread,
    message_count: stats.message_count,
    contributor_count: stats.contributor_count,
    pinned_count: thread.pinned_message_ids.length,
    first_message_at: stats.first_message_at,
    last_message_at: thread.last_message_at,
  };
}

// -----------------------------------------------------------------------------
// Message queries
// -----------------------------------------------------------------------------

export interface GetMessagesOptions {
  /** Default 100. Paginate for long threads. */
  limit?: number;
  /** For scrolling back through older messages */
  before?: string; // ISO timestamp
  /** Exclude comments (threaded replies) from top-level results */
  excludeComments?: boolean;
}

/**
 * Fetch messages for a thread ordered oldest-first, with their artifacts joined.
 * Soft-deleted messages are excluded by default.
 */
export async function getMessagesForThread(
  supabase: SupabaseClient,
  threadId: string,
  options: GetMessagesOptions = {}
): Promise<MessageWithArtifacts[]> {
  const { limit = 100, before, excludeComments = true } = options;

  let query = supabase
    .from('messages')
    .select(
      `
        *,
        artifacts (
          id,
          thread_id,
          message_id,
          type,
          payload,
          created_at,
          supersedes_id
        )
      `
    )
    .eq('thread_id', threadId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (before) query = query.lt('created_at', before);
  if (excludeComments) query = query.neq('role', 'comment');

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []) as MessageWithArtifacts[];
}

/**
 * Fetch comments (threaded replies) for a given parent message.
 */
export async function getCommentsForMessage(
  supabase: SupabaseClient,
  parentMessageId: string
): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('parent_message_id', parentMessageId)
    .eq('role', 'comment')
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Message[];
}

// -----------------------------------------------------------------------------
// Writes — user-initiated
// -----------------------------------------------------------------------------

export interface AddUserMessageInput {
  threadId: string;
  content: MessageContent;
  attachments?: MessageAttachment[];
  metadata?: MessageMetadata;
}

/**
 * Add a user message to a thread. `author_id` is set from auth.uid()
 * automatically; do not pass it.
 */
export async function addUserMessage(
  supabase: SupabaseClient,
  input: AddUserMessageInput
): Promise<Message> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .insert({
      thread_id: input.threadId,
      role: 'user' as MessageRole,
      author_id: user.id,
      content: input.content,
      attachments: input.attachments ?? [],
      metadata: input.metadata ?? {},
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Message;
}

/**
 * Add a comment (threaded reply) to an existing message.
 */
export async function addComment(
  supabase: SupabaseClient,
  parentMessageId: string,
  threadId: string,
  text: string
): Promise<Message> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .insert({
      thread_id: threadId,
      parent_message_id: parentMessageId,
      role: 'comment' as MessageRole,
      author_id: user.id,
      content: { text },
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Message;
}

// -----------------------------------------------------------------------------
// Writes — Valora-initiated (use service-role client on the server)
// -----------------------------------------------------------------------------

export interface AddValoraMessageInput {
  threadId: string;
  content: MessageContent;
  confidence: ConfidenceLevel;
  metadata?: MessageMetadata;
  /** Optional: pass artifacts to insert atomically in the same request */
  artifacts?: Array<{ type: ArtifactType; payload: ArtifactPayload }>;
}

/**
 * Insert a Valora (AI) message and its artifacts in one go.
 * Author is null; role is 'valora'.
 *
 * Call this from API routes / server actions using the SERVICE_ROLE key —
 * RLS permits `author_id IS NULL` for system-produced messages.
 */
export async function addValoraMessage(
  supabase: SupabaseClient,
  input: AddValoraMessageInput
): Promise<{ message: Message; artifacts: Artifact[] }> {
  const { data: message, error: msgError } = await supabase
    .from('messages')
    .insert({
      thread_id: input.threadId,
      role: 'valora' as MessageRole,
      author_id: null,
      content: input.content,
      confidence: input.confidence,
      metadata: input.metadata ?? {},
    })
    .select('*')
    .single();

  if (msgError) throw msgError;

  if (!input.artifacts || input.artifacts.length === 0) {
    return { message: message as Message, artifacts: [] };
  }

  const { data: artifacts, error: artError } = await supabase
    .from('artifacts')
    .insert(
      input.artifacts.map((a) => ({
        thread_id: input.threadId,
        message_id: (message as Message).id,
        type: a.type,
        payload: a.payload,
      }))
    )
    .select('*');

  if (artError) throw artError;

  return {
    message: message as Message,
    artifacts: (artifacts ?? []) as Artifact[],
  };
}

// -----------------------------------------------------------------------------
// Pin / unpin
// -----------------------------------------------------------------------------

export async function pinMessage(
  supabase: SupabaseClient,
  threadId: string,
  messageId: string
): Promise<void> {
  const { data: thread, error: readError } = await supabase
    .from('copilot_threads')
    .select('pinned_message_ids')
    .eq('id', threadId)
    .single();

  if (readError) throw readError;

  if (!thread.pinned_message_ids.includes(messageId)) {
    const { error: writeError } = await supabase
      .from('copilot_threads')
      .update({
        pinned_message_ids: [...thread.pinned_message_ids, messageId],
      })
      .eq('id', threadId);

    if (writeError) throw writeError;
  }
}

export async function unpinMessage(
  supabase: SupabaseClient,
  threadId: string,
  messageId: string
): Promise<void> {
  const { data: thread, error: readError } = await supabase
    .from('copilot_threads')
    .select('pinned_message_ids')
    .eq('id', threadId)
    .single();

  if (readError) throw readError;

  const { error: writeError } = await supabase
    .from('copilot_threads')
    .update({
      pinned_message_ids: thread.pinned_message_ids.filter(
        (id: string) => id !== messageId
      ),
    })
    .eq('id', threadId);

  if (writeError) throw writeError;
}

// -----------------------------------------------------------------------------
// Soft-delete
// -----------------------------------------------------------------------------

export async function softDeleteMessage(
  supabase: SupabaseClient,
  messageId: string
): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', messageId);

  if (error) throw error;
}

// -----------------------------------------------------------------------------
// Assumption tracking
// -----------------------------------------------------------------------------

export interface LogAssumptionChangeInput {
  threadId: string;
  projectId: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  triggeredByMessageId?: string;
}

export async function logAssumptionChange(
  supabase: SupabaseClient,
  input: LogAssumptionChangeInput
): Promise<AssumptionEvent> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('assumption_events')
    .insert({
      thread_id: input.threadId,
      project_id: input.projectId,
      field: input.field,
      old_value: input.oldValue,
      new_value: input.newValue,
      triggered_by_message_id: input.triggeredByMessageId ?? null,
      author_id: user?.id ?? null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as AssumptionEvent;
}

// -----------------------------------------------------------------------------
// Realtime subscription
// -----------------------------------------------------------------------------

/**
 * Subscribe to new messages and artifacts for a thread.
 * Returns an unsubscribe function — call it when the component unmounts.
 *
 * Usage (React):
 *
 *   useEffect(() => {
 *     const unsubscribe = subscribeToThread(supabase, threadId, {
 *       onMessage: (msg) => setMessages((prev) => [...prev, msg]),
 *       onArtifact: (art) => ...
 *     });
 *     return unsubscribe;
 *   }, [threadId]);
 */
export function subscribeToThread(
  supabase: SupabaseClient,
  threadId: string,
  handlers: {
    onMessage?: (msg: Message) => void;
    onMessageUpdate?: (msg: Message) => void;
    onArtifact?: (artifact: Artifact) => void;
  }
): () => void {
  const channel = supabase
    .channel(`thread:${threadId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `thread_id=eq.${threadId}`,
      },
      (payload) => {
        handlers.onMessage?.(payload.new as Message);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `thread_id=eq.${threadId}`,
      },
      (payload) => {
        handlers.onMessageUpdate?.(payload.new as Message);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'artifacts',
        filter: `thread_id=eq.${threadId}`,
      },
      (payload) => {
        handlers.onArtifact?.(payload.new as Artifact);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}