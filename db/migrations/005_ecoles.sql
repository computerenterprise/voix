-- Les écoles et grands établissements de l'enseignement supérieur rejoignent lycées et universités.
alter table schools drop constraint if exists schools_kind_check;
alter table schools add constraint schools_kind_check check (kind in ('lycee', 'universite', 'ecole'));
