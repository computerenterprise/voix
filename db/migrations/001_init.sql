-- VOIX — schéma initial
-- Principe : minimisation. Aucune donnée d'identité (nom, e-mail, téléphone, photo, localisation précise)
-- n'est collectée pour participer. Les identifiants techniques sont stockés sous forme d'empreintes HMAC.

create extension if not exists pg_trgm;

create table if not exists schema_migrations (
  version text primary key,
  applied_at timestamptz not null default now()
);

-- Établissements (source : Annuaire de l'Éducation, ministère de l'Éducation nationale, Licence Ouverte)
create table if not exists schools (
  uai text primary key check (uai ~ '^[0-9]{7}[A-Z]$'),
  name text not null,
  city text not null,
  postal_code text not null default '',
  department_code text not null default '',
  department_name text not null default '',
  academy text not null default '',
  sector text not null default '' ,           -- Public / Privé
  tracks text[] not null default '{}',        -- générale, technologique, professionnelle
  search text not null,                       -- texte normalisé (minuscules, sans accents)
  hidden boolean not null default false,      -- masqué par l'administration
  source text not null default 'annuaire-education',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists schools_search_trgm on schools using gin (search gin_trgm_ops);
create index if not exists schools_postal on schools (postal_code text_pattern_ops);
create index if not exists schools_dept on schools (department_code);

-- Une participation = un appareil (cookie aléatoire, stocké haché) pour un lycée.
-- Un même appareil ne compte qu'une fois par lycée ; il peut soutenir plusieurs préoccupations.
create table if not exists participations (
  id bigserial primary key,
  school_uai text not null references schools(uai) on delete cascade,
  device_hash text not null,
  ip_hash text not null,                       -- HMAC(IP, secret, jour) : non réversible, change chaque jour
  categories text[] not null check (cardinality(categories) between 1 and 7),
  status text not null default 'counted' check (status in ('counted','suspended','removed')),
  flags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_uai, device_hash)
);
create index if not exists participations_school on participations (school_uai, status);
create index if not exists participations_ip on participations (ip_hash, school_uai, created_at);
create index if not exists participations_created on participations (created_at);
create index if not exists participations_flagged on participations (status) where cardinality(flags) > 0 or status <> 'counted';

-- Texte libre optionnel : JAMAIS publié automatiquement.
create table if not exists reports (
  id bigserial primary key,
  participation_id bigint not null references participations(id) on delete cascade,
  school_uai text not null references schools(uai) on delete cascade,
  category text not null,
  body text not null check (char_length(body) between 10 and 500),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  auto_flags text[] not null default '{}',
  moderated_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists reports_status on reports (status, created_at);
create index if not exists reports_school on reports (school_uai, status);

-- État de traitement d'une préoccupation, renseigné uniquement par l'équipe VOIX.
create table if not exists concern_status (
  school_uai text not null references schools(uai) on delete cascade,
  category text not null,
  status text not null check (status in ('transmis','reponse','en_cours','resolu')),
  note text check (char_length(note) <= 280),
  updated_at timestamptz not null default now(),
  primary key (school_uai, category)
);

create table if not exists deletion_requests (
  id bigserial primary key,
  details text not null check (char_length(details) between 5 and 1000),
  contact text check (char_length(contact) <= 200),     -- facultatif, effacé après traitement
  status text not null default 'open' check (status in ('open','done','rejected')),
  created_at timestamptz not null default now(),
  handled_at timestamptz
);

create table if not exists abuse_reports (
  id bigserial primary key,
  target_url text check (char_length(target_url) <= 300),
  reason text not null check (reason in ('donnees_personnelles','accusation','haine','menace','faux','autre')),
  details text check (char_length(details) <= 1000),
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now(),
  handled_at timestamptz
);

-- Journalisation technique limitée : pas d'IP, pas de cookie, pas de contenu utilisateur.
create table if not exists error_logs (
  id bigserial primary key,
  at timestamptz not null default now(),
  source text not null,
  message text not null,
  digest text
);
create index if not exists error_logs_at on error_logs (at desc);

create table if not exists rate_limits (
  key text not null,
  window_start timestamptz not null,
  count int not null default 0,
  primary key (key, window_start)
);

create table if not exists admin_audit (
  id bigserial primary key,
  at timestamptz not null default now(),
  action text not null,
  target text,
  detail text
);
