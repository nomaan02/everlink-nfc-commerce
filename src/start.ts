/**
 * npm start
 * Runs the app with settings from .env. Use a tunnel (e.g. `ngrok http 3000`)
 * to receive real webhooks from a Shopify development store.
 */
import { createApp, listen } from "./server.js";
import { Store } from "./store.js";

try {
  process.loadEnvFile();
} catch {
  // no .env: use real environment variables
}

const secret = process.env.SHOPIFY_WEBHOOK_SECRET ?? "";
if (!secret) throw new Error("Set SHOPIFY_WEBHOOK_SECRET in .env (see .env.example)");

const config = {
  webhookSecret: secret,
  publicUrl: process.env.PUBLIC_URL ?? "http://localhost:3000",
  nfcSkuPrefix: process.env.NFC_SKU_PREFIX ?? "NFC-",
  store: new Store(process.env.DATA_FILE || undefined),
  sendClaimEmail: (to: string | undefined, claimUrl: string) => console.log(`[email] to ${to ?? "(no email)"}: set up your page at ${claimUrl}`),
};
const url = await listen(createApp(config), Number(process.env.PORT ?? 3000));
console.log(`Listening on ${url}. Shopify webhook: POST ${config.publicUrl}/webhooks/orders-paid`);
