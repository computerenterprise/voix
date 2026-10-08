#!/usr/bin/env bash
# Sauvegarde complète chiffrable de la base. Usage : DATABASE_URL=... ./scripts/backup.sh
# (Supabase fait aussi des sauvegardes quotidiennes ; ce script permet une copie indépendante.)
set -euo pipefail
out="voix-$(date -u +%Y%m%dT%H%M%SZ).dump"
pg_dump --format=custom --no-owner --dbname="$DATABASE_URL" --file="$out"
echo "Sauvegarde écrite : $out (à stocker chiffrée, hors du dépôt)"
