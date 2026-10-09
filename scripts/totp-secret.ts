/**
 * Génère la clé de double authentification de l'administration.
 * Usage : npm run admin:totp
 * Mettre la clé dans la variable Vercel ADMIN_TOTP_SECRET, puis l'ajouter dans une application d'authentification.
 */
import { newTotpSecret } from "../src/lib/totp";

const secret = newTotpSecret();
console.log(`ADMIN_TOTP_SECRET=${secret}`);
console.log(`otpauth://totp/VOIX:admin?secret=${secret}&issuer=VOIX&digits=6&period=30`);
