-- ============================================================
-- MANITO — Phase 9 : table profiles
-- À exécuter APRÈS schema.sql dans l'éditeur SQL Supabase.
-- ============================================================


-- ------------------------------------------------------------
-- TABLE : profiles
-- Un profil par utilisateur : pseudo uniquement.
-- Email et created_at viennent de auth.users.
-- ------------------------------------------------------------

create table if not exists profiles (
  id           uuid        primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Index (optionnel, la PK suffit ici)
create index if not exists idx_profiles_id on profiles(id);


-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Chaque utilisateur ne voit et ne modifie que son propre profil.
-- ------------------------------------------------------------

alter table profiles enable row level security;

create policy "Users can read their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using  (auth.uid() = id)
  with check (auth.uid() = id);


-- ------------------------------------------------------------
-- TRIGGER updated_at
-- Réutilise la fonction créée dans schema.sql.
-- Si schema.sql n'a pas encore été exécuté, la fonction
-- est recréée ici.
-- ------------------------------------------------------------

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on profiles;
create trigger set_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at_column();


-- ------------------------------------------------------------
-- TRIGGER : création automatique du profil au signup
-- Quand un nouvel utilisateur s'inscrit dans auth.users,
-- un profil vide est créé automatiquement dans public.profiles.
-- ------------------------------------------------------------

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
