/**
 * E2E Tests — Multiplayer Session
 *
 * Tests the full multiplayer experience with two (or more) browser contexts
 * connecting to the SAME campaign simultaneously:
 *
 *   1. Player 1 joins and receives opening narration
 *   2. Player 2 joins the same campaign as a different character
 *   3. Player 1's messages are broadcast to Player 2 in real time
 *   4. DM narration triggered by Player 1 reaches both players
 *   5. Player 2 sends a message, Player 1 sees it
 *   6. Both players see each other's quick actions
 *   7. Spectator mode — joins without a character, can observe
 *   8. Player disconnect / reconnect — the other player is unaffected
 *
 * All tests use REAL APIs, REAL database, REAL LLM — no mocks.
 * Each test creates fresh BrowserContexts for isolation.
 */

import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import {
  gotoVTT,
  joinAsCharacter,
  joinAsSpectator,
  sendMessage,
  clickQuickAction,
  leaveGame,
  logEntriesBySpeaker,
  countDMEntries,
  waitForNewDMResponse,
  assertConnected,
  assertActionBarReady,
  WS_PROPAGATION_DELAY,
  DM_RESPONSE_TIMEOUT,
} from './helpers';

// ---------------------------------------------------------------------------
// Helper: create two isolated browser contexts (simulating two separate users)
// ---------------------------------------------------------------------------

interface TwoPlayers {
  ctx1: BrowserContext;
  ctx2: BrowserContext;
  page1: Page;
  page2: Page;
}

async function createTwoPlayers(browser: Parameters<Parameters<typeof test>[1]>[0]['browser']): Promise<TwoPlayers> {
  const ctx1 = await browser.newContext();
  const ctx2 = await browser.newContext();
  const page1 = await ctx1.newPage();
  const page2 = await ctx2.newPage();
  return { ctx1, ctx2, page1, page2 };
}

async function cleanupPlayers(players: TwoPlayers): Promise<void> {
  await players.ctx1.close();
  await players.ctx2.close();
}

/**
 * Join both players into the same campaign with different characters.
 * Player 1 → character index 0 (Thordak — Dwarf Fighter)
 * Player 2 → character index 2 (Brother Aldwin — Human Cleric)
 */
async function joinBothPlayers(page1: Page, page2: Page) {
  const [result1, result2] = await Promise.all([
    joinAsCharacter(page1, 0), // Thordak (Fighter)
    joinAsCharacter(page2, 2), // Brother Aldwin (Cleric)
  ]);
  return { result1, result2 };
}

// All tests in this file run sequentially (shared server state)
test.describe.configure({ mode: 'serial' });

