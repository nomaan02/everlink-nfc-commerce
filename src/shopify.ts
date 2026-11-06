/**
 * Shopify webhook helpers.
 *
 * Shopify signs every webhook: the X-Shopify-Hmac-Sha256 header is a base64
 * HMAC-SHA256 of the RAW request body, keyed with your app's client secret.
 * Verify against the raw bytes, before parsing JSON. Re-serialised JSON won't match.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export function signWebhook(rawBody: Buffer | string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody).digest("base64");
}

/** Constant-time comparison, so the check doesn't leak timing information. */
export function verifyWebhook(rawBody: Buffer, hmacHeader: string | undefined, secret: string): boolean {
  if (!hmacHeader || !secret) return false;
  const expected = Buffer.from(signWebhook(rawBody, secret), "base64");
  const received = Buffer.from(hmacHeader, "base64");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

/** The parts of an `orders/paid` payload this app uses. */
export type OrderPaid = {
  id: number;
  name: string; // e.g. "#1042"
  email?: string;
  line_items: { id: number; sku?: string | null; quantity: number; title: string }[];
};

/** NFC-enabled products are identified by SKU prefix (configurable). */
export function nfcLineItems(order: OrderPaid, skuPrefix: string) {
  return order.line_items.filter((item) => (item.sku ?? "").toUpperCase().startsWith(skuPrefix.toUpperCase()));
}
