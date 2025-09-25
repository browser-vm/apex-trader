import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ChatBoardEntity, PortfolioEntity, LeaderboardEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { Portfolio } from "@shared/types";
const DEFAULT_PORTFOLIO_ID = 'default-user';
const LEADERBOARD_ID = 'global';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // --- APEX TRADER ROUTES ---
  app.get('/api/portfolio', async (c) => {
    const portfolioEntity = new PortfolioEntity(c.env, DEFAULT_PORTFOLIO_ID);
    if (!(await portfolioEntity.exists())) {
      const newPortfolio = PortfolioEntity.initialState;
      newPortfolio.id = DEFAULT_PORTFOLIO_ID;
      await portfolioEntity.save(newPortfolio);
      return ok(c, newPortfolio);
    }
    return ok(c, await portfolioEntity.getState());
  });
  app.post('/api/portfolio', async (c) => {
    try {
      const newPortfolioState = (await c.req.json()) as Portfolio;
      if (
        !newPortfolioState ||
        typeof newPortfolioState.cash !== 'number' ||
        !Array.isArray(newPortfolioState.positions) ||
        !Array.isArray(newPortfolioState.tradeHistory) ||
        !Array.isArray(newPortfolioState.achievements)
      ) {
        return bad(c, 'Invalid portfolio data');
      }
      const portfolioEntity = new PortfolioEntity(c.env, DEFAULT_PORTFOLIO_ID);
      await portfolioEntity.save(newPortfolioState);
      // Update leaderboard
      const holdingsValue = newPortfolioState.positions.reduce((acc, pos) => acc + (pos.quantity * pos.averagePrice), 0);
      const totalValue = newPortfolioState.cash + holdingsValue;
      const leaderboard = new LeaderboardEntity(c.env, LEADERBOARD_ID);
      await leaderboard.updateEntry(DEFAULT_PORTFOLIO_ID, 'ApexAlpha', totalValue);
      return ok(c, await portfolioEntity.getState());
    } catch (e) {
      console.error('Failed to update portfolio:', e);
      return bad(c, 'Failed to parse portfolio data');
    }
  });
  app.post('/api/portfolio/reset', async (c) => {
    const portfolioEntity = new PortfolioEntity(c.env, DEFAULT_PORTFOLIO_ID);
    const newPortfolio = PortfolioEntity.initialState;
    newPortfolio.id = DEFAULT_PORTFOLIO_ID;
    await portfolioEntity.save(newPortfolio);
    const leaderboard = new LeaderboardEntity(c.env, LEADERBOARD_ID);
    await leaderboard.updateEntry(DEFAULT_PORTFOLIO_ID, 'ApexAlpha', newPortfolio.cash);
    return ok(c, newPortfolio);
  });
  app.get('/api/leaderboard', async (c) => {
    const leaderboard = new LeaderboardEntity(c.env, LEADERBOARD_ID);
    const state = await leaderboard.getState();
    return ok(c, state.entries);
  });
  // --- DEMO ROUTES (can be removed later) ---
  app.get('/api/test', (c) => c.json({ success: true, data: { name: 'CF Workers Demo' }}));
  // USERS
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await UserEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/users', async (c) => {
    const { name } = (await c.req.json()) as { name?: string };
    if (!name?.trim()) return bad(c, 'name required');
    return ok(c, await UserEntity.create(c.env, { id: crypto.randomUUID(), name: name.trim() }));
  });
  // CHATS
  app.get('/api/chats', async (c) => {
    await ChatBoardEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await ChatBoardEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/chats', async (c) => {
    const { title } = (await c.req.json()) as { title?: string };
    if (!title?.trim()) return bad(c, 'title required');
    const created = await ChatBoardEntity.create(c.env, { id: crypto.randomUUID(), title: title.trim(), messages: [] });
    return ok(c, { id: created.id, title: created.title });
  });
  // MESSAGES
  app.get('/api/chats/:chatId/messages', async (c) => {
    const chat = new ChatBoardEntity(c.env, c.req.param('chatId'));
    if (!await chat.exists()) return notFound(c, 'chat not found');
    return ok(c, await chat.listMessages());
  });
  app.post('/api/chats/:chatId/messages', async (c) => {
    const chatId = c.req.param('chatId');
    const { userId, text } = (await c.req.json()) as { userId?: string; text?: string };
    if (!isStr(userId) || !text?.trim()) return bad(c, 'userId and text required');
    const chat = new ChatBoardEntity(c.env, chatId);
    if (!await chat.exists()) return notFound(c, 'chat not found');
    return ok(c, await chat.sendMessage(userId, text.trim()));
  });
  // DELETE: Users
  app.delete('/api/users/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await UserEntity.delete(c.env, c.req.param('id')) }));
  app.post('/api/users/deleteMany', async (c) => {
    const { ids } = (await c.req.json()) as { ids?: string[] };
    const list = ids?.filter(isStr) ?? [];
    if (list.length === 0) return bad(c, 'ids required');
    return ok(c, { deletedCount: await UserEntity.deleteMany(c.env, list), ids: list });
  });
  // DELETE: Chats
  app.delete('/api/chats/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await ChatBoardEntity.delete(c.env, c.req.param('id')) }));
  app.post('/api/chats/deleteMany', async (c) => {
    const { ids } = (await c.req.json()) as { ids?: string[] };
    const list = ids?.filter(isStr) ?? [];
    if (list.length === 0) return bad(c, 'ids required');
    return ok(c, { deletedCount: await ChatBoardEntity.deleteMany(c.env, list), ids: list });
  });
}