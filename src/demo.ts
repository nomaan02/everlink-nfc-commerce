/**
 * npm run demo
 * Walks through the whole journey against a local server: a paid order
 * arrives, a tag is created, the buyer claims it, and the NFC URL shows
 * their page. No Shopify store or accounts needed.
 */
import { readFileSync } from "node:fs";
import { createApp, listen } from "./server.js";
import { signWebhook } from "./shopify.js";
import { Store } from "./store.js";

const SECRET = "demo-webhook-secret";
const emails: { claimUrl: string; tagId: string }[] = [];
const config = {
  webhookSecret: SECRET,
  publicUrl: "",
  nfcSkuPrefix: "NFC-",
  store: new Store(),
  sendClaimEmail: (_to: string | undefined, claimUrl: string, tag: { id: string }) => emails.push({ claimUrl, tagId: tag.id }),
};
const server = createApp(config);
config.publicUrl = await listen(server);
const base = config.publicUrl;

const ok = (text: string) => console.log(`   ✓ ${text}`);
const step = (n: number, text: string) => console.log(`\n\x1b[1m${n}. ${text}\x1b[0m`);
const titleOf = (html: string) => /<h1>(.*?)<\/h1>/.exec(html)?.[1] ?? "";
const hook = (body: string, signature: string, id: string) =>
  fetch(`${base}/webhooks/orders-paid`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Hmac-Sha256": signature, "X-Shopify-Webhook-Id": id, "X-Shopify-Topic": "orders/paid" },
    body,
  });

try {
  const order = readFileSync("examples/order-paid.json", "utf8");

  step(1, "Shopify sends a signed orders/paid webhook (1 NFC ring + 1 gift box)");
  const first = await hook(order, signWebhook(order, SECRET), "demo-delivery-1");
  ok(`${first.status} ${await first.text()}  → one tag for the ring, none for the gift box`);
  const { claimUrl, tagId } = emails[0]!;
  ok(`claim link emailed to the buyer: ${claimUrl.replace(base, "")}`);

  step(2, "Shopify retries the same delivery");
  const retry = await hook(order, signWebhook(order, SECRET), "demo-delivery-1");
  ok(`${retry.status} "${await retry.text()}"  → still ${config.store.count()} tag, no duplicate`);

  step(3, "Someone sends a forged webhook");
  const forged = await hook(order, signWebhook(order, "wrong-secret"), "demo-delivery-2");
  ok(`${forged.status} "${await forged.text()}"  → rejected before the body is even parsed`);

  step(4, `The NFC chip opens /t/${tagId} before set-up`);
  ok(`"${titleOf(await (await fetch(`${base}/t/${tagId}`)).text())}"`);

  step(5, "The buyer opens the claim link and saves their page");
  const claim = await fetch(`${base}/claim`, {
    method: "POST",
    redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code: new URL(claimUrl).searchParams.get("code")!, title: "For Sam, on our anniversary", message: "Tap this any time you miss me.", link: "https://example.com/our-song" }),
  });
  const cookie = claim.headers.get("set-cookie")?.split(";")[0] ?? "";
  ok(`${claim.status} redirect to ${claim.headers.get("location")}, owner cookie set (HttpOnly)`);

  step(6, "Anyone tapping the piece now sees the page");
  ok(`"${titleOf(await (await fetch(`${base}/t/${tagId}`)).text())}"`);

  step(7, "Security checks");
  const reuse = await fetch(`${base}/claim`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code: new URL(claimUrl).searchParams.get("code")!, title: "x", message: "x" }) });
  ok(`claim link reused → ${reuse.status} (single use)`);
  ok(`edit without owner cookie → ${(await fetch(`${base}/t/${tagId}/edit`)).status}`);
  ok(`edit with owner cookie → ${(await fetch(`${base}/t/${tagId}/edit`, { headers: { cookie } })).status}`);
} finally {
  server.close();
}
