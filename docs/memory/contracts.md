# Sözleşmeler (taslak)

Bu dosya `src/domain/types.ts` ve `src/data/repository.ts` için **taslaktır**. Kod yazılınca bu dosya değil, kodun kendisi tek doğru kaynak olur. Burada sadece özet ve kurallar kalır.
Değişiklik talepleri `progress.md` dosyasındaki "Sözleşme talepleri" bölümüne yazılır.

## Genel kurallar
- **Zaman** epoch milisaniye olarak tutulur (`number`). JSON'a sorunsuz dönüşür ve süre hesabı kolaydır. Biçimlendirme sadece UI'da yapılır.
- **ID'ler** string'dir ve her zaman adapter/sunucu tarafından üretilir.
- **Aktör parametre olarak gönderilmez.** "Ben kimim" bilgisi her zaman oturumdan alınır. `askQuestion(input)` çağrılır, `askQuestion(userId, input)` diye bir imza yoktur. Bu bir güvenlik kuralıdır.
- Her Repository fonksiyonu `Promise` döndürür. Hata durumunda `RepoError` fırlatır.
- Kişisel iletişim bilgisi hiçbir tipte yer almaz.

## `src/domain/types.ts`
```ts
export type Id = string;
export type Timestamp = number; // epoch ms

export const TOPICS = ["hidden_gem", "local_food", "budget", "route", "nightlife", "safe_places"] as const;
export type Topic = (typeof TOPICS)[number];

export const BUDGETS = ["low", "mid", "high"] as const; // ₺ ₺₺ ₺₺₺
export type Budget = (typeof BUDGETS)[number];

export type Role = "tourist" | "local";
export type CityId = string;      // "istanbul", "ankara", ...
export type DistrictId = string;  // "kadikoy", "moda", ...

export const PERSON_COLORS = ["kobalt", "safran", "yosun", "erik", "deniz"] as const;
export type PersonColor = (typeof PERSON_COLORS)[number]; // ADR-013

export interface User {
  id: Id;
  name: string;
  color: PersonColor;
  avatarUrl: string | null;
  homeCity: CityId;
  homeDistrict: DistrictId | null;
  interests: Topic[];
  verified: boolean;
  dailyLimit: number;             // 1-5
  createdAt: Timestamp;
}

export interface LocalStats {
  userId: Id;
  medianResponseMinutes: number | null; // son 30 gün; veri yoksa null
  responseRate: number | null;          // 0-1, 24 saat içinde cevaplanan atama oranı
  localScore: number | null;            // 0-100, faydalı oy / değerlendirilen cevap
  answeredCount: number;
  ratedCount: number;
}

export interface LocalSummary {          // kartlarda ve listelerde kullanılır
  id: Id; name: string; color: PersonColor; avatarUrl: string | null;
  homeCity: CityId; homeDistrict: DistrictId | null;
  verified: boolean;
  medianResponseMinutes: number | null;
}

export interface LocalProfile extends LocalSummary {
  stats: LocalStats;
  topics: Topic[];
  recentAnswers: ArchivedAnswer[];
}

export type QuestionStatus = "pending" | "assigned" | "answered" | "open_pool";

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

export type AssignmentStatus =
  | "pending"
  | "answered"
  | "expired"       // T doldu
  | "declined";     // lokal "Bilmiyorum, sıradakine geçsin" dedi

export interface Assignment {
  id: Id;
  questionId: Id;
  localId: Id;
  attempt: number;                // 1..maxAttempts
  assignedAt: Timestamp;
  deadline: Timestamp;            // assignedAt + T
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
  useful: boolean | null;         // üç ölçüt bağımsız, boş bırakılabilir (null)
  upToDate: boolean | null;
  trustworthy: boolean | null;
  createdAt: Timestamp;
}

export type SystemMessageKind = "assigned" | "reassigned" | "open_pool" | "answered";

export interface SystemMessage {
  id: Id;
  questionId: Id;
  kind: SystemMessageKind;
  text: string;                   // domain/messages.ts üretir
  createdAt: Timestamp;
}

export type NotificationKind =
  // turiste
  | "question_assigned"     // "Sorun X'e iletildi"
  | "question_reassigned"   // "Sorun X'e yönlendirildi"
  | "answer_received"       // "X soruna cevap verdi"
  // lokale
  | "new_question"          // "Yeni bir soru var: Konu – Semt. … N dk'n var." (Cevapla butonlu)
  | "assignment_expired"    // "Soru bir sonraki lokale yönlendirildi."
  | "answer_rated";         // "X cevabını faydalı buldu"

export interface Notification {
  id: Id;
  userId: Id;
  kind: NotificationKind;
  actor: LocalSummary | null;     // insan kaynaklıysa avatar, null ise sistem ikonu
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
  reason: "spam" | "wrong_info" | "rude" | "personal_info" | "other";
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
  items: ThreadItem[];                     // zamana göre sıralı
  assignments: AssignmentWithLocal[];      // QuestionJourney segmentleri, attempt sırasına göre
  currentAssignment: AssignmentWithLocal | null; // geri sayım + ilerleme çubuğu
  myRating: Rating | null;
}

export interface QuestionSummary {         // ActiveQuestionCard
  question: Question;
  currentAssignment: AssignmentWithLocal | null;
}

export interface InboxItem {
  assignment: Assignment;
  question: Question;
  touristName: string;            // sadece ad
}

export interface AnsweredItem {   // "Bugün cevapladıkların"
  question: Question;
  answer: Answer;
  touristName: string;
  responseMinutes: number;
}

export interface Capacity { used: number; limit: number; }

export interface InboxView {      // gelen kutusu tek çağrıda yüklenir
  pending: InboxItem[];           // deadline'a göre artan
  answeredToday: AnsweredItem[];
  capacity: Capacity;
}

export interface ArchivedAnswer {
  questionId: Id;
  questionText: string;
  topic: Topic;
  budget: Budget;
  answer: Answer;
  local: LocalSummary;
  usefulCount: number;
}
```

