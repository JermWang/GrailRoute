import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the GrailRoute application shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>GrailRoute/);
  assert.match(html, /Trade your way/);
  assert.match(html, /From physical grail to onchain route/);
  assert.match(html, /grailroute-motion-demo\.mp4/);
  assert.match(html, /Connect EVM wallet/);
  assert.match(html, /See the complete journey before you sign/);
  assert.match(html, /Best ways to use GrailRoute/);
  assert.match(html, /Connect.*Vault.*Target.*Route.*Sign/s);
  assert.match(html, /Pokémon TCG marketplace/);
  assert.match(html, /not connected-wallet inventory/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Your site is taking shape/);
});
