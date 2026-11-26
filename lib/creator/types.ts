// Shapes of dna-admin's creator endpoints: /api/v1/creator_application,
// /api/v1/creator and /api/v1/creator/products|sales|payouts. Kept tolerant:
// optional where the backend may omit a field.

import type { DigitalKind } from "../digitalKinds";
import type { AssetFile } from "../library";

export type { AssetFile };

export type ApplicationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "withdrawn";

export interface PortfolioLink {
  label: string;
  url: string;
}

export interface CreatorApplication {
  id: number;
  status: ApplicationStatus;
  display_name: string;
  kinds: DigitalKind[];
  portfolio_links: PortfolioLink[];
  about: string;
  review_note?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CreatorApplicationInput {
  display_name: string;
  kinds: DigitalKind[];
  portfolio_links: PortfolioLink[];
  about: string;
  /**
   * Signed ids of uploaded example files. The name is the backend's
   * (Spree::CreatorApplication#sample_upload_signed_ids).
   */
  sample_upload_signed_ids: string[];
}

export interface CreatorSummary {
  account: {
    revenue_share_bps: number;
    payout_email: string | null;
    status: "active" | "suspended";
  };
  profile: {
    handle: string | null;
    name: string | null;
    avatar_url: string | null;
  };
  totals: {
    gross: string | number;
    earned: string | number;
    payable: string | number;
    paid: string | number;
    currency: string;
  };
  counts: { products_live: number; products_in_review: number; sales: number };
}

export type ReviewState =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "changes_requested";

export interface CreatorProduct {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  price: string | number;
  currency: string;
  /** The working asset's kind; null before the product has an asset. */
  kind: DigitalKind | null;
  review_state: ReviewState;
  review_note: string | null;
  taxon_ids: number[];
  preview: { image_url: string | null; audio_url: string | null };
  asset: {
    id: number;
    version: number;
    status: "draft" | "published" | "retired";
    manifest: Record<string, any>;
    files: AssetFile[];
  } | null;
  live_asset_version: number | null;
  sales_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreatorProductInput {
  name: string;
  description: string;
  price: number;
  /** Create only: any `kind` (or `manifest`) in a PATCH counts as an asset change. */
  kind?: DigitalKind;
  taxon_ids: number[];
  preview_image_signed_id?: string | null;
  preview_audio_signed_id?: string | null;
  /**
   * Signed ids of newly uploaded files. Left out when the files didn't change,
   * so an approved product's live version isn't replaced by a no-op edit.
   */
  files?: string[];
  /**
   * When given, the draft's files become exactly these existing files
   * (attachment ids from `asset.files`) plus the new uploads in `files`.
   */
  keep_file_ids?: number[];
  /** Attachment ids to take out of the draft (unused: keep_file_ids covers it). */
  remove_file_ids?: number[];
  /** The app-defined manifest; sent on create, and on update only when it changed. */
  manifest?: Record<string, any>;
}

export interface SalesPoint {
  date: string;
  units: number;
  gross: string | number;
  earned: string | number;
}

export interface SalesRow {
  order_masked: string;
  product_id: number;
  units: number;
  gross: string | number;
  earned: string | number;
  state: "pending" | "payable" | "paid" | "void";
  created_at: string;
}

export interface CreatorSales {
  series: SalesPoint[];
  rows: SalesRow[];
}

export interface Payout {
  id: number;
  amount: string | number;
  currency: string;
  reference: string | null;
  paid_at: string | null;
  note?: string | null;
}
