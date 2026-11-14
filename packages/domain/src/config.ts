export interface MatchWeights {
  topic: number;
  district: number;
  speed: number;
}

export interface Config {
  /** T: atama süresi (dk) */
  reassignAfterMinutes: number;
  /** aşılırsa soru açık havuza düşer */
  maxAttempts: number;
  defaultDailyLimit: number;
  statsWindowDays: number;
  responseRateWindowHours: number;
  /** son bu kadar ms → nar */
  urgentThresholdMs: number;
  matchWeights: MatchWeights;
}

export const DEFAULT_CONFIG: Config = {
  reassignAfterMinutes: 30,
  maxAttempts: 3,
  defaultDailyLimit: 2,
  statsWindowDays: 30,
  responseRateWindowHours: 24,
  urgentThresholdMs: 60_000,
  matchWeights: { topic: 3, district: 2, speed: 1 },
};

/** Demo: T = 3 dk (ADR-015). */
export const DEMO_CONFIG: Config = { ...DEFAULT_CONFIG, reassignAfterMinutes: 3 };

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
