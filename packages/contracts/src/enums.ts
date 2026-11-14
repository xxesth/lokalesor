export const TOPICS = ["hidden_gem", "local_food", "budget", "route", "nightlife", "safe_places"] as const;
export type Topic = (typeof TOPICS)[number];

export const BUDGETS = ["low", "mid", "high"] as const; // ₺ ₺₺ ₺₺₺
export type Budget = (typeof BUDGETS)[number];

export const PERSON_COLORS = ["kobalt", "safran", "yosun", "erik", "deniz"] as const;
export type PersonColor = (typeof PERSON_COLORS)[number]; // ADR-013

export const ROLES = ["tourist", "local"] as const;
export type Role = (typeof ROLES)[number];

export const QUESTION_STATUSES = ["pending", "assigned", "answered", "open_pool"] as const;
export type QuestionStatus = (typeof QUESTION_STATUSES)[number];

export const ASSIGNMENT_STATUSES = [
  "pending",
  "answered",
  "expired", // T doldu
  "declined", // lokal "Bilmiyorum, sıradakine geçsin" dedi
] as const;
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export const SYSTEM_MESSAGE_KINDS = ["assigned", "reassigned", "open_pool", "answered"] as const;
export type SystemMessageKind = (typeof SYSTEM_MESSAGE_KINDS)[number];

export const NOTIFICATION_KINDS = [
  // turiste
  "question_assigned",
  "question_reassigned",
  "answer_received",
  // lokale
  "new_question",
  "assignment_expired",
  "answer_rated",
] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export const REPORT_REASONS = ["spam", "wrong_info", "rude", "personal_info", "other"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];