## `src/data/repository.ts`
```ts
export interface AskQuestionInput {
  city: CityId; district: DistrictId | null;
  text: string; topic: Topic; budget: Budget;
}
export interface SubmitAnswerInput {
  assignmentId: Id; text: string; templateId: string | null; archive: boolean;
}
export interface RateAnswerInput {
  answerId: Id; useful: boolean | null; upToDate: boolean | null; trustworthy: boolean | null;
}
export interface ReportInput {
  targetType: "user" | "answer"; targetId: Id;
  reason: Report["reason"]; description: string;
}
export interface SettingsPatch {
  dailyLimit?: number; homeDistrict?: DistrictId | null; interests?: Topic[];
}

export type Channel =
  | `question:${Id}`
  | `inbox:${Id}`
  | `notifications:${Id}`;

export interface ChannelEvent {
  channel: Channel;
  type: "changed";                // sinyal; veri taşımaz
  at: Timestamp;
}
export type Unsubscribe = () => void;

export interface Repository {
  // Turist
  findSimilarAnswers(q: { city: CityId; text: string; topic?: Topic }): Promise<ArchivedAnswer[]>;
  listPopular(q: { city: CityId; topic?: Topic; budget?: Budget; cursor?: string }): Promise<{ items: ArchivedAnswer[]; nextCursor: string | null }>;
  listAvailableLocals(city: CityId): Promise<LocalSummary[]>; // AskBox avatarları: bugün kapasitesi olan lokaller
  askQuestion(input: AskQuestionInput): Promise<QuestionSummary>;
  listMyQuestions(): Promise<QuestionSummary[]>;
  getQuestionThread(questionId: Id): Promise<QuestionThread>;
  rateAnswer(input: RateAnswerInput): Promise<{ rating: Rating; localScore: number | null }>; // teşekkür ekranı güncel skoru gösterir

  // Lokal
  getInbox(): Promise<InboxView>;
  submitAnswer(input: SubmitAnswerInput): Promise<Answer>;
  declineAssignment(assignmentId: Id): Promise<void>; // "Bilmiyorum, sıradakine geçsin" → hemen yeniden atar
  listMyArchive(): Promise<ArchivedAnswer[]>;
  setArchived(answerId: Id, archived: boolean): Promise<void>;

  // Ortak
  getLocalProfile(localId: Id): Promise<LocalProfile>;
  listNotifications(): Promise<Notification[]>;
  markNotificationsRead(ids?: Id[]): Promise<void>;
  updateSettings(patch: SettingsPatch): Promise<User>;
  report(input: ReportInput): Promise<void>;

  // Realtime
  subscribe(channel: Channel, cb: (e: ChannelEvent) => void): Unsubscribe;
}

export interface Session {
  user: User;
  currentCity: CityId;
  roleOverride: Role | null;      // demo için elle geçiş
}

export interface AuthPort {
  listDemoUsers(): Promise<User[]>;
  signInAsDemoUser(userId: Id): Promise<Session>;
  getSession(): Promise<Session | null>;
  setCurrentCity(city: CityId): Promise<Session>;
  setRoleOverride(role: Role | null): Promise<Session>;
  signOut(): Promise<void>;
}

export interface DemoControls {     // sadece geliştirme ortamında / mock'ta
  resetDemo(): Promise<void>;
  advanceTime(ms: number): Promise<void>;
  setReassignAfterMinutes(minutes: number): Promise<void>;
  runScheduler(): Promise<void>;  // süresi dolanları hemen işle
}
```

