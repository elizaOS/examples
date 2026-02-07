/**
 * Integration Tests — HTTP API Endpoints
 *
 * Tests the REST API against a real server with a real database.
 * No mocks — real PostgreSQL, real seeded data.
 */

import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { startTestServer, stopTestServer, type TestContext } from './test-server';

let ctx: TestContext;

beforeAll(async () => {
  ctx = await startTestServer();
}, 30000);

afterAll(async () => {
  await stopTestServer();
}, 10000);

// ---------------------------------------------------------------------------
// /api/health
// ---------------------------------------------------------------------------

describe('GET /api/health', () => {
  test('returns ok status and version', async () => {
    const res = await fetch(`${ctx.baseUrl}/api/health`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.version).toBeDefined();
    expect(typeof body.phase).toBe('string');
    expect(typeof body.inCombat).toBe('boolean');
  });

  test('phase is narration after bootstrap', async () => {
    const res = await fetch(`${ctx.baseUrl}/api/health`);
    const body = await res.json();
    expect(body.phase).toBe('narration');
    expect(body.inCombat).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// /api/campaigns
// ---------------------------------------------------------------------------

describe('GET /api/campaigns', () => {
  test('returns at least one seeded campaign', async () => {
    const res = await fetch(`${ctx.baseUrl}/api/campaigns`);
    expect(res.status).toBe(200);

    const campaigns = await res.json();
    expect(Array.isArray(campaigns)).toBe(true);
    expect(campaigns.length).toBeGreaterThanOrEqual(1);

    const campaign = campaigns[0];
    expect(campaign.id).toBeDefined();
    expect(typeof campaign.name).toBe('string');
    expect(campaign.name.length).toBeGreaterThan(0);
  });

  test('each campaign has required fields', async () => {
    const res = await fetch(`${ctx.baseUrl}/api/campaigns`);
    const campaigns = await res.json();

    for (const c of campaigns) {
      expect(c).toHaveProperty('id');
      expect(c).toHaveProperty('name');
      // status and description may be null/undefined but should be present as keys
      expect('id' in c).toBe(true);
      expect('name' in c).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// /api/campaigns/:id/characters
// ---------------------------------------------------------------------------

describe('GET /api/campaigns/:id/characters', () => {
  let campaignId: string;

  beforeAll(async () => {
    const res = await fetch(`${ctx.baseUrl}/api/campaigns`);
    const campaigns = await res.json();
    campaignId = campaigns[0].id;
  });

  test('returns party members for the seeded campaign', async () => {
    const res = await fetch(`${ctx.baseUrl}/api/campaigns/${campaignId}/characters`);
    expect(res.status).toBe(200);

    const characters = await res.json();
    expect(Array.isArray(characters)).toBe(true);
    expect(characters.length).toBeGreaterThanOrEqual(1);
  });

  test('each character has expected fields', async () => {
    const res = await fetch(`${ctx.baseUrl}/api/campaigns/${campaignId}/characters`);
    const characters = await res.json();

    for (const c of characters) {
      expect(c).toHaveProperty('id');
      expect(c).toHaveProperty('name');
      expect(c).toHaveProperty('race');
      expect(c).toHaveProperty('class');
      expect(typeof c.level).toBe('number');
    }
  });

  test('returns empty array for unknown campaign', async () => {
    const res = await fetch(`${ctx.baseUrl}/api/campaigns/00000000-0000-0000-0000-000000000000/characters`);
    expect(res.status).toBe(200);
    const characters = await res.json();
    expect(characters).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// /api/game-state
// ---------------------------------------------------------------------------

describe('GET /api/game-state', () => {
  test('returns current game state with campaign and characters', async () => {
    const res = await fetch(`${ctx.baseUrl}/api/game-state`);
    expect(res.status).toBe(200);

    const state = await res.json();
    expect(typeof state.phase).toBe('string');
    expect(typeof state.inCombat).toBe('boolean');
    expect(state.campaignId).toBeDefined();
    expect(state.campaignName).toBeDefined();
    expect(Array.isArray(state.characters)).toBe(true);
    expect(state.characters.length).toBeGreaterThanOrEqual(1);
  });

  test('characters include party members with class info', async () => {
    const res = await fetch(`${ctx.baseUrl}/api/game-state`);
    const state = await res.json();

    for (const c of state.characters) {
      expect(c).toHaveProperty('name');
      expect(c).toHaveProperty('class');
      expect(c).toHaveProperty('race');
      expect(typeof c.level).toBe('number');
    }
  });
});
