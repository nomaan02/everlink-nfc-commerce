import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import type { Server } from "node:http";
import { createApp, listen } from "../src/server.js";
import { signWebhook } from "../src/shopify.js";
import { sha256, Store } from "../src/store.js";

const SECRET = "test-secret";
const emails: { claimUrl: string; tagId: string }[] = [];
const store = new Store();
const config = {
  webhookSecret: SECRET,
  publicUrl: "",
  nfcSkuPrefix: "NFC-",
  store,
  sendClaimEmail: (_to: string | undefined, claimUrl: string, tag: { id: string }) => emails.push({ claimUrl, tagId: tag.id }),
};
let server: Server;
let base = "";
before(async () => {
  server = createApp(config);
  base = config.publicUrl = await listen(server);
});
after(() => server.close());

const order = JSON.stringify({ id: 9, name: "#1009", email: "a@example.com", line_items: [{ id: 1, sku: "NFC-PENDANT", quantity: 2, title: "Pendant" }] });
const send = (body: string, signature: string, id: string) =>
  fetch(`${base}/webhooks/orders-paid`, { method: "POST", headers: { "X-Shopify-Hmac-Sha256": signature, "X-Shopify-Webhook-Id": id }, body });
const claimForm = (code: string, title = "Hello") =>
  fetch(`${base}/claim`, { method: "POST", redirect: "manual", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, title, message: "Hi <script>alert(1)</script>", link: "javascript:alert(1)" }) });

test("a paid order creates one tag per NFC item, once", async () => {
  assert.equal((await send(order, signWebhook(order, SECRET), "d1")).status, 200);
  assert.equal((await send(order, signWebhook(order, SECRET), "d1")).status, 200);
  assert.equal(store.count(), 2);
  assert.equal(emails.length, 2);
});

test("forged webhooks are rejected", async () => {
  assert.equal((await send(order, signWebhook(order, "nope"), "d2")).status, 401);
  assert.equal(store.count(), 2);
});

test("claim codes are stored only as hashes", () => {
  const { claimUrl, tagId } = emails[0]!;
  const code = new URL(claimUrl).searchParams.get("code")!;
  assert.equal(store.get(tagId)!.claimCodeHash, sha256(code));
  assert.ok(!JSON.stringify(store.get(tagId)).includes(code));
});

test("claiming is single use, and user input is escaped", async () => {
  const { claimUrl, tagId } = emails[0]!;
  const code = new URL(claimUrl).searchParams.get("code")!;
  const first = await claimForm(code);
  assert.equal(first.status, 303);
  assert.match(first.headers.get("set-cookie") ?? "", /HttpOnly/);
  assert.equal((await claimForm(code, "Hijack")).status, 400);

  const html = await (await fetch(`${base}/t/${tagId}`)).text();
  assert.match(html, /<h1>Hello<\/h1>/);
  assert.ok(!html.includes("<script>alert(1)</script>"));
  assert.ok(!html.includes("javascript:"));
});

test("only the owner can edit", async () => {
  const { claimUrl, tagId } = emails[1]!;
  const res = await claimForm(new URL(claimUrl).searchParams.get("code")!);
  const cookie = res.headers.get("set-cookie")!.split(";")[0]!;
  assert.equal((await fetch(`${base}/t/${tagId}/edit`)).status, 403);
  assert.equal((await fetch(`${base}/t/${tagId}/edit`, { headers: { cookie } })).status, 200);
  assert.equal((await fetch(`${base}/t/${emails[0]!.tagId}/edit`, { headers: { cookie } })).status, 403);
});

test("unknown tags return 404", async () => {
  assert.equal((await fetch(`${base}/t/doesnotexist`)).status, 404);
});
