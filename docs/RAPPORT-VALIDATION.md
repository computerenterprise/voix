# Rapport de validation — VOIX (8 octobre 2026)

Tous les résultats ci-dessous ont été obtenus en exécutant réellement les tests, sur un build de production
(`next build` + `next start`) et une base PostgreSQL 16 locale. Les tests utilisent des lycées **fictifs**
(`tests/fixtures/annuaire-fictif.csv`), jamais présentés comme réels.

## Tests automatisés

| Suite | Résultat |
|---|---|
| Unitaires (`npm test`) : filtre de texte, normalisation, CSV | 5/5 réussis |
| Parcours e2e Playwright sur mobile (Pixel 7) (`npm run test:e2e`) | 12/12 réussis |

Parcours couverts :
1. Accueil : titre, sous-titre, bouton ; aucun chiffre affiché sans participation réelle.
2. Recherche : autocomplétion, homonymes (deux « Victor Hugo » distingués par ville), faute de frappe
   (« viktor hugi »), code postal, absence de résultat, navigation vers la page.
3. Participation : téléphone dans le texte bloqué, envoi, message non publié, doublon du même navigateur fusionné
   (1 seule participation en base).
4. Soutien en un geste depuis un autre navigateur : le total passe à 2.
5. Robot (champ piège) : participation enregistrée comme suspendue, non comptée.
6. API : origine étrangère refusée (403), injection SQL dans l'identifiant rejetée (400), catégorie inconnue (400),
   lycée inexistant (404).
7. Administration : redirection sans session, mauvais mot de passe refusé, publication d'un message après
   modération, participation suspecte visible, état de traitement affiché publiquement.
8. Partage : balises Open Graph, image 1200×630 et image story 1080×1920 générées (PNG), 404 sur lycée inconnu.
9. Tableau national et pages légales (200), marqueurs « À compléter » visibles.
10. Signalement d'abus et demande de suppression enregistrés.
11. Effacement immédiat des participations du navigateur.
12. En-têtes de sécurité (CSP, HSTS, nosniff, pas de X-Powered-By).

## Tests manuels

- Limitation de débit : 30 envois par connexion et par 10 minutes, puis réponses 429 (vérifié avec 33 envois).
- Drapeau « connexion partagée » posé à partir de 10 participations par jour et par lycée (vérifié).
- Charge (un seul processus, conteneur de test) : page lycée ~105 requêtes/s à 50 connexions simultanées, 0 erreur ;
  en production, Vercel multiplie les instances.
- Revue visuelle sur mobile et desktop : accueil, recherche, page lycée, participation, tableau, images de partage.

## Données officielles (fichier fourni le 8 octobre 2026)

- Export « Annuaire de l'éducation » filtré sur les lycées : 5 644 lignes, toutes « OUVERT ».
- Import : **4 917 lycées** dans 106 départements et collectivités. Écartés : 689 « sections » rattachées
  administrativement à un autre lycée (même établissement pour les élèves) et les écoles uniquement post-bac.
- Recherche vérifiée sur de vrais noms : « victor hugo besancon », « henri 4 » (chiffres romains), « condorset »
  (faute de frappe), « 75005 » (code postal), « louis-le-gr » (saisie en cours), « marseille thiers ».

## Non vérifié ici (bloqué par l'environnement)

- Déploiement Vercel/Supabase : non accessible depuis cet environnement.
- Aperçus réels dans WhatsApp / Instagram : nécessite une URL publique.

## Anti-triche des votes (2026-10-08)

- Vérification anti-robot invisible (preuve de travail SHA-256, 16 bits, ~1 s sur téléphone) : défi signé, lié au lycée, valable 15 min, à usage unique. Aucun service tiers, aucun cookie supplémentaire. Réglable par `POW_BITS`.
- Au-delà de 3 navigateurs différents depuis la même connexion, le même jour, pour le même lycée : les nouvelles participations passent « en vérification » et ne sont pas comptées. La page du lycée affiche « + N en cours de vérification ». L'admin peut valider ou suspendre le groupe.
- Limites connues : changer de connexion (wifi ↔ 4G) permet quelques voix de plus. Sans identification des élèves, la triche est limitée, pas impossible.
- Tests : 14/14 e2e (dont « triche : nouveaux navigateurs en série » et « anti-robot : preuve de travail obligatoire, non rejouable, liée au lycée »), 5/5 unitaires.
