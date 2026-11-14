// SÖZLEŞME: istemcinin veri portu. Sadece Mali'nin onayıyla değişir (CLAUDE.md #5).
// Mock (Faz 1) ve Http (Faz 2) adapter'ları bu arayüzü uygular. Aktör her zaman oturumdan alınır.
import type {
  Answer,
  ArchivedAnswer,
  AskQuestionInput,
  Channel,
  ChannelEvent,
  CityId,
  Id,
  InboxView,
  LocalProfile,
  LocalSummary,
  Notification,
  PopularQuery,
  QuestionSummary,
  QuestionThread,
  RateAnswerInput,
  Rating,
  ReportInput,
  Role,
  Session,
  SettingsPatch,
  SimilarQuery,
  SubmitAnswerInput,
  User,
} from "@lokale/contracts";

export type Unsubscribe = () => void;

export interface Repository {
  // Turist
  findSimilarAnswers(q: SimilarQuery): Promise<ArchivedAnswer[]>;
  listPopular(q: PopularQuery): Promise<{ items: ArchivedAnswer[]; nextCursor: string | null }>;
  /** AskBox avatarları: bugün kapasitesi olan lokaller */
  listAvailableLocals(city: CityId): Promise<LocalSummary[]>;
  askQuestion(input: AskQuestionInput): Promise<QuestionSummary>;
  listMyQuestions(): Promise<QuestionSummary[]>;
  getQuestionThread(questionId: Id): Promise<QuestionThread>;
  /** teşekkür ekranı güncel skoru gösterir */
  rateAnswer(input: RateAnswerInput): Promise<{ rating: Rating; localScore: number | null }>;

  // Lokal
  getInbox(): Promise<InboxView>;
  submitAnswer(input: SubmitAnswerInput): Promise<Answer>;
  /** "Bilmiyorum, sıradakine geçsin" → hemen yeniden atar */
  declineAssignment(assignmentId: Id): Promise<void>;
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

export interface AuthPort {
  listDemoUsers(): Promise<User[]>;
  signInAsDemoUser(userId: Id): Promise<Session>;
  getSession(): Promise<Session | null>;
  setCurrentCity(city: CityId): Promise<Session>;
  setRoleOverride(role: Role | null): Promise<Session>;
  signOut(): Promise<void>;
}

/** Sadece geliştirme ortamında / mock'ta. */
export interface DemoControls {
  resetDemo(): Promise<void>;
  advanceTime(ms: number): Promise<void>;
  setReassignAfterMinutes(minutes: number): Promise<void>;
  /** süresi dolanları hemen işle */
  runScheduler(): Promise<void>;
  getDebugState(): Promise<DemoDebugState>;
}

export interface DemoDebugState {
  now: number;
  offsetMs: number;
  reassignAfterMinutes: number;
  assignments: { id: Id; questionText: string; localName: string; attempt: number; status: string; deadline: number }[];
}

/** Sunucu saatine göre "şimdi" (mock'ta ileri sarılabilir). */
export interface Clock {
  now(): number;
}
