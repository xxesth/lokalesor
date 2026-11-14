export const REPO_ERROR_CODES = [
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "NOT_FOUND",
  "VALIDATION",
  "CAPACITY_FULL",
  "ASSIGNMENT_EXPIRED",
  // cevap/decline gönderilirken atama artık "pending" değil
  "ASSIGNMENT_CLOSED",
  "ALREADY_RATED",
] as const;
export type RepoErrorCode = (typeof REPO_ERROR_CODES)[number];

export class RepoError extends Error {
  readonly code: RepoErrorCode;
  constructor(code: RepoErrorCode, message?: string) {
    super(message ?? code);
    this.name = "RepoError";
    this.code = code;
  }
}

export const isRepoError = (e: unknown): e is RepoError => e instanceof RepoError;

export const HTTP_STATUS: Record<RepoErrorCode, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION: 400,
  CAPACITY_FULL: 409,
  ASSIGNMENT_EXPIRED: 409,
  ASSIGNMENT_CLOSED: 409,
  ALREADY_RATED: 409,
};

/** Hata cevabının gövdesi. HttpAdapter bunu tekrar RepoError'a çevirir. */
export interface ErrorBody {
  code: RepoErrorCode;
  message: string;
}
