# VOIX — « Ton lycée, ta fac. Ta voix. »

Plateforme civique indépendante : les lycéens signalent les problèmes de leur établissement, soutiennent les
préoccupations des autres élèves et consultent des résultats agrégés.

## Stack

- Next.js 16 (App Router, TypeScript), Tailwind CSS 4, rendu serveur.
- PostgreSQL (Supabase, Neon ou tout Postgres ≥ 14 avec `pg_trgm`), client `postgres` sans requêtes préparées
  (compatible poolers).
- Hébergement visé : Vercel (région `cdg1`, Paris) + base en région UE.
- Aucune dépendance tierce côté navigateur : pas d'analytics, pas de CDN externe, polices auto-hébergées.

## Démarrer en local

```bash
npm install
cp .env.example .env.local        # puis remplir
npm run db:migrate
npm run db:import -- fr-en-annuaire-education.csv   # export officiel, voir ci-dessous
npm run dev
```

Données des lycées : export CSV du jeu « Annuaire de l'éducation » (data.education.gouv.fr), filtré ou non
(le script ne garde que les lycées ouverts) :
https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-annuaire-education/exports/csv?where=type_etablissement%3D%22Lyc%C3%A9e%22&delimiter=%3B

## Tests

```bash
npm test                 # tests unitaires (filtres de texte, normalisation, CSV)
npm run test:e2e         # 12 parcours Playwright sur une base voix_test (données FICTIVES)
```

La base e2e est `postgres://voix@127.0.0.1:5432/voix_test` par défaut (`E2E_DATABASE_URL` pour changer) ;
préparer avec `npm run db:migrate` puis `npm run db:import -- tests/fixtures/annuaire-fictif.csv`.

## Déploiement

Voir [docs/DEPLOIEMENT.md](docs/DEPLOIEMENT.md). Avant toute ouverture publique : [docs/AVANT-LANCEMENT.md](docs/AVANT-LANCEMENT.md).

## Architecture

| Élément | Où |
|---|---|
| Schéma SQL | `db/migrations/` |
| Recherche (trigrammes, homonymes, fautes) | `src/lib/schools.ts` |
| Participation, anti-abus | `src/lib/participation.ts`, `src/app/api/participations` |
| Filtre du texte libre | `src/lib/text-guard.ts` |
| Images de partage (Open Graph, story) | `src/lib/share-image.tsx` |
| Administration | `src/app/admin` |
| Purge RGPD quotidienne | `src/app/api/cron/purge` + `vercel.json` |
| Informations légales à compléter | `src/config/legal.ts` |
