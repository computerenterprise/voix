-- Mot de passe facultatif par établissement (trois mots choisis par les élèves, diffusé par VOIX).
-- Partagé par tout l'établissement : il ne désigne personne. Seule son empreinte HMAC est stockée.
create table if not exists school_codes (
  school_uai text primary key references schools(uai) on delete cascade,
  code_hash text not null,
  version int not null default 1,
  updated_at timestamptz not null default now()
);
alter table school_codes enable row level security;

-- Participation confirmée avec le mot de passe en vigueur au moment du vote.
alter table participations add column if not exists with_code boolean not null default false;
