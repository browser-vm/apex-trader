/**
 * Minimal real-world demo: One Durable Object instance per entity (User, ChatBoard), with Indexes for listing.
 */
import { Entity, IndexedEntity } from "./core-utils";
import type { User, Chat, ChatMessage, Portfolio, LeaderboardEntry } from "@shared/types";
import { MOCK_CHAT_MESSAGES, MOCK_CHATS, MOCK_USERS } from "@shared/mock-data";
// USER ENTITY: one DO instance per user
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "" };
  static seedData = MOCK_USERS;
}
// CHAT BOARD ENTITY: one DO instance per chat board, stores its own messages
export type ChatBoardState = Chat & { messages: ChatMessage[] };
const SEED_CHAT_BOARDS: ChatBoardState[] = MOCK_CHATS.map(c => ({
  ...c,
  messages: MOCK_CHAT_MESSAGES.filter(m => m.chatId === c.id),
}));
export class ChatBoardEntity extends IndexedEntity<ChatBoardState> {
  static readonly entityName = "chat";
  static readonly indexName = "chats";
  static readonly initialState: ChatBoardState = { id: "", title: "", messages: [] };
  static seedData = SEED_CHAT_BOARDS;
  async listMessages(): Promise<ChatMessage[]> {
    const { messages } = await this.getState();
    return messages;
  }
  async sendMessage(userId: string, text: string): Promise<ChatMessage> {
    const msg: ChatMessage = { id: crypto.randomUUID(), chatId: this.id, userId, text, ts: Date.now() };
    await this.mutate(s => ({ ...s, messages: [...s.messages, msg] }));
    return msg;
  }
}
// PORTFOLIO ENTITY: one DO instance per user portfolio
export class PortfolioEntity extends IndexedEntity<Portfolio> {
    static readonly entityName = "portfolio";
    static readonly indexName = "portfolios";
    static readonly initialState: Portfolio = { id: "", cash: 100000, positions: [], tradeHistory: [], achievements: [] };
}
// LEADERBOARD ENTITY: single global instance
interface LeaderboardState {
    entries: LeaderboardEntry[];
}
export class LeaderboardEntity extends Entity<LeaderboardState> {
    static readonly entityName = "leaderboard";
    static readonly initialState: LeaderboardState = { entries: [] };
    async updateEntry(userId: string, username: string, portfolioValue: number) {
        await this.mutate(state => {
            const newEntries = state.entries.filter(e => e.userId !== userId);
            newEntries.push({ userId, username, portfolioValue, rank: 0 });
            newEntries.sort((a, b) => b.portfolioValue - a.portfolioValue);
            const rankedEntries = newEntries.slice(0, 100).map((entry, index) => ({
                ...entry,
                rank: index + 1,
            }));
            return { entries: rankedEntries };
        });
    }
    async removeEntry(userId: string) {
        await this.mutate(state => {
            const newEntries = state.entries.filter(e => e.userId !== userId);
            return { entries: newEntries };
        });
    }
}