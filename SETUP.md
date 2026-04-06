# zyAI Setup Guide

**Marketplace OLX-style cu Next.js 15 + Supabase + Groq AI**

---

## 🚀 Quick Start

### 1. Supabase Setup (Obligatoriu!)

1. Creează account pe [supabase.com](https://supabase.com)
2. New Project:
   - Name: `zyai`
   - Region: `eu-central-1` (sau mai aproape de tine)
   - Password: ceva sigur
3. Copiază credentialele:
   - `NEXT_PUBLIC_SUPABASE_URL` (din Project Settings > API)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public, din aceeași pagină)

4. **Rulează SQL Schema** în SQL Editor (copy-paste din plan):

```sql
-- Extensii
create extension if not exists "uuid-ossp";
create extension if not exists "unaccent";

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, phone text, avatar_url text, city text,
  created_at timestamptz default now() not null
);

-- Auto-create profile trigger
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- CATEGORIES
create table public.categories (
  id serial primary key, slug text unique not null,
  name text not null, parent_id int references public.categories(id), icon text
);

-- Seed categories
insert into public.categories (slug, name, parent_id, icon) values
  ('joburi', 'Joburi', null, '💼'),
  ('imobiliare', 'Imobiliare', null, '🏠'),
  ('auto', 'Auto', null, '🚗'),
  ('servicii', 'Servicii', null, '🔧');

-- LISTINGS
create table public.listings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category_id int references public.categories(id) not null,
  title text not null, description text not null,
  price numeric(12,2), price_type text default 'fix', currency text default 'RON',
  city text not null, county text not null,
  images text[] default '{}',
  status text default 'activ',
  views int default 0,
  search_vector tsvector generated always as (
    to_tsvector('romanian', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(city,''))
  ) stored,
  created_at timestamptz default now() not null,
  expires_at timestamptz default (now() + interval '60 days')
);

create index listings_search_idx on public.listings using gin(search_vector);
create index listings_category_idx on public.listings(category_id, status, created_at desc);

-- FAVORITES
create table public.favorites (
  user_id uuid references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, listing_id)
);

-- MESSAGES
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null, read boolean default false,
  created_at timestamptz default now() not null
);

-- RLS POLICIES
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.messages enable row level security;
alter table public.favorites enable row level security;
alter table public.categories enable row level security;

-- Profiles
create policy "profiles_public_read" on public.profiles for select using (true);
create policy "profiles_owner_update" on public.profiles for update using (auth.uid() = id);

-- Categories
create policy "categories_public_read" on public.categories for select using (true);

-- Listings
create policy "listings_public_read" on public.listings for select
  using (status = 'activ' or auth.uid() = user_id);
create policy "listings_owner_insert" on public.listings for insert
  with check (auth.uid() = user_id);
create policy "listings_owner_update" on public.listings for update
  using (auth.uid() = user_id);
create policy "listings_owner_delete" on public.listings for delete
  using (auth.uid() = user_id);

-- Messages
create policy "messages_participant_read" on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "messages_sender_insert" on public.messages for insert
  with check (auth.uid() = sender_id);
create policy "messages_receiver_mark_read" on public.messages for update
  using (auth.uid() = receiver_id);

-- Favorites
create policy "favorites_owner_all" on public.favorites for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

5. **Storage Bucket**:
   - Storage > New Bucket > Name: `listings` > Public
   - Create

6. **Authentication**:
   - Auth > Providers > Email > Disable "Confirm email" (for instant access)
   - Auth > URL Configuration:
     - Site URL: `http://localhost:3000`
     - Redirect URLs: Add `http://localhost:3000/api/auth/callback`

7. **Realtime** (optional, pentru messaging real-time):
   - Database > Realtime > Messages table > Enable

### 2. Environment Variables

