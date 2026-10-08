# Source des données

`annuaire-lycees.csv` : export du jeu « Annuaire de l'éducation » (ministère de l'Éducation nationale,
data.education.gouv.fr), filtré sur `type_etablissement = Lycée`, téléchargé le 8 octobre 2026.
Licence Ouverte / Open Licence 2.0. Pour mettre à jour : retélécharger l'export et remplacer ce fichier ;
l'import (idempotent) s'exécute à chaque déploiement.

`esr-principaux-etablissements.csv` : export du jeu « Principaux établissements d'enseignement supérieur »
(ministère de l'Enseignement supérieur et de la Recherche, data.enseignementsup-recherche.gouv.fr), 245 lignes,
téléchargé le 8 octobre 2026. Licence Ouverte 2.0. Seules les universités sont importées (type « Université » et
établissements dont le nom commence par « Université » : 72) ; les écoles ne le sont pas
(`scripts/import-universities.ts`, exécuté à chaque déploiement).
