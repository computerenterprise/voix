// Génère l'empreinte ADMIN_PASSWORD_HASH. Usage : npm run admin:hash -- "mot de passe long"
import { randomBytes, scryptSync } from "node:crypto";
const pw = process.argv[2];
if (!pw || pw.length < 14) {
  console.error("Donne un mot de passe d'au moins 14 caractères.");
  process.exit(1);
}
const salt = randomBytes(16);
console.log(`scrypt:${salt.toString("base64url")}:${scryptSync(pw, salt, 64).toString("base64url")}`);
