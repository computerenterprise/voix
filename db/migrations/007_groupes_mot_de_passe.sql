-- Mot de passe libre : les élèves choisissent eux-mêmes leur suite de mots, VOIX ne la définit plus.
-- Chaque participation garde seulement l'empreinte HMAC (établissement + mot de passe normalisé) ;
-- les participations qui ont la même empreinte forment un groupe.
alter table participations add column if not exists code_hash text;
create index if not exists participations_code_hash_idx on participations (school_uai, code_hash) where code_hash is not null;

-- Décision de l'équipe : publier ou non le tableau d'un groupe sur la page de l'établissement.
create table if not exists code_groups (
  school_uai text not null references schools(uai) on delete cascade,
  code_hash text not null,
  published boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (school_uai, code_hash)
);
alter table code_groups enable row level security;

-- Reprise de l'ancien fonctionnement (mot de passe défini par l'admin) : même empreinte, on la reporte.
do $$ begin
  if exists (select 1 from information_schema.tables where table_name = 'school_codes') then
    update participations p set code_hash = c.code_hash from school_codes c
      where p.with_code and c.school_uai = p.school_uai and p.code_hash is null;
    drop table school_codes;
  end if;
end $$;
alter table participations drop column if exists with_code;