test.describe('Multiplayer Session', () => {
  // -------------------------------------------------------------------------
  // 1. JOINING
  // -------------------------------------------------------------------------

  test('two players can join the same campaign with different characters', async ({ browser }) => {
    const players = await createTwoPlayers(browser);

    try {
      const { result1, result2 } = await joinBothPlayers(players.page1, players.page2);

      // Both should see the game UI
      await assertConnected(players.page1);
      await assertConnected(players.page2);

      // They should have different character names
      expect(result1.characterName).toBeTruthy();
      expect(result2.characterName).toBeTruthy();
      expect(result1.characterName).not.toBe(result2.characterName);

      // Both should see the Adventure Log
      await expect(players.page1.locator('text=Adventure Log').first()).toBeVisible();
      await expect(players.page2.locator('text=Adventure Log').first()).toBeVisible();
    } finally {
      await cleanupPlayers(players);
    }
  });

  test('both players receive opening narration', async ({ browser }) => {
    const players = await createTwoPlayers(browser);

    try {
      await joinBothPlayers(players.page1, players.page2);

      // Wait for opening narration to arrive at both clients
      await expect(
        logEntriesBySpeaker(players.page1, 'Dungeon Master').first(),
      ).toBeVisible({ timeout: 15_000 });

      await expect(
        logEntriesBySpeaker(players.page2, 'Dungeon Master').first(),
      ).toBeVisible({ timeout: 15_000 });

      // Both should have the opening narration text
      const text1 = await logEntriesBySpeaker(players.page1, 'Dungeon Master')
        .first().locator('.whitespace-pre-wrap').textContent();
      const text2 = await logEntriesBySpeaker(players.page2, 'Dungeon Master')
        .first().locator('.whitespace-pre-wrap').textContent();

      expect(text1!.length).toBeGreaterThan(50);
      expect(text2!.length).toBeGreaterThan(50);
    } finally {
      await cleanupPlayers(players);
    }
  });

  // -------------------------------------------------------------------------
  // 2. MESSAGE BROADCASTING
  // -------------------------------------------------------------------------

  test('player 1 message is broadcast to player 2', async ({ browser }) => {
    const players = await createTwoPlayers(browser);

    try {
      await joinBothPlayers(players.page1, players.page2);
      await players.page1.waitForTimeout(WS_PROPAGATION_DELAY);

      // Player 1 sends a message
      await sendMessage(players.page1, 'Thordak raises his axe and bellows a war cry!');

      // Player 1 sees their own message immediately (optimistic UI)
      await expect(
        players.page1.locator('text=bellows a war cry').first(),
      ).toBeVisible({ timeout: 5_000 });

      // Player 2 should see Player 1's message via WebSocket broadcast
      await expect(
        players.page2.locator('text=bellows a war cry').first(),
      ).toBeVisible({ timeout: 15_000 });
    } finally {
      await cleanupPlayers(players);
    }
  });

  test('player 2 message is broadcast to player 1', async ({ browser }) => {
    const players = await createTwoPlayers(browser);

    try {
      await joinBothPlayers(players.page1, players.page2);
      await players.page2.waitForTimeout(WS_PROPAGATION_DELAY);

      // Player 2 sends a message
      await sendMessage(players.page2, 'Brother Aldwin offers a prayer to the gods.');

      // Player 2 sees their own message
      await expect(
        players.page2.locator('text=offers a prayer').first(),
      ).toBeVisible({ timeout: 5_000 });

      // Player 1 should see Player 2's message
      await expect(
        players.page1.locator('text=offers a prayer').first(),
      ).toBeVisible({ timeout: 15_000 });
    } finally {
      await cleanupPlayers(players);
    }
  });

  // -------------------------------------------------------------------------
  // 3. DM NARRATION BROADCAST
  // -------------------------------------------------------------------------

  test('DM narration from player 1 action reaches both players', async ({ browser }) => {
    const players = await createTwoPlayers(browser);

    try {
      await joinBothPlayers(players.page1, players.page2);
      await players.page1.waitForTimeout(WS_PROPAGATION_DELAY);

      // Get DM entry counts for both players
      const dm1Before = await countDMEntries(players.page1);
      const dm2Before = await countDMEntries(players.page2);

      // Player 1 sends a message that triggers a DM response
      await sendMessage(players.page1, 'I search the area for any signs of goblin activity.');

      // Both players should receive the DM narration
      const response1 = await waitForNewDMResponse(players.page1, dm1Before);
      const response2 = await waitForNewDMResponse(players.page2, dm2Before);

      // Both responses should be substantive
      expect(response1.length).toBeGreaterThan(10);
      expect(response2.length).toBeGreaterThan(10);

      // The DM response text should be the same for both players
      // (it's a broadcast to the campaign room)
      expect(response1).toBe(response2);
    } finally {
      await cleanupPlayers(players);
    }
  });

  test('DM narration from player 2 action also reaches player 1', async ({ browser }) => {
    const players = await createTwoPlayers(browser);

    try {
      await joinBothPlayers(players.page1, players.page2);
      await players.page2.waitForTimeout(WS_PROPAGATION_DELAY);

      const dm1Before = await countDMEntries(players.page1);
      const dm2Before = await countDMEntries(players.page2);

      // Player 2 triggers a DM response
      await sendMessage(players.page2, 'I examine the wooden sign by the road.');

      // Both receive the DM narration
      await waitForNewDMResponse(players.page1, dm1Before);
      await waitForNewDMResponse(players.page2, dm2Before);
    } finally {
      await cleanupPlayers(players);
    }
  });

  // -------------------------------------------------------------------------
  // 4. QUICK ACTIONS IN MULTIPLAYER
  // -------------------------------------------------------------------------

  test('quick action by one player triggers DM response seen by both', async ({ browser }) => {
    const players = await createTwoPlayers(browser);

    try {
      await joinBothPlayers(players.page1, players.page2);
      await players.page1.waitForTimeout(WS_PROPAGATION_DELAY);

      const dm1Before = await countDMEntries(players.page1);
      const dm2Before = await countDMEntries(players.page2);

      // Player 1 clicks "Look Around"
      await clickQuickAction(players.page1, 'Look Around');

      // Both receive the DM's exploration response
      await waitForNewDMResponse(players.page1, dm1Before);
      await waitForNewDMResponse(players.page2, dm2Before);
    } finally {
      await cleanupPlayers(players);
    }
  });

  // -------------------------------------------------------------------------
  // 5. BACK-AND-FORTH CONVERSATION
  // -------------------------------------------------------------------------

  test('players can have a back-and-forth conversation with DM responses', async ({ browser }) => {
    const players = await createTwoPlayers(browser);

    try {
      await joinBothPlayers(players.page1, players.page2);
      await players.page1.waitForTimeout(WS_PROPAGATION_DELAY);

      // Player 1 speaks
      let dmCount = await countDMEntries(players.page1);
      await sendMessage(players.page1, 'I suggest we head to the village square first.');
      await waitForNewDMResponse(players.page1, dmCount);

      // Player 2 responds
      dmCount = await countDMEntries(players.page2);
      await sendMessage(players.page2, 'Good idea. I will follow and keep watch for danger.');
      await waitForNewDMResponse(players.page2, dmCount);

      // Player 1 should see Player 2's message
      await expect(
        players.page1.locator('text=keep watch for danger').first(),
      ).toBeVisible({ timeout: 15_000 });

      // Player 2 should see Player 1's message
      await expect(
        players.page2.locator('text=head to the village square').first(),
      ).toBeVisible({ timeout: 15_000 });

      // Both should have multiple DM entries by now (opening + responses)
      const finalDM1 = await countDMEntries(players.page1);
      const finalDM2 = await countDMEntries(players.page2);
      expect(finalDM1).toBeGreaterThanOrEqual(3);
      expect(finalDM2).toBeGreaterThanOrEqual(3);
    } finally {
      await cleanupPlayers(players);
    }
  });

  // -------------------------------------------------------------------------
  // 6. SPECTATOR MODE
  // -------------------------------------------------------------------------

  test('spectator sees narration but cannot send messages', async ({ browser }) => {
    const players = await createTwoPlayers(browser);

    try {
      // Player 1 joins as a character
      await joinAsCharacter(players.page1, 0);

      // Player 2 joins as a spectator
      await joinAsSpectator(players.page2);

      // Spectator should see the adventure log
      await expect(
        players.page2.locator('text=Adventure Log').first(),
      ).toBeVisible({ timeout: 15_000 });

      // Spectator should see the "spectating" notice (no action bar input)
      await expect(
        players.page2.locator('text=/spectating/i').first(),
      ).toBeVisible({ timeout: 5_000 });

      // Spectator should NOT have a message input
      const spectatorInput = players.page2.locator('input[type="text"]');
      const inputCount = await spectatorInput.count();
      expect(inputCount).toBe(0);

      // Player 1 sends a message
      const dmCountSpectator = await countDMEntries(players.page2);
      await sendMessage(players.page1, 'The fighter checks the perimeter.');

      // Spectator should see the DM narration that results
      await waitForNewDMResponse(players.page2, dmCountSpectator);
    } finally {
      await cleanupPlayers(players);
    }
  });

  // -------------------------------------------------------------------------
  // 7. DISCONNECT & RECONNECT
  // -------------------------------------------------------------------------

  test('player 1 disconnect does not crash player 2', async ({ browser }) => {
    const players = await createTwoPlayers(browser);

    try {
      await joinBothPlayers(players.page1, players.page2);
      await players.page1.waitForTimeout(WS_PROPAGATION_DELAY);

      // Player 1 leaves
      await leaveGame(players.page1);

      // Player 2 should still be connected and functional
      await assertConnected(players.page2);

      // Player 2 can still send messages
      const dmCount = await countDMEntries(players.page2);
      await sendMessage(players.page2, 'I continue exploring on my own.');
      await waitForNewDMResponse(players.page2, dmCount);
    } finally {
      await cleanupPlayers(players);
    }
  });

  test('player can rejoin after disconnect and see the game', async ({ browser }) => {
    const players = await createTwoPlayers(browser);

    try {
      await joinBothPlayers(players.page1, players.page2);
      await players.page1.waitForTimeout(WS_PROPAGATION_DELAY);

      // Player 1 leaves
      await leaveGame(players.page1);
      await players.page1.waitForTimeout(1_000);

      // Player 1 rejoins
      await joinAsCharacter(players.page1, 0);

      // Player 1 should be back in the game
      await assertConnected(players.page1);

      // Player 1 can send messages again
      const dmCount = await countDMEntries(players.page1);
      await sendMessage(players.page1, 'I have returned to the party!');
      await waitForNewDMResponse(players.page1, dmCount);

      // Player 2 should see Player 1's message
      await expect(
        players.page2.locator('text=returned to the party').first(),
      ).toBeVisible({ timeout: 15_000 });
    } finally {
      await cleanupPlayers(players);
    }
  });

  // -------------------------------------------------------------------------
  // 8. SAME CHARACTER CONFLICT (edge case)
  // -------------------------------------------------------------------------

  test('two players selecting the same character both see the game', async ({ browser }) => {
    const players = await createTwoPlayers(browser);

    try {
      // Both try to join as the same character (index 0)
      await Promise.all([
        joinAsCharacter(players.page1, 0),
        joinAsCharacter(players.page2, 0),
      ]);

      // Both should reach the game UI (server doesn't prevent this currently)
      await expect(
        players.page1.locator('text=Adventure Log').first(),
      ).toBeVisible({ timeout: 15_000 });
      await expect(
        players.page2.locator('text=Adventure Log').first(),
      ).toBeVisible({ timeout: 15_000 });
    } finally {
      await cleanupPlayers(players);
    }
  });

  // -------------------------------------------------------------------------
  // 9. THREE PLAYERS (stress test)
  // -------------------------------------------------------------------------

  test('three players can all join and communicate', async ({ browser }) => {
    const ctx1 = await browser.newContext();
    const ctx2 = await browser.newContext();
    const ctx3 = await browser.newContext();
    const page1 = await ctx1.newPage();
    const page2 = await ctx2.newPage();
    const page3 = await ctx3.newPage();

    try {
      // All three join as different characters
      await Promise.all([
        joinAsCharacter(page1, 0), // Fighter
        joinAsCharacter(page2, 1), // Wizard
        joinAsCharacter(page3, 2), // Cleric
      ]);

      // All three should see the game
      await assertConnected(page1);
      await assertConnected(page2);
      await assertConnected(page3);

      // Player 1 sends a message
      await sendMessage(page1, 'The fighter leads the party forward.');
      await page1.waitForTimeout(WS_PROPAGATION_DELAY);

      // Player 2 and Player 3 should see it
      await expect(
        page2.locator('text=leads the party forward').first(),
      ).toBeVisible({ timeout: 15_000 });
      await expect(
        page3.locator('text=leads the party forward').first(),
      ).toBeVisible({ timeout: 15_000 });

      // Player 3 sends a message
      await sendMessage(page3, 'The cleric blesses the party before they move.');
      await page3.waitForTimeout(WS_PROPAGATION_DELAY);

      // Player 1 and Player 2 should see it
      await expect(
        page1.locator('text=blesses the party').first(),
      ).toBeVisible({ timeout: 15_000 });
      await expect(
        page2.locator('text=blesses the party').first(),
      ).toBeVisible({ timeout: 15_000 });
    } finally {
      await ctx1.close();
      await ctx2.close();
      await ctx3.close();
    }
  });
});
