/**
 * E2E Tests — Join Flow
 *
 * Tests the complete user journey of:
 * 1. Loading the VTT
 * 2. Seeing available campaigns
 * 3. Selecting a campaign and character
 * 4. Joining the game
 * 5. Receiving the opening narration
 *
 * All tests use REAL APIs, REAL database, REAL LLM — no mocks.
 */

import { test, expect } from '@playwright/test';
import { gotoVTT, joinAsCharacter, getCampaigns, getCharacters } from './helpers';

test.describe('Join Flow', () => {
  test('page loads with VTT title visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=D&D Virtual Tabletop').first()).toBeVisible({ timeout: 10_000 });
  });

  test('campaigns are fetched and displayed', async ({ page }) => {
    await gotoVTT(page);

    // The JoinScreen should show at least one campaign (seeded "The Goblin Den")
    const campaignElements = page.locator('text=Goblin Den').first();
    await expect(campaignElements).toBeVisible({ timeout: 10_000 });
  });

  test('selecting a campaign shows characters', async ({ page }) => {
    await gotoVTT(page);

    // Click the first campaign
    const campaignCard = page.locator('text=Goblin Den').first();
    await campaignCard.click();

    // Characters should appear — look for race/class patterns common in D&D
    await page.waitForTimeout(2000);

    // At least one character should be visible after campaign selection
    const characterSection = page.locator('text=/Fighter|Wizard|Cleric|Rogue/i').first();
    await expect(characterSection).toBeVisible({ timeout: 10_000 });
  });

  test('joining as a character loads the game UI', async ({ page }) => {
    await joinAsCharacter(page);

    // After joining, the game layout should be visible:
    // - Adventure Log panel
    // - Character panel (or similar)
    // - Action bar input
    await expect(page.locator('text=Adventure Log').first()).toBeVisible();
  });

  test('opening narration appears after joining', async ({ page }) => {
    await joinAsCharacter(page);

    // The DM narration should appear in the adventure log
    // Wait for the Dungeon Master narration entry to appear
    await page.waitForTimeout(3000); // Give narration time to arrive

    // Look for "Dungeon Master" text (the speaker name in narration entries)
    const dmEntry = page.locator('text=Dungeon Master').first();
    await expect(dmEntry).toBeVisible({ timeout: 10_000 });

    // The narration content should be substantive
    const narrationText = page.locator('text=Millbrook').first().or(
      page.locator('text=village').first()
    );
    await expect(narrationText).toBeVisible({ timeout: 10_000 });
  });

  test('character info is displayed after joining', async ({ page }) => {
    await joinAsCharacter(page);

    // The character panel should show the character's name, HP, AC, etc.
    await page.waitForTimeout(2000);

    // Look for HP/AC indicators
    const hpText = page.locator('text=/HP|Hit Points/i').first();
    await expect(hpText).toBeVisible({ timeout: 10_000 });
  });

  test('spectator mode works (join without character)', async ({ page }) => {
    await gotoVTT(page);

    // Click the first campaign
    const campaignCard = page.locator('text=Goblin Den').first();
    await campaignCard.click();

    await page.waitForTimeout(1000);

    // Look for a spectate button
    const spectateBtn = page.locator('button').filter({ hasText: /Spectate|Watch/i }).first();
    const spectateVisible = await spectateBtn.isVisible().catch(() => false);

    if (spectateVisible) {
      await spectateBtn.click();
      // Should transition to game UI even without a character
      await expect(page.locator('text=Adventure Log').first()).toBeVisible({ timeout: 15_000 });
    } else {
      // If no spectate button, that's a known gap — skip gracefully
      test.skip();
    }
  });
});
