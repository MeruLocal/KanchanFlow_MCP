/** The mirror's age is stated on every tool response and site resource. */

import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_STALE_AFTER_DAYS, freshness, staleAfterDays } from "../data/freshness.js";
import { loadMirror } from "../data/mirror.js";
import { readSiteResource } from "../resources/index.js";
import { SERVER_INSTRUCTIONS } from "../server-info.js";
import { connect, textPayload } from "./helpers/client.js";

const DAY = 24 * 60 * 60 * 1000;
const SYNCED = "2026-01-01T00:00:00.000Z";
const at = (days: number) => Date.parse(SYNCED) + days * DAY;

describe("freshness()", () => {
  it("is fresh at 13 days and stale at 15", () => {
    expect(freshness(SYNCED, at(13), 14)).toEqual({ syncedAt: SYNCED, ageDays: 13, stale: false });
    const old = freshness(SYNCED, at(15), 14);
    expect(old.stale).toBe(true);
    expect(old.ageDays).toBe(15);
    expect(old.note).toContain("synced 15 days ago");
    expect(old.note).toContain("https://kanchanflow.com");
  });

  it("reads the override from the environment", () => {
    expect(staleAfterDays({})).toBe(DEFAULT_STALE_AFTER_DAYS);
    expect(staleAfterDays({ KANCHANFLOW_MCP_STALE_AFTER_DAYS: "30" })).toBe(30);
    expect(staleAfterDays({ KANCHANFLOW_MCP_STALE_AFTER_DAYS: "nope" })).toBe(DEFAULT_STALE_AFTER_DAYS);
    expect(freshness(SYNCED, at(20), staleAfterDays({ KANCHANFLOW_MCP_STALE_AFTER_DAYS: "30" })).stale).toBe(false);
  });

  it("reports an invalid date as stale", () => {
    const f = freshness("not a date", Date.now(), 14);
    expect(f.stale).toBe(true);
    expect(f.ageDays).toBeNull();
    expect(f.note).toBeDefined();
  });
});

describe("applied centrally", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("kanchanflow_get_pricing carries source.stale and the note when the mirror is old", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(Date.parse(loadMirror().meta.syncedAt) + 30 * DAY);
    const client = await connect();
    const body = textPayload(await client.callTool({ name: "kanchanflow_get_pricing", arguments: {} }));
    await client.close();
    expect(body.data.source.stale).toBe(true);
    expect(body.data.source.ageDays).toBe(30);
    expect(body.data.source.note).toMatch(/may be out of date/);
    expect(body.data.source.syncedAt).toBe(loadMirror().meta.syncedAt);
  });

  it("is not stale right after a sync", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(Date.parse(loadMirror().meta.syncedAt) + 1 * DAY);
    const client = await connect();
    const body = textPayload(await client.callTool({ name: "kanchanflow_list_markets", arguments: {} }));
    await client.close();
    expect(body.data.source.stale).toBe(false);
    expect(body.data.source.note).toBeUndefined();
  });

  it("site resources carry it too", () => {
    const read = readSiteResource("kanchanflow://site/pricing") ?? readSiteResource("kanchanflow://site/company");
    const source = JSON.parse(read!.text).source;
    expect(typeof source.stale).toBe("boolean");
    expect(source.syncedAt).toBe(loadMirror().meta.syncedAt);
  });

  it("the instructions tell agents what stale means", () => {
    expect(SERVER_INSTRUCTIONS).toContain("If source.stale is true");
  });
});
