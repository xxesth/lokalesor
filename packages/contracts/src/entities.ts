import type {
  AssignmentStatus,
  Budget,
  NotificationKind,
  PersonColor,
  QuestionStatus,
  ReportReason,
  Role,
  SystemMessageKind,
  Topic,
} from "./enums";

export type Id = string;
/** epoch milisaniye */
export type Timestamp = number;
/** "istanbul", "ankara", "izmir" */
export type CityId = string;
/** "kadikoy", "moda", ... */
export type DistrictId = string;

export interface User {
  id: Id;
  name: string;
  color: PersonColor;
  avatarUrl: string | null;
  homeCity: CityId;
  homeDistrict: DistrictId | null;
  interests: Topic[];
  verified: boolean;
  /** 1-5 */
  dailyLimit: number;
  createdAt: Timestamp;
}

export interface LocalStats {
  userId: Id;
  /** son 30 gün; veri yoksa null */
  medianResponseMinutes: number | null;
  /** 0-1, 24 saat içinde cevaplanan atama oranı */
  responseRate: number | null;
  /** 0-100, faydalı oy / değerlendirilen cevap */
  localScore: number | null;
  answeredCount: number;
  ratedCount: number;
}

/** Kartlarda ve listelerde kullanılır. */
export interface LocalSummary {
  id: Id;
  name: string;
  color: PersonColor;
  avatarUrl: string | null;
  homeCity: CityId;
  homeDistrict: DistrictId | null;
  verified: boolean;
  medianResponseMinutes: number | null;
}

export interface LocalProfile extends LocalSummary {
  stats: LocalStats;
  topics: Topic[];
  recentAnswers: ArchivedAnswer[];
}

export interface Question {
  id: Id;
  touristId: Id;
  city: CityId;
  district: DistrictId | null;
  text: string;
  topic: Topic;
  budget: Budget;
  status: QuestionStatus;
  attemptCount: number;
  currentAssignmentId: Id | null;
  createdAt: Timestamp;
}

export interface Assignment {
  id: Id;
  questionId: Id;
  localId: Id;
  /** 1..maxAttempts */
  attempt: number;
  assignedAt: Timestamp;
  /** assignedAt + T */
  deadline: Timestamp;
  status: AssignmentStatus;
  resolvedAt: Timestamp | null;
}

export interface Answer {
  id: Id;
  questionId: Id;
  localId: Id;
  text: string;
  templateId: string | null;
  archived: boolean;
  createdAt: Timestamp;
}

export interface Rating {
  id: Id;
  answerId: Id;
  touristId: Id;
  /** üç ölçüt bağımsız, boş bırakılabilir (null) */
  useful: boolean | null;
  upToDate: boolean | null;
  trustworthy: boolean | null;
  createdAt: Timestamp;
}

export interface SystemMessage {
  id: Id;
  questionId: Id;
  kind: SystemMessageKind;
  /** @lokale/domain messages.ts üretir */
  text: string;
  createdAt: Timestamp;
}

export interface Notification {
  id: Id;
  userId: Id;
  kind: NotificationKind;
  /** insan kaynaklıysa avatar, null ise sistem ikonu */
  actor: LocalSummary | null;
  questionId: Id;
  text: string;
  read: boolean;
  createdAt: Timestamp;
}

export interface Report {
  id: Id;
  reporterId: Id;
  targetType: "user" | "answer";
  targetId: Id;
  reason: ReportReason;
  description: string;
  status: "open" | "resolved";
  createdAt: Timestamp;
}

// --- Görünüm modelleri (Repository bunları döndürür) ---

export type ThreadItem =
  | { type: "system"; message: SystemMessage }
  | { type: "answer"; answer: Answer; local: LocalSummary };

export interface AssignmentWithLocal extends Assignment {
  local: LocalSummary;
}

export interface QuestionThread {
  question: Question;
  asker: { name: string; color: PersonColor };
  /** zamana göre sıralı */
  items: ThreadItem[];
  /** QuestionJourney segmentleri, attempt sırasına göre */
  assignments: AssignmentWithLocal[];
  /** geri sayım + ilerleme çubuğu */
  currentAssignment: AssignmentWithLocal | null;
  myRating: Rating | null;
}

/** ActiveQuestionCard */
export interface QuestionSummary {
  question: Question;
  currentAssignment: AssignmentWithLocal | null;
}

export interface InboxItem {
  assignment: Assignment;
  question: Question;
  /** sadece ad ve avatar rengi (kişisel bilgi yok) */
  touristName: string;
  touristColor: PersonColor;
}

/** "Bugün cevapladıkların" */
export interface AnsweredItem {
  question: Question;
  answer: Answer;
  touristName: string;
  responseMinutes: number;
}

export interface Capacity {
  used: number;
  limit: number;
}

/** Gelen kutusu tek çağrıda yüklenir. */
export interface InboxView {
  /** deadline'a göre artan */
  pending: InboxItem[];
  answeredToday: AnsweredItem[];
  capacity: Capacity;
}

export interface ArchivedAnswer {
  questionId: Id;
  questionText: string;
  topic: Topic;
  budget: Budget;
  district: DistrictId | null;
  answer: Answer;
  local: LocalSummary;
  usefulCount: number;
}

export interface Session {
  user: User;
  currentCity: CityId;
  /** demo için elle geçiş */
  roleOverride: Role | null;
}
