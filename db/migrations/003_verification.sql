-- Anti-gonflement des votes :
-- 1) statut « pending » : participation enregistrée mais non comptée tant qu'elle n'est pas vérifiée
--    (ex. nombreux nouveaux navigateurs depuis la même connexion pour un même lycée) ;
-- 2) jetons de preuve de travail à usage unique (aucune donnée personnelle : identifiant aléatoire).
alter table participations drop constraint if exists participations_status_check;
alter table participations add constraint participations_status_check
  check (status in ('counted','pending','suspended','removed'));

create table if not exists pow_used (
  id text primary key,
  used_at timestamptz not null default now()
);
alter table pow_used enable row level security;
