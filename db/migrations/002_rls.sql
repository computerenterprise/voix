-- Défense en profondeur (Supabase) : RLS activé sans aucune politique.
-- La clé publique « anon » de Supabase ne peut ainsi lire ni écrire aucune table via l'API REST.
-- L'application se connecte avec le rôle propriétaire des tables, qui n'est pas soumis à RLS.
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = current_schema() loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;
