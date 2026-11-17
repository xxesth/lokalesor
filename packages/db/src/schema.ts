// Drizzle şeması: tek doğru kaynak Postgres (architecture.md). Kolonlar snake_case (casing ayarı),
// tablolar çoğul. Zamanlar timestamptz; sözleşmedeki epoch ms'ye core/mappers.ts çevirir.
// Index'ler architecture.md "Ölçek ve performans" tablosundaki sorgular için.
import {
  ASSIGNMENT_STATUSES,
  BUDGETS,
  NOTIFICATION_KINDS,
  PERSON_COLORS,
  QUESTION_STATUSES,
  REPORT_REASONS,
  SYSTEM_MESSAGE_KINDS,
  TOPICS,
} from "@lokale/contracts";
import { sql, type SQL } from "drizzle-orm";
import {
  boolean,
  customType,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const tsvector = customType<{ data: string }>({ dataType: () => "tsvector" });
const ts = (name?: string) =>
  name ? timestamp(name, { withTimezone: true, mode: "date" }) : timestamp({ withTimezone: true, mode: "date" });

export const topicEnum = pgEnum("topic", TOPICS);
export const budgetEnum = pgEnum("budget", BUDGETS);
export const personColorEnum = pgEnum("person_color", PERSON_COLORS);
export const questionStatusEnum = pgEnum("question_status", QUESTION_STATUSES);
export const assignmentStatusEnum = pgEnum("assignment_status", ASSIGNMENT_STATUSES);
export const systemMessageKindEnum = pgEnum("system_message_kind", SYSTEM_MESSAGE_KINDS);
export const notificationKindEnum = pgEnum("notification_kind", NOTIFICATION_KINDS);
export const reportReasonEnum = pgEnum("report_reason", REPORT_REASONS);
export const reportTargetEnum = pgEnum("report_target", ["user", "answer"]);
export const reportStatusEnum = pgEnum("report_status", ["open", "resolved"]);

/**
 * Kullanıcılar. Better Auth'un `user` modeli bu tabloya eşlenir (modelName: "users").
 * `email`, `email_verified`, `updated_at` Better Auth içindir; e-posta HİÇBİR cevapta dönmez (CLAUDE.md #12).
 * Better Auth'un session/account/verification tabloları Fatih'in `auth-schema.ts` dosyasında.
 */
export const users = pgTable(
  "users",
  {
    id: text().primaryKey(),
    name: text().notNull(),
    email: text().notNull().unique(),
    emailVerified: boolean().notNull().default(false),
    /** sözleşmedeki avatarUrl (Better Auth alan adı: image) */
    image: text(),
    color: personColorEnum().notNull(),
    homeCity: text().notNull(),
    homeDistrict: text(),
    interests: topicEnum().array().notNull().default(sql`'{}'`),
    verified: boolean().notNull().default(false),
    dailyLimit: smallint().notNull().default(2),
    createdAt: ts().notNull().defaultNow(),
    updatedAt: ts().notNull().defaultNow(),
  },
  (t) => [index("users_home_city_idx").on(t.homeCity), index("users_interests_gin").using("gin", t.interests)],
);

export const questions = pgTable(
  "questions",
  {
    id: text().primaryKey(),
    touristId: text().notNull().references(() => users.id),
    city: text().notNull(),
    district: text(),
    text: text().notNull(),
    topic: topicEnum().notNull(),
    budget: budgetEnum().notNull(),
    status: questionStatusEnum().notNull().default("pending"),
    attemptCount: integer().notNull().default(0),
    /** döngüsel FK olmasın diye referans yok; tutarlılığı core sağlar */
    currentAssignmentId: text(),
    createdAt: ts().notNull().defaultNow(),
    /** açık havuza düştüğü an (havuz sıralaması) */
    pooledAt: ts(),
    /** benzer cevap arama (Türkçe full-text) */
    searchVector: tsvector().generatedAlwaysAs((): SQL => sql`to_tsvector('turkish', ${questions.text})`),
  },
  (t) => [
    index("questions_tourist_idx").on(t.touristId, t.createdAt.desc()),
    index("questions_pool_idx").on(t.city, t.pooledAt).where(sql`${t.status} = 'open_pool'`),
    index("questions_search_gin").using("gin", t.searchVector),
  ],
);

export const assignments = pgTable(
  "assignments",
  {
    id: text().primaryKey(),
    questionId: text().notNull().references(() => questions.id, { onDelete: "cascade" }),
    localId: text().notNull().references(() => users.id),
    attempt: integer().notNull(),
    assignedAt: ts().notNull(),
    deadline: ts().notNull(),
    status: assignmentStatusEnum().notNull().default("pending"),
    resolvedAt: ts(),
  },
  (t) => [
    // yedek tarama: sadece bekleyenler (ADR-020)
    index("assignments_pending_deadline_idx").on(t.deadline).where(sql`${t.status} = 'pending'`),
    // günlük kapasite + istatistik penceresi
    index("assignments_local_assigned_idx").on(t.localId, t.assignedAt),
    uniqueIndex("assignments_question_attempt_uq").on(t.questionId, t.attempt),
    // bir soruda aynı anda en fazla bir bekleyen atama
    uniqueIndex("assignments_one_pending_uq").on(t.questionId).where(sql`${t.status} = 'pending'`),
  ],
);

export const answers = pgTable(
  "answers",
  {
    id: text().primaryKey(),
    questionId: text().notNull().references(() => questions.id, { onDelete: "cascade" }),
    localId: text().notNull().references(() => users.id),
    text: text().notNull(),
    templateId: text(),
    archived: boolean().notNull().default(false),
    createdAt: ts().notNull().defaultNow(),
  },
  (t) => [
    // bir soruya tek cevap: açık havuzda "ilk cevap kazanır" yarışını veritabanı garanti eder
    uniqueIndex("answers_question_uq").on(t.questionId),
    index("answers_local_idx").on(t.localId, t.createdAt.desc()),
    index("answers_archived_idx").on(t.questionId).where(sql`${t.archived}`),
  ],
);

export const ratings = pgTable(
  "ratings",
  {
    id: text().primaryKey(),
    answerId: text().notNull().references(() => answers.id, { onDelete: "cascade" }),
    touristId: text().notNull().references(() => users.id),
    useful: boolean(),
    upToDate: boolean(),
    trustworthy: boolean(),
    createdAt: ts().notNull().defaultNow(),
  },
  (t) => [uniqueIndex("ratings_answer_tourist_uq").on(t.answerId, t.touristId)],
);

export const systemMessages = pgTable(
  "system_messages",
  {
    id: text().primaryKey(),
    questionId: text().notNull().references(() => questions.id, { onDelete: "cascade" }),
    kind: systemMessageKindEnum().notNull(),
    text: text().notNull(),
    createdAt: ts().notNull().defaultNow(),
  },
  (t) => [index("system_messages_question_idx").on(t.questionId, t.createdAt)],
);

export const notifications = pgTable(
  "notifications",
  {
    id: text().primaryKey(),
    userId: text().notNull().references(() => users.id, { onDelete: "cascade" }),
    kind: notificationKindEnum().notNull(),
    /** insan kaynaklıysa kim (avatar); null → sistem */
    actorId: text().references(() => users.id),
    questionId: text().notNull().references(() => questions.id, { onDelete: "cascade" }),
    text: text().notNull(),
    read: boolean().notNull().default(false),
    createdAt: ts().notNull().defaultNow(),
  },
  (t) => [index("notifications_user_idx").on(t.userId, t.createdAt.desc())],
);

export const reports = pgTable(
  "reports",
  {
    id: text().primaryKey(),
    reporterId: text().notNull().references(() => users.id),
    targetType: reportTargetEnum().notNull(),
    targetId: text().notNull(),
    reason: reportReasonEnum().notNull(),
    description: text().notNull().default(""),
    status: reportStatusEnum().notNull().default("open"),
    createdAt: ts().notNull().defaultNow(),
  },
  // moderasyon kuyruğu (Faz 3): açık şikâyetler, eskiden yeniye
  (t) => [index("reports_open_idx").on(t.createdAt).where(sql`${t.status} = 'open'`)],
);

/** Engel iki yönlü uygulanır: (a engelledi b) ya da (b engelledi a) → eşleşmezler. */
export const blocks = pgTable(
  "blocks",
  {
    blockerId: text().notNull().references(() => users.id, { onDelete: "cascade" }),
    blockedId: text().notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: ts().notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.blockerId, t.blockedId] }), index("blocks_blocked_idx").on(t.blockedId)],
);
