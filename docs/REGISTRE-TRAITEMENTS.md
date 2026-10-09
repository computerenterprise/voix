# Registre des activités de traitement (RGPD, article 30)

Tenu par l'éditeur de VOIX. Mis à jour le 9 octobre 2026. Document interne, à présenter à la CNIL sur demande.

**Responsable de traitement** : l'éditeur indiqué dans les mentions légales (`src/config/legal.ts`).
**Sous-traitants** : Vercel Inc. (hébergement, États-Unis, clauses contractuelles types) ; Supabase Inc. (base de
données, région UE Paris). Accepter leurs contrats de sous-traitance (DPA) dans leurs tableaux de bord.

## 1. Participations (problèmes soutenus)
- **Finalité** : afficher des problèmes agrégés par établissement, sans identifier personne.
- **Base légale** : intérêt légitime (art. 6.1.f), avec mesures renforcées pour les mineurs.
- **Personnes** : élèves et étudiants, y compris mineurs.
- **Données** : établissement, problèmes cochés, date, empreinte de navigateur (cookie technique), empreinte du jour
  de la connexion, empreinte du mot de passe facultatif. Aucun nom, e-mail, téléphone ni IP en clair.
- **Destinataires** : équipe VOIX (admin). Public : uniquement des totaux agrégés.
- **Durée** : 12 mois ; empreinte de connexion effacée à 30 jours (tâche quotidienne `api/cron/purge`).

## 2. Messages écrits (signalements)
- **Finalité** : témoignages relus avant publication anonyme.
- **Base légale** : intérêt légitime.
- **Données** : texte libre (filtré : e-mails, téléphones, liens, adresses bloqués), catégorie, date.
- **Durée** : 12 mois ; refusés supprimés 30 jours après la décision.
- **Mesure** : jamais publiés sans relecture humaine.

## 3. « Je suis solidaire »
- **Finalité** : compter les soutiens à la cause (non élèves).
- **Données** : empreinte de navigateur, empreinte du jour de la connexion, date.
- **Durée** : 12 mois ; empreinte de connexion effacée à 30 jours.

## 4. Demandes de suppression et signalements de contenus
- **Finalité** : exercice des droits, retrait de contenus illicites (LCEN, DSA).
- **Données** : contenu de la demande, contact facultatif (effacé dès traitement).
- **Durée** : 12 mois.

## 5. Sécurité et administration
- **Finalité** : protéger le service (anti-abus, journal d'administration, erreurs techniques).
- **Données** : compteurs anti-abus (48 h), journal des actions admin (12 mois), erreurs sans IP ni identifiant (90 jours).

## Mesures de sécurité
Chiffrement HTTPS forcé (HSTS), politique de sécurité du contenu, accès direct à la base bloqué (RLS), requêtes
paramétrées, preuve de travail anti-robot, limitation de débit, mot de passe admin haché (scrypt), double
authentification admin (TOTP), cookies `httpOnly` et `SameSite=Strict`, aucun secret dans le code public.

## Points ouverts
- **Conservation LCEN** : le décret n° 2021-1362 impose aux hébergeurs de conserver certaines données d'identification
  des auteurs de contenus pendant un an. VOIX efface l'empreinte de connexion à 30 jours pour protéger les mineurs.
  À faire valider par un juriste.
- **Analyse d'impact (AIPD)** : public mineur et données à caractère politique possibles ; une AIPD simplifiée est
  recommandée si l'audience devient importante.
