-- « Je suis solidaire » devient un soutien à la cause, sur l'accueil, et non plus à un établissement précis.
-- Un seul soutien par navigateur : on garde le plus ancien de chaque navigateur.
delete from solidarity a using solidarity b where a.device_hash = b.device_hash and a.id > b.id;
alter table solidarity drop column if exists school_uai;
create unique index if not exists solidarity_device_idx on solidarity (device_hash);
create index if not exists solidarity_ip_day_idx on solidarity (ip_hash, created_at);
