import postgres from "postgres";
export const db = () => postgres(process.env.E2E_DATABASE_URL ?? "postgres://voix@127.0.0.1:5432/voix_test", { max: 1, onnotice: () => {} });
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "voix-admin-dev-password";
export const SCHOOL = "9990001A"; // établissement FICTIF de la base de test
