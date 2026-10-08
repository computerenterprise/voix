-- Les universités rejoignent les lycées dans la même table d'établissements.
alter table schools add column if not exists kind text not null default 'lycee';
alter table schools drop constraint if exists schools_kind_check;
alter table schools add constraint schools_kind_check check (kind in ('lycee', 'universite'));
create index if not exists schools_kind on schools (kind);
