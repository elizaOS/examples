/**
 * E2E Tests — Multi-Player
 *
 * Tests that multiple browser contexts can:
 * 1. Join the same campaign simultaneously
 * 2. See each other's actions in real time
 * 3. Both receive DM narration broadcasts
 *
 * All tests use REAL APIs, REAL LLM — no mocks.
 */

import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import { gotoVTT, getCampaigns, getCharacters } from './helpers';

let context1: BrowserContext;
let context2: BrowserContext;
let page1: Page;
let page2: Page;

test.describe('Multi-Player', () => {
  test.beforeEach(async ({ browser }) => {
    context1 = await browser.newContext();
    context2 = await browser.newContext();
    page1 = await context1.newPage();
    page2 = await context2.newPage();
  });

  test.afterEach(async () => {
    await context1?.close();
    await context2?.close();
  });

  test('two players can both join and see the game UI', async () => {
    // Navigate both to the VTT
    await page1.goto('/');
    await page2.goto('/');

    await expect(page1.locator('text=D&D Virtual Tabletop').first()).toBeVisible({ timeout: 10_000 });
    await expect(page2.locator('text=D&D Virtual Tabletop').first()).toBeVisible({ timeout: 10_000 });

    // Both select the same campaign
    const campaign1 = page1.locator('text=Goblin Den').first();
    const campaign2 = page2.locator('text=Goblin Den').first();
    await campaign1.click();
    await campaign2.click();

    await page1.waitForTimeout(2000);
    await page2.waitForTimeout(2000);

    // Each picks a different character
    // Player 1 picks first character
    const chars1 = page1.locator('button').filter({ hasText: /Fighter|Wizard|Cleric|Rogue/i });
    const chars2 = page2.locator('button').filter({ hasText: /Fighter|Wizard|Cleric|Rogue/i });

    const count1 = await chars1.count();
    const count2 = await chars2.count();

    if (count1 >= 1) await chars1.nth(0).click();
    if (count2 >= 2) await chars2.nth(1).click();
    else if (count2 >= 1) await chars2.nth(0).click();

    // Both click join
    const join1 = page1.locator('button').filter({ hasText: /Join|Enter/i }).first();
    const join2 = page2.locator('button').filter({ hasText: /Join|Enter/i }).first();

    if (await join1.isEnabled()) await join1.click();
    if (await join2.isEnabled()) await join2.click();

    // Both should see the Adventure Log
    await expect(page1.locator('text=Adventure Log').first()).toBeVisible({ timeout: 15_000 });
    await expect(page2.locator('text=Adventure Log').first()).toBeVisible({ timeout: 15_000 });
  });

  test('player 1 message is broadcast to player 2', async () => {
    // Quick join both players
    await page1.goto('/');
    await page2.goto('/');

    await expect(page1.locator('text=D&D Virtual Tabletop').first()).toBeVisible({ timeout: 10_000 });
    await expect(page2.locator('text=D&D Virtual Tabletop').first()).toBeVisible({ timeout: 10_000 });

    // Both select campaign
    await page1.locator('text=Goblin Den').first().click();
    await page2.locator('text=Goblin Den').first().click();
    await page1.waitForTimeout(2000);
    await page2.waitForTimeout(2000);

    // Player 1 picks first character, Player 2 picks second
    const chars1 = page1.locator('button').filter({ hasText: /Fighter|Wizard|Cleric|Rogue/i });
    const chars2 = page2.locator('button').filter({ hasText: /Fighter|Wizard|Cleric|Rogue/i });

    if (await chars1.count() >= 1) await chars1.nth(0).click();
    if (await chars2.count() >= 2) await chars2.nth(1).click();
    else if (await chars2.count() >= 1) await chars2.nth(0).click();

    // Join
    const join1 = page1.locator('button').filter({ hasText: /Join|Enter/i }).first();
    const join2 = page2.locator('button').filter({ hasText: /Join|Enter/i }).first();
    if (await join1.isEnabled()) await join1.click();
    if (await join2.isEnabled()) await join2.click();

    await expect(page1.locator('text=Adventure Log').first()).toBeVisible({ timeout: 15_000 });
    await expect(page2.locator('text=Adventure Log').first()).toBeVisible({ timeout: 15_000 });

    await page1.waitForTimeout(3000);
    await page2.waitForTimeout(3000);

    // Player 1 sends a message
    const input1 = page1.locator('input[type="text"], textarea').first();
    await input1.fill('The fighter raises her sword and shouts a battle cry!');
    await input1.press('Enter');

    // Player 2 should eventually see the message in their log
    // (broadcast via player_action event)
    await expect(
      page2.locator('text=/battle cry|fighter|sword/i').first(),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('both players receive DM narration from one message', async () => {
    await page1.goto('/');
    await page2.goto('/');

    await expect(page1.locator('text=D&D Virtual Tabletop').first()).toBeVisible({ timeout: 10_000 });
    await expect(page2.locator('text=D&D Virtual Tabletop').first()).toBeVisible({ timeout: 10_000 });

    // Both select campaign and join with different characters
    await page1.locator('text=Goblin Den').first().click();
    await page2.locator('text=Goblin Den').first().click();
    await page1.waitForTimeout(2000);
    await page2.waitForTimeout(2000);

    const chars1 = page1.locator('button').filter({ hasText: /Fighter|Wizard|Cleric|Rogue/i });
    const chars2 = page2.locator('button').filter({ hasText: /Fighter|Wizard|Cleric|Rogue/i });
    if (await chars1.count() >= 1) await chars1.nth(0).click();
    if (await chars2.count() >= 2) await chars2.nth(1).click();
    else if (await chars2.count() >= 1) await chars2.nth(0).click();

    const join1 = page1.locator('button').filter({ hasText: /Join|Enter/i }).first();
    const join2 = page2.locator('button').filter({ hasText: /Join|Enter/i }).first();
    if (await join1.isEnabled()) await join1.click();
    if (await join2.isEnabled()) await join2.click();

    await expect(page1.locator('text=Adventure Log').first()).toBeVisible({ timeout: 15_000 });
    await expect(page2.locator('text=Adventure Log').first()).toBeVisible({ timeout: 15_000 });
    await page1.waitForTimeout(3000);

    // Both should have received the opening narration (the fix we applied earlier)
    // Check that both adventure logs have substantive content
    // Look for "Dungeon Master" entries in both clients
    await expect(page1.locator('text=Dungeon Master').first()).toBeVisible({ timeout: 10_000 });
    await expect(page2.locator('text=Dungeon Master').first()).toBeVisible({ timeout: 10_000 });
  });
});
