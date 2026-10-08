# Déploiement (Vercel + Supabase)

Durée : environ 20 minutes.

## 1. Base de données (Supabase)

1. Créer un projet Supabase en **région UE** (Paris `eu-west-3` ou Francfort `eu-central-1`).
2. Settings → Database → Connection string → **Transaction pooler** (port 6543). C'est `DATABASE_URL`.
3. Depuis un poste avec Node 20+ :
   ```bash
   DATABASE_URL="..." npm run db:migrate
   DATABASE_URL="..." npm run db:import -- fr-en-annuaire-education.csv
   ```
4. Activer les sauvegardes (quotidiennes incluses ; PITR sur offre payante). Copie indépendante : `scripts/backup.sh`.
5. La migration `002_rls.sql` active la sécurité au niveau des lignes (RLS) sans aucune politique : la clé
   publique `anon` de Supabase ne peut lire ni écrire aucune table. L'application, elle, se connecte en propriétaire.

## 2. Hébergement (Vercel)

1. Importer le dépôt GitHub dans Vercel (framework détecté : Next.js).
2. Variables d'environnement (Production). `./scripts/generate-secrets.sh "mot de passe admin"` génère les trois secrets :
   - `DATABASE_URL` : URL du pooler Supabase.
   - `APP_SECRET` : `openssl rand -base64 48`.
   - `ADMIN_PASSWORD_HASH` : `npm run admin:hash -- "un mot de passe long et unique"`.
   - `CRON_SECRET` : `openssl rand -base64 32` (Vercel l'envoie à la tâche de purge).
   - `NEXT_PUBLIC_SITE_URL` : l'URL publique, par ex. `https://voix.fr`.
3. Déployer. La région des fonctions est fixée à Paris (`cdg1`) dans `vercel.json`.
4. Vérifier : `/api/health` doit répondre `"ok":true` (il vérifie la base, la présence des lycées et des réglages, sans jamais afficher leur valeur).
5. Brancher un moniteur externe (UptimeRobot, Better Stack…) sur `/api/health`.
6. Activer le pare-feu Vercel (Attack Challenge Mode en cas de pic d'abus).

## 3. Après déploiement

- Se connecter sur `/admin/connexion`.
- Tester sur mobile : recherche d'un lycée, participation, partage WhatsApp (aperçu), story.
- Vérifier l'aperçu Open Graph d'une page lycée (ex. via le débogueur de partage de Meta).
