import { z } from "zod";
import { BUDGETS, REPORT_REASONS, ROLES, TOPICS } from "./enums";

const id = z.string().min(1);
const city = z.string().min(1);
const district = z.string().min(1).nullable();

// --- İstek şemaları (tipler z.infer ile türetilir) ---

export const askQuestionInput = z.object({
  city,
  district,
  text: z.string().trim().min(10, "Soru en az 10 karakter olmalı.").max(500),
  topic: z.enum(TOPICS),
  budget: z.enum(BUDGETS),
});
export type AskQuestionInput = z.infer<typeof askQuestionInput>;

export const submitAnswerInput = z.object({
  assignmentId: id,
  text: z.string().trim().min(5, "Cevap en az 5 karakter olmalı.").max(2000),
  templateId: z.string().nullable(),
  archive: z.boolean(),
});
export type SubmitAnswerInput = z.infer<typeof submitAnswerInput>;

export const rateAnswerInput = z.object({
  answerId: id,
  useful: z.boolean().nullable(),
  upToDate: z.boolean().nullable(),
  trustworthy: z.boolean().nullable(),
});
export type RateAnswerInput = z.infer<typeof rateAnswerInput>;

export const reportInput = z.object({
  targetType: z.enum(["user", "answer"]),
  targetId: id,
  reason: z.enum(REPORT_REASONS),
  description: z.string().max(1000),
});
export type ReportInput = z.infer<typeof reportInput>;

export const settingsPatch = z.object({
  dailyLimit: z.number().int().min(1).max(5).optional(),
  homeDistrict: district.optional(),
  interests: z.array(z.enum(TOPICS)).optional(),
});
export type SettingsPatch = z.infer<typeof settingsPatch>;

export const similarQuery = z.object({
  city,
  text: z.string(),
  topic: z.enum(TOPICS).optional(),
});
export type SimilarQuery = z.infer<typeof similarQuery>;

export const popularQuery = z.object({
  city,
  topic: z.enum(TOPICS).optional(),
  budget: z.enum(BUDGETS).optional(),
  cursor: z.string().optional(),
});
export type PopularQuery = z.infer<typeof popularQuery>;

export const sessionPatch = z.object({
  currentCity: city.optional(),
  roleOverride: z.enum(ROLES).nullable().optional(),
});
export type SessionPatch = z.infer<typeof sessionPatch>;

export const poolAnswerInput = z.object({
  questionId: id,
  text: submitAnswerInput.shape.text,
  templateId: z.string().nullable(),
  archive: z.boolean(),
});
export type PoolAnswerInput = z.infer<typeof poolAnswerInput>;

export const blockUserInput = z.object({ userId: id });
export type BlockUserInput = z.infer<typeof blockUserInput>;

/** Realtime token ömrü (ADR-019). */
export const REALTIME_TOKEN_TTL_MS = 5 * 60_000;

/** POST /api/realtime/token cevabı. expiresAt epoch ms. */
export const realtimeTokenResponse = z.object({ token: z.string(), expiresAt: z.number() });
export type RealtimeTokenResponse = z.infer<typeof realtimeTokenResponse>;

// --- REST uç noktaları (Faz 2: api doğrular, HttpAdapter çağırır) ---

export const ROUTES = {
  findSimilarAnswers: { method: "GET", path: "/api/questions/similar" },
  listPopular: { method: "GET", path: "/api/archive/popular" },
  listAvailableLocals: { method: "GET", path: "/api/locals/available" },
  askQuestion: { method: "POST", path: "/api/questions" },
  listMyQuestions: { method: "GET", path: "/api/questions/mine" },
  getQuestionThread: { method: "GET", path: "/api/questions/:id" },
  rateAnswer: { method: "POST", path: "/api/answers/:id/rating" },
  getInbox: { method: "GET", path: "/api/inbox" },
  submitAnswer: { method: "POST", path: "/api/answers" },
  declineAssignment: { method: "POST", path: "/api/assignments/:id/decline" },
  listMyArchive: { method: "GET", path: "/api/me/archive" },
  setArchived: { method: "PATCH", path: "/api/answers/:id" },
  getLocalProfile: { method: "GET", path: "/api/locals/:id" },
  listNotifications: { method: "GET", path: "/api/notifications" },
  markNotificationsRead: { method: "POST", path: "/api/notifications/read" },
  updateSettings: { method: "PATCH", path: "/api/me/settings" },
  report: { method: "POST", path: "/api/reports" },
  listOpenPool: { method: "GET", path: "/api/pool" },
  answerFromPool: { method: "POST", path: "/api/pool/:questionId/answer" },
  listBlocked: { method: "GET", path: "/api/me/blocks" },
  blockUser: { method: "POST", path: "/api/me/blocks" },
  unblockUser: { method: "DELETE", path: "/api/me/blocks/:userId" },
  realtimeToken: { method: "POST", path: "/api/realtime/token" },
  getSession: { method: "GET", path: "/api/me/session" },
  updateSession: { method: "PATCH", path: "/api/me/session" },
} as const;
export type RouteName = keyof typeof ROUTES;
