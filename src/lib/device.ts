import "server-only";
import { cookies } from "next/headers";
import { deviceHash, newToken } from "./security";

export const DEVICE_COOKIE = "voix_d";

/**
 * Jeton aléatoire d'appareil (aucune donnée personnelle), uniquement pour éviter qu'un même navigateur
 * compte plusieurs fois et pour permettre l'effacement de ses propres participations.
 * Seule son empreinte HMAC est stockée en base.
 */
export async function getDevice(create: boolean): Promise<{ hash: string; isNew: boolean } | null> {
  const jar = await cookies();
  const existing = jar.get(DEVICE_COOKIE)?.value;
  if (existing && /^[A-Za-z0-9_-]{43}$/.test(existing)) return { hash: deviceHash(existing), isNew: false };
  if (!create) return null;
  const token = newToken(32);
  jar.set(DEVICE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return { hash: deviceHash(token), isNew: true };
}

export async function clearDevice() {
  (await cookies()).delete(DEVICE_COOKIE);
}
