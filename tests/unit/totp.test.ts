import { test } from "node:test";
import assert from "node:assert/strict";
import { base32Decode, base32Encode, totp, verifyTotp } from "../../src/lib/totp";

// Vecteurs de test officiels de la RFC 6238 (SHA-1, secret ASCII « 12345678901234567890 »), sur 8 chiffres.
const SECRET = Buffer.from("12345678901234567890");
test("TOTP : vecteurs de la RFC 6238", () => {
  assert.equal(totp(SECRET, 59_000, 8), "94287082");
  assert.equal(totp(SECRET, 1111111109_000, 8), "07081804");
  assert.equal(totp(SECRET, 2000000000_000, 8), "69279037");
});

test("TOTP : base32 aller-retour et vérification avec tolérance de 30 s", () => {
  const b32 = base32Encode(SECRET);
  assert.equal(b32, "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ");
  assert.deepEqual(base32Decode(b32), SECRET);
  const now = 1_700_000_000_000;
  const code = totp(SECRET, now);
  assert.ok(verifyTotp(b32, code, now));
  assert.ok(verifyTotp(b32, code, now + 30_000));
  assert.ok(!verifyTotp(b32, code, now + 120_000));
  assert.ok(!verifyTotp(b32, "12345", now));
});
