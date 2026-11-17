// Realtime bağlantı token'ı (ADR-019): api imzalar (POST /api/realtime/token), realtime doğrular.
// HS256, 5 dk. İçerik: RealtimeTokenClaims (sub = userId). Doğrulama veritabanına gitmez.
import { REALTIME_TOKEN_TTL_MS, type Id, type RealtimeTokenResponse } from "@lokale/contracts";
import { SignJWT } from "jose";

export async function signRealtimeToken(secret: string, userId: Id, now = Date.now()): Promise<RealtimeTokenResponse> {
  if (secret.length < 32) throw new Error("REALTIME_TOKEN_SECRET en az 32 karakter olmalı.");
  const expiresAt = now + REALTIME_TOKEN_TTL_MS;
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt(Math.floor(now / 1000))
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(new TextEncoder().encode(secret));
  return { token, expiresAt };
}
