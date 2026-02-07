/**
 * E2E Test Helpers
 *
 * Shared utilities for Playwright tests against the D&D VTT.
 * Written against the actual JoinScreen.tsx DOM structure.
 */

import { type Page, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3344';

/** Fetch campaign list from the real API */
export async function getCampaigns(): Promise<{ id: string; name: string }[]> {
  const res = await fetch(`${API_BASE}/api/campaigns`);
  return res.json() as Promise<{ id: string; name: string }[]>;
}

/** Fetch characters for a campaign from the real API */
export async function getCharacters(
  campaignId: string,
): Promise<{ id: string; name: string; race: string; class: string; level: number }[]> {
  const res = await fetch(`${API_BASE}/api/campaigns/${campaignId}/characters`);
  return res.json() as Promise<{ id: string; name: string; race: string; class: string; level: number }[]>;
}

/** Navigate to the VTT and wait for it to be ready (JoinScreen visible) */
export async function gotoVTT(page: Page): Promise<void> {
  await page.goto('/');
  // Wait for the JoinScreen to render — the title "D&D Virtual Tabletop" is in an h1
  await expect(page.locator('h1:has-text("D&D Virtual Tabletop")')).toBeVisible({ timeout: 10_000 });
}

/**
 * Select a campaign and character, then join.
 *
 * The JoinScreen auto-selects when there's only 1 campaign. Characters appear
 * as a 2-column grid of buttons with name, "L{level} {race} {class}", etc.
 */
export async function joinAsCharacter(
  page: Page,
  campaignIndex = 0,
  characterIndex = 0,
): Promise<{ campaignName: string; characterName: string }> {
  await gotoVTT(page);

  // Wait for campaigns to load — look for "Select Campaign" label
  await expect(page.locator('text=Select Campaign')).toBeVisible({ timeout: 10_000 });

  // If there are multiple campaigns, click the one at the given index.
  // Campaigns are rendered as <button> elements under "Select Campaign".
  const campaignButtons = page.locator('button').filter({ has: page.locator('.font-medium') });
  const campaignCount = await campaignButtons.count();

  let campaignName = '';
  if (campaignCount > 1 && campaignIndex < campaignCount) {
    const btn = campaignButtons.nth(campaignIndex);
    campaignName = (await btn.locator('.font-medium').first().textContent()) ?? '';
    await btn.click();
  } else if (campaignCount >= 1) {
    // Auto-selected (only 1 campaign)
    campaignName = (await campaignButtons.first().locator('.font-medium').first().textContent()) ?? '';
  }

  // Wait for characters to appear — "Choose Your Character" label
  await expect(page.locator('text=Choose Your Character')).toBeVisible({ timeout: 10_000 });

  // Character buttons contain "L{level} {race} {class}" text
  const charButtons = page.locator('button').filter({ hasText: /^L\d/ }).or(
    page.locator('.grid button'),
  );
  
  // Wait for character buttons to be available
  await page.waitForTimeout(500);

  // Try to find character buttons in the grid
  const gridButtons = page.locator('.grid.grid-cols-2 button');
  const gridCount = await gridButtons.count();
  
  let characterName = '';
  if (gridCount > characterIndex) {
    const charBtn = gridButtons.nth(characterIndex);
    characterName = (await charBtn.locator('.font-medium').first().textContent()) ?? '';
    await charBtn.click();
  } else if (gridCount >= 1) {
    const charBtn = gridButtons.first();
    characterName = (await charBtn.locator('.font-medium').first().textContent()) ?? '';
    await charBtn.click();
  }

  // Click "Join as Character" button
  const joinButton = page.locator('button:has-text("Join as Character")');
  await expect(joinButton).toBeEnabled({ timeout: 5_000 });
  await joinButton.click();

  // Wait for the game UI to appear — "Adventure Log" is always visible in the game layout
  await expect(page.locator('text=Adventure Log')).toBeVisible({ timeout: 15_000 });

  return { campaignName, characterName };
}

/** Send a text message via the ActionBar */
export async function sendMessage(page: Page, message: string): Promise<void> {
  const input = page.locator('input[type="text"], textarea').first();
  await expect(input).toBeVisible();
  await input.fill(message);
  await input.press('Enter');
}

/** Wait for a DM narration to appear in the adventure log */
export async function waitForNarration(page: Page, timeoutMs = 25_000): Promise<string> {
  const narrationLocator = page.locator('.italic').last();
  await expect(narrationLocator).toBeVisible({ timeout: timeoutMs });
  return (await narrationLocator.textContent()) ?? '';
}

/** Check if combat UI is visible */
export async function isCombatActive(page: Page): Promise<boolean> {
  const tracker = page.locator('text=Initiative').first();
  return tracker.isVisible();
}
