// /lib/validation/affiliate.ts
import { z } from "zod";

/** Zod schema for affiliate accounts + parse "other" key=value lines */
export const AffiliateAccountsSchema = z
  .object({
    amazon_tag: z.string().trim().max(64).optional(),
    ebay_campid: z.string().trim().max(64).optional(),
    cj_pid: z.string().trim().max(64).optional(),
    shareasale_affiliate_id: z.string().trim().max(64).optional(),
    other_raw: z.string().trim().max(10_000).optional().default(""),
  })
  .transform((data) => {
    const other: Record<string, string> = {};
    if (data.other_raw) {
      data.other_raw
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .forEach((line) => {
          const idx = line.indexOf("=");
          if (idx > 0) {
            const key = line.slice(0, idx).trim();
            const value = line.slice(idx + 1).trim();
            if (key) other[key] = value;
          }
        });
    }
    return {
      amazon_tag: data.amazon_tag || "",
      ebay_campid: data.ebay_campid || "",
      cj_pid: data.cj_pid || "",
      shareasale_affiliate_id: data.shareasale_affiliate_id || "",
      other: Object.keys(other).length ? other : undefined,
    };
  });
