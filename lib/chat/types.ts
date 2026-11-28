// Shapes of dna-admin's public storefront chat and visit API
// (/api/v1/storefront, identified by the X-Visitor-Token header).

/** inbound: written by the customer; outbound: a staff reply. */
export type ChatDirection = "inbound" | "outbound";

export interface ChatAttachment {
  url: string;
  filename?: string;
  content_type?: string;
}

export interface ChatMessage {
  id: string;
  direction: ChatDirection;
  body: string;
  author?: { kind?: string; name?: string | null } | null;
  attachments?: ChatAttachment[];
  created_at: string;
  read_at?: string | null;
}

export interface ChatConversation {
  id: string;
  status?: string;
  customer?: { name?: string | null; email?: string | null } | null;
}

/** GET chat (and GET chat/resume). */
export interface ChatInfo {
  conversation: ChatConversation | null;
  greeting: string | null;
  online: boolean | null;
  /** Sent by resume when the link belongs to another visitor token. */
  visitor_token?: string | null;
}

export interface VisitPayload {
  url: string;
  title: string;
  referrer: string;
  utm?: { source?: string; medium?: string; campaign?: string };
  order_token?: string;
}

export interface VisitResult {
  visitor_token: string | null;
  session_id: string | null;
}

export interface SendMessagePayload {
  body: string;
  name?: string;
  email?: string;
}
