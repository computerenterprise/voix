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

## Non vérifié ici (bloqué par l'environnement)

- Import du fichier officiel complet de l'Annuaire de l'Éducation : l'accès à data.education.gouv.fr est bloqué
  depuis cet environnement. Le script est testé sur un fichier au même format.
- Déploiement Vercel/Supabase : non accessible depuis cet environnement.
- Aperçus réels dans WhatsApp / Instagram : nécessite une URL publique.
