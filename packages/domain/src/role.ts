import type { CityId, Role, User } from "@lokale/contracts";

/** Kendi şehrindeyken lokal, başka şehirde turist. Demo için elle geçiş önceliklidir. */
export function resolveRole(user: Pick<User, "homeCity">, currentCity: CityId, override: Role | null): Role {
  if (override) return override;
  return user.homeCity === currentCity ? "local" : "tourist";
}
