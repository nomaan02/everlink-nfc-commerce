/**
 * Tag and page storage. In-memory by default, optionally saved to a JSON file.
 * A production app would use a real database. The rules are what matter here:
 *   - tag IDs are random and unguessable (they're printed into a public URL);
 *   - claim codes are single-use and stored only as a hash;
 *   - each webhook delivery is processed once, even if Shopify retries it.
 */
import { createHash, randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

export type PersonalPage = { title: string; message: string; link?: string; updatedAt: string };

export type Tag = {
  id: string;
  orderId: number;
  orderName: string;
  lineItemTitle: string;
  claimCodeHash: string | null; // null once claimed
  ownerTokenHash: string | null;
  page: PersonalPage | null;
  createdAt: string;
};

type State = { tags: Record<string, Tag>; processedWebhooks: string[] };

export const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const token = (bytes: number) => randomBytes(bytes).toString("base64url");

export class Store {
  private state: State = { tags: {}, processedWebhooks: [] };

  constructor(private readonly file?: string) {
    if (file && existsSync(file)) this.state = JSON.parse(readFileSync(file, "utf8")) as State;
  }

  private save() {
    if (this.file) writeFileSync(this.file, JSON.stringify(this.state, null, 2));
  }

  /** Shopify retries deliveries on timeouts and errors, so the same webhook can arrive more than once. */
  isProcessed(webhookId: string): boolean {
    return this.state.processedWebhooks.includes(webhookId);
  }

  /** Record a delivery as done. Call only AFTER its work succeeded, so a crash mid-way lets the retry finish the job. */
  markProcessed(webhookId: string): void {
    if (this.isProcessed(webhookId)) return;
    this.state.processedWebhooks.push(webhookId);
    this.state.processedWebhooks = this.state.processedWebhooks.slice(-5000);
    this.save();
  }

  /** Create one tag for one physical piece. Returns the plain claim code (shown once, never stored). */
  createTag(orderId: number, orderName: string, lineItemTitle: string): { tag: Tag; claimCode: string } {
    const claimCode = token(18);
    const tag: Tag = {
      id: token(9),
      orderId,
      orderName,
      lineItemTitle,
      claimCodeHash: sha256(claimCode),
      ownerTokenHash: null,
      page: null,
      createdAt: new Date().toISOString(),
    };
    this.state.tags[tag.id] = tag;
    this.save();
    return { tag, claimCode };
  }

  get(tagId: string): Tag | undefined {
    return this.state.tags[tagId];
  }

  /** Swap a valid claim code for an owner token (single use). Returns the token, or null. */
  claim(claimCode: string): { tag: Tag; ownerToken: string } | null {
    const hash = sha256(claimCode);
    const tag = Object.values(this.state.tags).find((t) => t.claimCodeHash === hash);
    if (!tag) return null;
    const ownerToken = token(24);
    tag.claimCodeHash = null;
    tag.ownerTokenHash = sha256(ownerToken);
    this.save();
    return { tag, ownerToken };
  }

  ownedBy(tagId: string, ownerToken: string | undefined): Tag | null {
    const tag = this.get(tagId);
    return tag && ownerToken && tag.ownerTokenHash === sha256(ownerToken) ? tag : null;
  }

  updatePage(tagId: string, page: Omit<PersonalPage, "updatedAt">): void {
    const tag = this.get(tagId);
    if (!tag) throw new Error(`Unknown tag ${tagId}`);
    tag.page = { ...page, updatedAt: new Date().toISOString() };
    this.save();
  }

  count(): number {
    return Object.keys(this.state.tags).length;
  }
}
