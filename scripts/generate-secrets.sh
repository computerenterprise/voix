#!/usr/bin/env bash
# Génère les secrets à coller dans Vercel (Settings → Environment Variables).
# Usage : ./scripts/generate-secrets.sh "mot de passe admin long"
set -euo pipefail
[ "${1:-}" ] || { echo "Usage : $0 \"mot de passe admin (14 caractères minimum)\""; exit 1; }
echo "APP_SECRET=$(openssl rand -base64 48 | tr -d '\n')"
echo "CRON_SECRET=$(openssl rand -base64 32 | tr -d '\n')"
echo "ADMIN_PASSWORD_HASH=$(npx --yes tsx scripts/hash-password.ts "$1")"
