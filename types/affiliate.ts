// /types/affiliate.ts
export type AffiliateAccounts = {
  user_id: string;
  amazon_tag?: string | null;
  ebay_campid?: string | null;
  cj_pid?: string | null;
  shareasale_affiliate_id?: string | null;
  other?: Record<string, string> | null;
  updated_at?: string | null;
};
