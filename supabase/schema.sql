-- ============================================================
-- MANITO — Schéma Supabase
-- À exécuter dans l'éditeur SQL de votre projet Supabase.
-- ============================================================


-- ------------------------------------------------------------
-- TABLE : daily_entries
-- Une entrée = une journée de travail saisie par le chauffeur.
-- Contrainte unique (user_id, date) : une seule entrée par jour.
-- ------------------------------------------------------------

create table if not exists daily_entries (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  date          date        not null,
  start_time    time        not null,
  end_time      time        not null,
  driving_mins  integer     not null check (driving_mins >= 0),
  work_mins     integer     not null check (work_mins >= 0),
  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique(user_id, date)
);

-- Index pour les requêtes filtrées par utilisateur + date
create index if not exists idx_daily_entries_user_date
  on daily_entries(user_id, date desc);


-- ------------------------------------------------------------
-- TABLE : annual_settings
-- Un taux de référence par année et par utilisateur.
-- Utilisé pour calculer le coefficient et les écarts.
-- ------------------------------------------------------------

create table if not exists annual_settings (
  id             uuid         primary key default gen_random_uuid(),
  user_id        uuid         not null references auth.users(id) on delete cascade,
  year           integer      not null check (year >= 2000 and year <= 2100),
  reference_rate numeric(5,2) not null check (reference_rate > 0 and reference_rate < 100),
  created_at     timestamptz  default now(),
  updated_at     timestamptz  default now(),
  unique(user_id, year)
);

-- Index pour les requêtes par utilisateur
create index if not exists idx_annual_settings_user_year
  on annual_settings(user_id, year desc);


-- ------------------------------------------------------------
-- ROW LEVEL SECURITY — daily_entries
-- Chaque utilisateur ne voit et ne modifie que ses propres données.
-- ------------------------------------------------------------

alter table daily_entries enable row level security;

create policy "Users can read their daily entries"
  on daily_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert their daily entries"
  on daily_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their daily entries"
  on daily_entries for update
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their daily entries"
  on daily_entries for delete
  using (auth.uid() = user_id);


-- ------------------------------------------------------------
-- ROW LEVEL SECURITY — annual_settings
-- ------------------------------------------------------------

alter table annual_settings enable row level security;

create policy "Users can read their annual settings"
  on annual_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert their annual settings"
  on annual_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their annual settings"
  on annual_settings for update
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their annual settings"
  on annual_settings for delete
  using (auth.uid() = user_id);


-- ------------------------------------------------------------
-- FONCTION : mise à jour automatique de updated_at
-- ------------------------------------------------------------

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_daily_entries_updated_at
  before update on daily_entries
  for each row execute function update_updated_at_column();

create trigger set_annual_settings_updated_at
  before update on annual_settings
  for each row execute function update_updated_at_column();
