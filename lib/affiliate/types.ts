/** Shapes of the affiliate API (dna-admin Spree::Api::V1::AffiliateController). Money arrives as decimals. */
import type { Amount, StatsPoint } from "./stats";

export type AffiliateStatus = "pending" | "approved" | "rejected" | "suspended";

export interface AffiliateApplication {
  website?: string | null;
  audience?: string | null;
  channels?: string[] | null;
  message?: string | null;
}

export interface AffiliateTotals {
  clicks: number;
  orders: number;
  conversion: number;
  pending: Amount;
  approved: Amount;
  paid: Amount;
  currency: string;
}

export interface Affiliate {
  status: AffiliateStatus;
  code: string;
  link: string;
  commission_bps: number;
  cookie_days: number;
  application: AffiliateApplication | null;
  payout_email?: string | null;
  totals: AffiliateTotals;
}

export interface AffiliateApplyInput {
  code?: string;
  website: string;
  audience: string;
  channels: string[];
  message: string;
  payout_email: string;
}

/** PATCH /affiliate: top-level fields; code only changes while pending. */
export type AffiliateUpdateInput = Partial<AffiliateApplyInput>;

export interface AffiliateStats {
  series: StatsPoint[];
}

export type CommissionState = "pending" | "approved" | "paid" | "void";

export interface AffiliateCommission {
  order_masked: string;
  base_amount: Amount;
  amount: Amount;
  state: CommissionState;
  created_at: string;
  approvable_at: string | null;
}

export interface CommissionsPage {
  rows: AffiliateCommission[];
  page: number;
  pages: number;
}

export interface AffiliatePayout {
  id?: number | string;
  amount: Amount;
  currency?: string;
  reference?: string | null;
  paid_at?: string | null;
  note?: string | null;
}

export interface PayoutsResponse {
  payouts: AffiliatePayout[];
}
