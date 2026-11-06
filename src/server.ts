/**
 * The personal-page web app.
 *
 *   POST /webhooks/orders-paid   Shopify calls this when an order is paid
 *   GET  /claim?code=…           Link emailed to the buyer: set up the page
 *   POST /claim                  Claim the tag (single use) and save the page
 *   GET  /t/:tagId               The URL written onto the NFC chip
 *   GET  /t/:tagId/edit          Owner only: edit the page
 *   POST /t/:tagId/edit
 */
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { nfcLineItems, verifyWebhook, type OrderPaid } from "./shopify.js";
import { Store, type Tag } from "./store.js";

export type AppConfig = {
  webhookSecret: string;
  publicUrl: string;
  nfcSkuPrefix: string;
  store: Store;
  /** Stands in for an email provider. */
  sendClaimEmail: (to: string | undefined, claimUrl: string, tag: Tag) => void;
};

const MAX_BODY = 1_000_000;

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY) throw new Error("Body too large");
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks);
}

const escape = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

const safeLink = (raw: string | undefined) => {
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
};

function page(res: ServerResponse, status: number, title: string, body: string) {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8", "Content-Security-Policy": "default-src 'self'; style-src 'unsafe-inline'" });
  res.end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(title)}</title><style>body{font-family:system-ui,sans-serif;max-width:32rem;margin:3rem auto;padding:0 1rem;line-height:1.5;color:#222}
label{display:block;margin:.75rem 0 .25rem;font-weight:600}input,textarea{width:100%;padding:.5rem;font:inherit}button{margin-top:1rem;padding:.6rem 1.2rem;font:inherit}</style></head>
<body>${body}</body></html>`);
}

const pageForm = (action: string, values: { title?: string; message?: string; link?: string }, hidden = "") => `
<form method="post" action="${action}">${hidden}
<label for="title">Title</label><input id="title" name="title" maxlength="80" required value="${escape(values.title ?? "")}">
<label for="message">Message</label><textarea id="message" name="message" rows="5" maxlength="2000" required>${escape(values.message ?? "")}</textarea>
<label for="link">Link (optional)</label><input id="link" name="link" type="url" placeholder="https://" value="${escape(values.link ?? "")}">
<button type="submit">Save page</button></form>`;

const ownerCookie = (req: IncomingMessage, tagId: string) =>
  (req.headers.cookie ?? "").split(";").map((c) => c.trim().split("=")).find(([k]) => k === `owner_${tagId}`)?.[1];

export function createApp(config: AppConfig): Server {
  const { store } = config;

  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", config.publicUrl);
      const tagMatch = /^\/t\/([A-Za-z0-9_-]{6,32})(\/edit)?$/.exec(url.pathname);

      // ── Shopify webhook ──────────────────────────────────────────────
      if (req.method === "POST" && url.pathname === "/webhooks/orders-paid") {
        const raw = await readBody(req);
        if (!verifyWebhook(raw, req.headers["x-shopify-hmac-sha256"] as string | undefined, config.webhookSecret)) {
          res.writeHead(401).end("Invalid signature");
          return;
        }
        const webhookId = String(req.headers["x-shopify-webhook-id"] ?? "");
        if (webhookId && store.isProcessed(webhookId)) {
          res.writeHead(200).end("Already processed"); // Shopify retried; don't create duplicate tags
          return;
        }
        const order = JSON.parse(raw.toString("utf8")) as OrderPaid;
        let created = 0;
        for (const item of nfcLineItems(order, config.nfcSkuPrefix)) {
          for (let i = 0; i < item.quantity; i++) {
            const { tag, claimCode } = store.createTag(order.id, order.name, item.title);
            config.sendClaimEmail(order.email, `${config.publicUrl}/claim?code=${claimCode}`, tag);
            created++;
          }
        }
        if (webhookId) store.markProcessed(webhookId);
        res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ tagsCreated: created }));
        return;
      }

      // ── Claim ────────────────────────────────────────────────────────
      if (url.pathname === "/claim") {
        if (req.method === "GET") {
          const code = url.searchParams.get("code") ?? "";
          page(res, 200, "Set up your page", `<h1>Set up your page</h1><p>This is what people will see when they tap your piece.</p>
${pageForm("/claim", {}, `<input type="hidden" name="code" value="${escape(code)}">`)}`);
          return;
        }
        if (req.method === "POST") {
          const form = new URLSearchParams((await readBody(req)).toString("utf8"));
          const claimed = store.claim(form.get("code") ?? "");
          if (!claimed) {
            page(res, 400, "Link not valid", "<h1>This link has already been used or isn't valid</h1><p>If you've already set up your page, tap your piece to see it.</p>");
            return;
          }
          store.updatePage(claimed.tag.id, { title: form.get("title") ?? "", message: form.get("message") ?? "", link: safeLink(form.get("link") ?? undefined) });
          res.writeHead(303, {
            Location: `/t/${claimed.tag.id}`,
            "Set-Cookie": `owner_${claimed.tag.id}=${claimed.ownerToken}; HttpOnly; SameSite=Lax; Path=/t/${claimed.tag.id}; Max-Age=31536000`,
          }).end();
          return;
        }
      }

      // ── The URL on the NFC chip ──────────────────────────────────────
      if (tagMatch) {
        const [, tagId = "", edit] = tagMatch;
        const tag = store.get(tagId);
        if (!tag) {
          page(res, 404, "Not found", "<h1>We couldn't find this piece</h1>");
          return;
        }
        const owner = store.ownedBy(tagId, ownerCookie(req, tagId));

        if (edit) {
          if (!owner) {
            page(res, 403, "Not allowed", "<h1>Only the owner can edit this page</h1>");
            return;
          }
          if (req.method === "POST") {
            const form = new URLSearchParams((await readBody(req)).toString("utf8"));
            store.updatePage(tagId, { title: form.get("title") ?? "", message: form.get("message") ?? "", link: safeLink(form.get("link") ?? undefined) });
            res.writeHead(303, { Location: `/t/${tagId}` }).end();
            return;
          }
          page(res, 200, "Edit your page", `<h1>Edit your page</h1>${pageForm(`/t/${tagId}/edit`, tag.page ?? {})}`);
          return;
        }

        if (!tag.page) {
          page(res, 200, "Not set up yet", "<h1>This piece hasn't been set up yet</h1><p>The owner will find a set-up link in their order email.</p>");
          return;
        }
        const link = tag.page.link ? `<p><a href="${escape(tag.page.link)}" rel="noopener noreferrer">${escape(tag.page.link)}</a></p>` : "";
        const editLink = owner ? `<p><a href="/t/${tagId}/edit">Edit this page</a></p>` : "";
        page(res, 200, tag.page.title, `<h1>${escape(tag.page.title)}</h1><p>${escape(tag.page.message).replace(/\n/g, "<br>")}</p>${link}${editLink}`);
        return;
      }

      res.writeHead(404).end("Not found");
    } catch (err) {
      console.error(err);
      if (!res.headersSent) res.writeHead(500).end("Something went wrong");
    }
  });
}

export function listen(server: Server, port = 0): Promise<string> {
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(`http://127.0.0.1:${(server.address() as AddressInfo).port}`)));
}
