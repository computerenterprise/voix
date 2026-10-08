# Avant l'ouverture publique — points bloquants

Ces points ne peuvent pas être réglés par le code. Ils doivent être traités par les fondateurs, et validés par un
juriste pour ceux qui le mentionnent. Le site affiche « [À compléter] » partout où une information manque.

## A. Bloquant pour un pilote, même restreint

1. **Structure éditrice.** Le site doit avoir un éditeur identifié (LCEN, art. 6). Recommandé : association loi 1901
   déclarée. Renseigner `src/config/legal.ts` (nom, statut, adresse, contact).
2. **Directeur ou directrice de la publication** : une personne majeure, responsable pénalement des contenus publiés
   après modération. À désigner.
3. **Hébergeur** : raison sociale, adresse et téléphone exacts de l'hébergeur retenu (Vercel, Supabase), à copier
   depuis leurs mentions officielles.
4. **Contact** : une adresse e-mail opérationnelle, relevée chaque jour (point de contact unique au sens du règlement
   européen sur les services numériques, et exercice des droits RGPD).
5. **Équipe de modération** disponible pendant le pilote, avec un mot de passe admin fort, non partagé hors de
   l'équipe. Délai cible : messages traités sous 24 h, signalements d'abus graves sans délai.

## B. À valider par un juriste avant ouverture à grande échelle

1. **Base légale RGPD.** Proposée : intérêt légitime (art. 6.1.f), sans consentement, ce qui évite la question du
   consentement parental (art. 8 RGPD, âge fixé à 15 ans en France). À confirmer, ainsi que la mise en balance
   avec l'intérêt des mineurs (lignes directrices CNIL sur les mineurs).
2. **Cookie technique `voix_d`.** Présenté comme strictement nécessaire (anti-doublon, sécurité, effacement) et donc
   exempté de consentement. À confirmer au regard des lignes directrices CNIL sur les traceurs.
3. **Analyse d'impact (AIPD).** Public mineur et données potentiellement sensibles dans le texte libre : une AIPD est
   probablement requise ou fortement recommandée. Tenir aussi le registre des traitements.
4. **Statut d'hébergeur de contenus** (LCEN art. 6 et règlement sur les services numériques) : mécanisme de
   notification (présent : `/signaler`), exposé des motifs de retrait (en partie : la charte), conditions
   d'utilisation (à rédiger), rapport de transparence si applicable.
5. **Diffamation et mise en cause de personnels.** La modération refuse toute personne identifiable ; valider la
   charte (`/charte`) et la procédure de retrait.
6. **Transferts hors UE.** Vercel est une société américaine : vérifier les clauses (DPA, cadre de transfert) et
   limiter les données traitées par Vercel (aucune donnée personnelle en clair n'y est stockée par l'application ;
   les journaux de la plateforme contiennent toutefois des adresses IP).
7. **Contrats de sous-traitance (DPA)** avec Vercel et Supabase.
8. **Nom et marque « VOIX »** : vérifier la disponibilité (INPI) et le nom de domaine.
9. **Neutralité.** S'assurer que la communication autour du lancement reste conforme à la mission (pas d'appel au
   blocage, pas de lien partisan).

## C. Limites connues, assumées et affichées

- Une participation = un navigateur, pas un élève vérifié. Effacer ses cookies ou changer de navigateur permet de
  participer de nouveau. Les seuils et la détection de rafales limitent l'impact, sans l'empêcher totalement.
- Une connexion partagée (wifi du lycée) est signalée mais pas suspendue avant 40 participations par jour et par lycée.
- Le filtre automatique de texte bloque e-mails, téléphones, liens, pseudos et adresses ; il ne détecte pas tous
  les noms propres. La relecture humaine reste obligatoire.