## `src/data/errors.ts`
```ts
export type RepoErrorCode =
  | "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND"
  | "VALIDATION" | "CAPACITY_FULL" | "ASSIGNMENT_EXPIRED" | "ASSIGNMENT_CLOSED" | "ALREADY_RATED";
  // ASSIGNMENT_CLOSED: cevap/decline gönderilirken atama artık "pending" değil
export class RepoError extends Error {
  constructor(public code: RepoErrorCode, message?: string) { super(message ?? code); }
}
```

## Domain fonksiyon imzaları (taslak)
```ts
// role.ts
resolveRole(user: User, currentCity: CityId, override: Role | null): Role

// matching.ts
interface Candidate { user: User; stats: LocalStats; assignedToday: number; }
filterEligible(q: Question, cands: Candidate[], excludedLocalIds: Id[]): Candidate[]
  // aynı şehir, turistin kendisi değil, bu soruya daha önce atanmamış, assignedToday < dailyLimit
rankCandidates(q: Question, cands: Candidate[], cfg: Config): Candidate[]
  // puan = w.topic*konuUyumu + w.district*semtUyumu + w.speed*hızPuanı; eşitlikte id'ye göre sıralanır (deterministik)
pickNextLocal(q: Question, cands: Candidate[], excluded: Id[], cfg: Config): Candidate | null

// reassignment.ts
isExpired(a: Assignment, now: Timestamp): boolean
planNextStep(q: Question, next: Candidate | null, cfg: Config):
  { action: "reassign"; localId: Id } | { action: "open_pool" }

// Etiketler (UI'ın tek kaynağı)
TOPIC_LABELS: Record<Topic, string>    // "Gizli mekân", "Yerel yemek", "Uygun fiyat", "Rota", "Gece hayatı", "Güvenli yerler"
BUDGET_LABELS: Record<Budget, string>  // "₺", "₺₺", "₺₺₺"

// countdown.ts
remaining(deadline: Timestamp, now: Timestamp): number        // ms, en az 0
isUrgent(deadline: Timestamp, now: Timestamp): boolean        // son 1 dk → nar

// messages.ts  (brief 2.3 + handoff README "Bildirimler")
assigned(localName: string, etaText: string): string
reassigned(prevName: string, newName: string, etaText: string): string
openPool(): string
answered(localName: string): string
localNewQuestion(topic: Topic, district: DistrictId | null, minutes: number): string
localAssignmentExpired(): string
answerRated(touristName: string): string

// stats.ts
computeLocalStats(localId: Id, assignments: Assignment[], answers: Answer[], ratings: Rating[], now: Timestamp, cfg: Config): LocalStats
formatEta(medianMinutes: number | null, cfg: Config): string   // "~25 dk" veya fallback

// similarity.ts
findSimilar(text: string, entries: ArchivedAnswer[], limit: number): ArchivedAnswer[]
  // Türkçe küçük harfe çevirme (toLocaleLowerCase("tr")), stopword temizleme, Jaccard benzerliği
```
