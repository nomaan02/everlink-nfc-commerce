import assert from "node:assert/strict";
import { test } from "node:test";
import { nfcLineItems, signWebhook, verifyWebhook } from "../src/shopify.js";

const body = Buffer.from('{"id":1,"name":"#1001","line_items":[]}');

test("accepts a correctly signed body", () => {
  assert.equal(verifyWebhook(body, signWebhook(body, "s3cret"), "s3cret"), true);
});

test("rejects a tampered body, wrong secret or missing header", () => {
  const signature = signWebhook(body, "s3cret");
  assert.equal(verifyWebhook(Buffer.from(body.toString().replace("1001", "1002")), signature, "s3cret"), false);
  assert.equal(verifyWebhook(body, signWebhook(body, "other"), "s3cret"), false);
  assert.equal(verifyWebhook(body, undefined, "s3cret"), false);
  assert.equal(verifyWebhook(body, "not-base64!", "s3cret"), false);
});

test("only NFC SKUs become tags", () => {
  const order = {
    id: 1,
    name: "#1001",
    line_items: [
      { id: 1, sku: "nfc-ring", quantity: 2, title: "Ring" },
      { id: 2, sku: "GIFTBOX", quantity: 1, title: "Box" },
      { id: 3, sku: null, quantity: 1, title: "Custom" },
    ],
  };
  assert.deepEqual(nfcLineItems(order, "NFC-").map((i) => i.title), ["Ring"]);
});
