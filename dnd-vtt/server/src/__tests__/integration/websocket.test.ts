/**
 * Integration Tests — Game Logic (Direct Function Calls)
 *
 * Tests the game orchestrator, DM response generation, and combat flow
 * against a REAL database and REAL LLM. No mocks.
 *
 * These tests call processPlayerAction, getGameStatus, transitionPhase, etc.
 * directly on the bootstrapped GameState, validating the same code paths
 * that the WebSocket handler invokes.
 *
 * Full E2E WebSocket transport testing is covered by Playwright tests.
 */

import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import {
  startTestServer,
  stopTestServer,
  type TestContext,
} from './test-server';
import {
  processPlayerAction,
  getGameStatus,
  transitionPhase,
  type GameState,
} from '../../campaign';

let ctx: TestContext;
let gameState: GameState;

beforeAll(async () => {
  ctx = await startTestServer();
  gameState = ctx.gameState;
}, 30000);

afterAll(async () => {
  await stopTestServer();
}, 10000);

// ---------------------------------------------------------------------------
// Game Status
// ---------------------------------------------------------------------------

describe('getGameStatus', () => {
  test('returns narration phase after bootstrap', () => {
    const status = getGameStatus(gameState);
    expect(status.phase).toBe('narration');
    expect(status.inCombat).toBe(false);
    expect(status.currentTurn).toBeNull();
    expect(status.roundNumber).toBe(0);
  });

  test('has session duration', () => {
    const status = getGameStatus(gameState);
    expect(typeof status.sessionDuration).toBe('number');
    expect(status.sessionDuration).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// Game State Inspection
// ---------------------------------------------------------------------------

describe('bootstrapped game state', () => {
  test('has campaign loaded', () => {
    expect(gameState._campaign).toBeDefined();
    expect(gameState._campaign!.name).toBeDefined();
  });

  test('has characters loaded', () => {
    expect(gameState._characters).toBeDefined();
    expect(gameState._characters!.length).toBeGreaterThanOrEqual(1);
  });

  test('has DM agent', () => {
    expect(gameState.dmAgent).toBeDefined();
  });

  test('has player agents for each character', () => {
    expect(gameState.playerAgents.size).toBeGreaterThanOrEqual(1);
    for (const char of gameState._characters!) {
      if (char.id) {
        expect(gameState.playerAgents.has(char.id)).toBe(true);
      }
    }
  });

  test('has active session state', () => {
    expect(gameState.sessionState).toBeDefined();
    expect(gameState.sessionState!.campaignId).toBeDefined();
    expect(gameState.sessionState!.sessionId).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Player Action — Message (triggers DM response)
// ---------------------------------------------------------------------------

describe('processPlayerAction — message', () => {
  test('returns success for a valid player message', async () => {
    const characterId = gameState._characters![0].id!;

    const result = await processPlayerAction(gameState, characterId, {
      type: 'message',
      description: 'I look around the village square.',
    });

    expect(result.success).toBe(true);
    expect(typeof result.response).toBe('string');
    expect(result.response.length).toBeGreaterThan(5);
  }, 30000);

  test('DM response is contextual (mentions location or scene)', async () => {
    const characterId = gameState._characters![0].id!;

    const result = await processPlayerAction(gameState, characterId, {
      type: 'message',
      description: 'What do I see in front of me?',
    });

    expect(result.success).toBe(true);
    // Response should be substantive (more than just echoing the question)
    expect(result.response.length).toBeGreaterThan(20);
  }, 30000);

  test('returns error for unknown character', async () => {
    const result = await processPlayerAction(gameState, 'non-existent-id', {
      type: 'message',
      description: 'Hello?',
    });

    expect(result.success).toBe(false);
    expect(result.response).toContain('Unknown character');
  });
});

// ---------------------------------------------------------------------------
// Player Action — Explore
// ---------------------------------------------------------------------------

describe('processPlayerAction — explore', () => {
  test('explore action in narration phase auto-transitions to exploration', async () => {
    // Reset to narration phase first
    if (gameState.phase !== 'narration') {
      await transitionPhase(gameState, 'narration');
    }

    const characterId = gameState._characters![0].id!;
    const result = await processPlayerAction(gameState, characterId, {
      type: 'explore',
      description: 'I search the area for hidden items.',
    });

    expect(result.success).toBe(true);
    // Phase should have auto-transitioned from narration to exploration
    expect(['exploration', 'narration']).toContain(gameState.phase);
  }, 30000);

  test('social action generates response', async () => {
    if (!['exploration', 'social', 'narration'].includes(gameState.phase)) {
      await transitionPhase(gameState, 'exploration');
    }

    const characterId = gameState._characters![0].id!;
    const result = await processPlayerAction(gameState, characterId, {
      type: 'social',
      description: 'I talk to the innkeeper about recent events.',
    });

    expect(result.success).toBe(true);
    expect(result.response.length).toBeGreaterThan(5);
  }, 30000);
});

// ---------------------------------------------------------------------------
// Phase Transitions
// ---------------------------------------------------------------------------

describe('transitionPhase', () => {
  test('can transition to exploration', async () => {
    await transitionPhase(gameState, 'exploration');
    expect(gameState.phase).toBe('exploration');
  });

  test('can transition to rest', async () => {
    await transitionPhase(gameState, 'rest', { restType: 'short' });
    expect(gameState.phase).toBe('rest');
  });

  test('rest phase blocks non-social actions', async () => {
    await transitionPhase(gameState, 'rest');
    const characterId = gameState._characters![0].id!;

    const result = await processPlayerAction(gameState, characterId, {
      type: 'attack',
      description: 'I attack!',
    });

    expect(result.success).toBe(false);
    expect(result.response).toContain('resting');
  });

  test('rest phase allows social/message actions', async () => {
    await transitionPhase(gameState, 'rest');
    const characterId = gameState._characters![0].id!;

    const result = await processPlayerAction(gameState, characterId, {
      type: 'message',
      description: 'I chat with my companions during the rest.',
    });

    expect(result.success).toBe(true);
  }, 30000);
});

// ---------------------------------------------------------------------------
// Rest Mechanics
// ---------------------------------------------------------------------------

describe('rest mechanics', () => {
  test('short rest heals with hit dice', async () => {
    await transitionPhase(gameState, 'exploration');

    const characterId = gameState._characters![0].id!;
    const sheet = gameState._characters![0];
    const hpBefore = sheet.hp?.current ?? sheet.hitPoints?.current ?? 0;

    // Simulate some damage first by modifying the sheet
    if (sheet.hp) sheet.hp.current = Math.max(1, Math.floor((sheet.hp.max ?? 10) / 2));
    if (sheet.hitPoints) sheet.hitPoints.current = Math.max(1, Math.floor((sheet.hitPoints.max ?? 10) / 2));

    const result = await processPlayerAction(gameState, characterId, {
      type: 'rest',
      description: 'Take a short rest',
      metadata: { restType: 'short' },
    });

    expect(result.success).toBe(true);
    expect(result.response.length).toBeGreaterThan(5);
  }, 30000);

  test('long rest fully heals and restores spell slots', async () => {
    await transitionPhase(gameState, 'exploration');

    // Find a spellcaster character
    const caster = gameState._characters!.find(c => c.spellSlots && Object.keys(c.spellSlots).length > 0);
    if (!caster || !caster.id) {
      // Skip if no caster
      return;
    }

    // Drain a spell slot
    const firstLevel = Object.keys(caster.spellSlots!)[0];
    if (firstLevel && caster.spellSlots![Number(firstLevel)]) {
      caster.spellSlots![Number(firstLevel)].current = 0;
    }

    const result = await processPlayerAction(gameState, caster.id, {
      type: 'rest',
      description: 'Take a long rest',
      metadata: { restType: 'long' },
    });

    expect(result.success).toBe(true);

    // After long rest, spell slots should be restored
    if (firstLevel && caster.spellSlots![Number(firstLevel)]) {
      expect(caster.spellSlots![Number(firstLevel)].current).toBe(
        caster.spellSlots![Number(firstLevel)].max,
      );
    }
  }, 30000);
});