Creează `.env.local`:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxx...
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Groq AI
GROQ_API_KEY=gsk_...
```

### 3. Groq API Key

1. Creează account pe [console.groq.com](https://console.groq.com)
2. API Keys > Create New Key
3. Copy în `.env.local`

### 4. Run Local

```bash
cd C:\Users\catal\Desktop\Proiecte\zyai
npm install
npm run dev
```

Accesează: **http://localhost:3000**

---

## 📱 Feature Tour

### Homepage (`/`)
- 4 categorii mari: Joburi, Imobiliare, Auto, Servicii
- CTA "Postează anunț"

### Browse Marketplace (`/marketplace/[category]`)
- Filtrare după: Oraș, Preț min/max, Căutare text
- Grid 3 coloane cu listing cards
- Real-time actualități

### Post Listing (`/anunt/nou`)
- 3 step form:
  1. Categorie + Titlu + Descriere
  2. Locație + Preț + Tip preț
  3. Imagini (max 10, upload Supabase Storage)
- Auth required (magic link)

### Listing Detail (`/anunt/[id]`)
- Galerie imagini
- Info complet (pret, locatie, descriere)
- Contact buttons:
  - **💬 Trimite mesaj** (marketplace messaging)
  - **📱 WhatsApp** (direct link)
- **❤️ Favorite button** (cu animație)

### Account Pages (`/cont/...`)
- **Anunțurile mele** — lista propriilor anunțuri cu views/status
- **❤️ Favorite** — anunțuri salvate
- **💬 Mesaje** — inbox + conversații cu Supabase Realtime
- **👤 Profil** — editare nume/telefon/oras

### AI Chat Bubble (bottom-right pe toate paginile)
- Flotant chat window
- Powered by Groq llama-3.3-70b
- Ajută la navigație, explică features
- Click 💬 pentru toggle

---

## 🔐 Auth Flow

1. User click "Conectare"
2. Introduce email
3. Click "🔗 Conectează-te cu magic link"
4. Primește email cu link magic
5. Click link → auto logat
6. Sessiu salvată în cookies via middleware

**Magic Link** = OTP via email, no password needed ✨

---

## 📊 Database Schema

```
profiles (id, full_name, phone, avatar_url, city)
    ↓
listings (id, user_id, category_id, title, description, price, city, images, status, views)
    ↓ favorite
favorites (user_id, listing_id)
    ↓ messaging
messages (id, listing_id, sender_id, receiver_id, content, read, created_at)

categories (id, slug, name, parent_id)
```

---

## 🚢 Deploy (Vercel)

```bash
# 1. Push to GitHub
git remote add origin https://github.com/catalinradu2026-gif/zyai.git
git push -u origin master

# 2. Vercel
# - Import repo: vercel.com/new
# - Framework: Next.js
# - Environment Variables:
#   - NEXT_PUBLIC_SUPABASE_URL
#   - NEXT_PUBLIC_SUPABASE_ANON_KEY
#   - GROQ_API_KEY
# - Deploy!

# 3. Add domain (optional)
# - Settings > Domains > Add custom domain
```

---

## 🧪 Testing Checklist

- [ ] Login cu magic link (check email)
- [ ] Browse marketplace, filtrează după oraș
- [ ] Postează test listing
- [ ] Salvează la favorite ❤️
- [ ] Trimite mesaj între conturi
- [ ] AI chat bubble — pune o întrebare
- [ ] Check profil page
- [ ] View "Anunțurile mele"

---

## 📝 File Structure

```
zyai/
├── app/
│   ├── (auth)/login/
│   ├── (marketplace)/[category]/
│   ├── anunt/[id]/ & /nou/
│   ├── cont/ (account pages)
│   ├── api/chat/ & /auth/callback/
│   └── page.tsx (homepage)
├── components/
│   ├── layout/ (Header, etc)
│   ├── listings/ (Card, Grid, Form, etc)
│   ├── messaging/ (MessageThread)
│   ├── favorites/ (FavoriteButton)
│   └── ChatWidget.tsx
├── lib/
│   ├── supabase.ts / supabase-server.ts
│   ├── actions/ (auth, listings, messages, favorites)
│   ├── queries/ (listings, messages, favorites)
│   └── constants/ (cities, categories)
└── middleware.ts
```

---

## 🐛 Troubleshooting

### "GROQ_API_KEY missing"
→ Add `GROQ_API_KEY` în `.env.local`

### "Supabase connection failed"
→ Check `NEXT_PUBLIC_SUPABASE_URL` și `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Messages not real-time
→ Enable Realtime în Supabase > Replication

### Images not uploading
→ Check bucket permissions (public list/insert/delete)

---

## 📞 Support

Repo: https://github.com/catalinradu2026-gif/zyai
Issues: Open GitHub issue

Enjoy zyAI! 🚀
