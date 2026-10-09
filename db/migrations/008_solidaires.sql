-- « Je suis solidaire » : soutien des personnes qui ne sont pas élèves ou étudiants de l'établissement
-- (parents, profs, anciens élèves, citoyens). Compté à part : n'entre jamais dans les préoccupations des élèves.
create table if not exists solidarity (
  id bigserial primary key,
  school_uai text not null references schools(uai) on delete cascade,
  device_hash text not null,
  ip_hash text not null,
  status text not null default 'counted' check (status in ('counted', 'suspended')),
  created_at timestamptz not null default now(),
  unique (school_uai, device_hash)
);
create index if not exists solidarity_school_idx on solidarity (school_uai) where status = 'counted';
create index if not exists solidarity_ip_idx on solidarity (ip_hash, school_uai, created_at);
alter table solidarity enable row level security;
