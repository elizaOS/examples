/**
 * Integration Test Server Helper
 *
 * Starts a real server (Express + Socket.IO) backed by a real PostgreSQL database.
 * Provides both HTTP endpoints for API testing AND direct access to the
 * GameState for game logic integration testing.
 *
 * Requirements:
 *   - PostgreSQL running on localhost:5432 with database `eliza_dungeons`
 *   - The database must be seeded (`bun run seed`)
 *   - OPENAI_API_KEY in the environment for LLM tests
 */

import { createServer, type Server as HTTPServer } from 'http';
import express from 'express';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';

import {
  initializeDatabase,
  closeDatabase,
  isDatabaseConnected,
  campaignRepository,
  characterRepository,
} from '../../persistence';
import { initializeWebSocket } from '../../api';
import { createGameOrchestrator, bootstrapGame, type GameState } from '../../campaign';

export interface TestContext {
  httpServer: HTTPServer;
  io: SocketIOServer;
  app: ReturnType<typeof express>;
  gameState: GameState;
  baseUrl: string;
  port: number;
}

let ctx: TestContext | null = null;

/**
 * Start the test server on a random available port.
 * Connects to the real database & bootstraps the game.
 */
export async function startTestServer(): Promise<TestContext> {
  if (ctx) return ctx;

  // Database ---
  if (!isDatabaseConnected()) {
    await initializeDatabase();
  }

  // Express ---
  const app = express();
  app.use(cors({ origin: '*' }));
  app.use(express.json());

  // Replicate the exact routes from server/src/index.ts
  let gameState: GameState;

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      version: '0.1.0-test',
      phase: gameState?.phase || 'initializing',
      inCombat: Boolean(gameState?.combatEncounter),
    });
  });

  app.get('/api/campaigns', async (_req, res) => {
    if (!isDatabaseConnected()) return res.json([]);
    const campaigns = await campaignRepository.list();
    res.json(campaigns.map(c => ({ id: c.id, name: c.name, status: c.status, description: c.description })));
  });

  app.get('/api/campaigns/:campaignId/characters', async (req, res) => {
    if (!isDatabaseConnected()) return res.json([]);
    const characters = await characterRepository.getByCampaign(req.params.campaignId);
    res.json(characters.map(c => ({
      id: c.id, name: c.name, race: c.race, class: c.class, level: c.level,
      isAI: c.isAI ?? false, hp: c.hp ?? c.hitPoints, ac: c.ac ?? c.armorClass ?? 10,
    })));
  });

  app.get('/api/game-state', (_req, res) => {
    const campaign = gameState._campaign;
    const characters = gameState._characters ?? [];
    res.json({
      phase: gameState.phase,
      inCombat: gameState.phase === 'combat' && gameState.combatEncounter !== null,
      campaignId: campaign?.id ?? null,
      campaignName: campaign?.name ?? null,
      characters: characters.map(c => ({
        id: c.id, name: c.name, race: c.race, class: c.class, level: c.level, isAI: c.isAI ?? false,
      })),
    });
  });

  const httpServer = createServer(app);

  // Game orchestrator ---
  gameState = createGameOrchestrator();

  // Socket.IO ---
  const io = initializeWebSocket(httpServer, gameState);

  // Bootstrap with real DB + LLM ---
  if (isDatabaseConnected()) {
    await bootstrapGame(gameState, io);
  }

  // Start listening on random port ---
  await new Promise<void>((resolve) => {
    httpServer.listen(0, () => resolve());
  });

  const addr = httpServer.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;
  const baseUrl = `http://localhost:${port}`;

  ctx = { httpServer, io, app, gameState, baseUrl, port };
  return ctx;
}

/**
 * Stop the test server and close connections.
 */
export async function stopTestServer(): Promise<void> {
  if (!ctx) return;
  ctx.io.close();
  await new Promise<void>((resolve, reject) => {
    ctx!.httpServer.close((err) => (err ? reject(err) : resolve()));
  });
  await closeDatabase();
  ctx = null;
}
