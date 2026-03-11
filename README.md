# Frontra Intern System

Ett internt system för Frontra för att spåra arbete, uppgifter och möten.

## Funktioner

- **Inloggning** – Enkel inloggning med namn och lösenord (ingen e-post)
- **Checklista** – Skapa uppgifter med beskrivning och deadline, markera som klara, växla mellan "Att göra" och "Klara"
- **Arbetstidslogg** – Kalender där du loggar timmar och anteckningar per dag (svensk tid)
- **Schema** – Kalender för möten och händelser

## Teknik

- **Next.js 14** (App Router)
- **Neon** (serverlös Postgres – gratis nivå)
- **Auth.js** (NextAuth) med credentials provider
- **Tailwind CSS**
- **Vercel** (deployment)

## Förutsättningar

- Node.js 18+
- Ett Neon-konto (gratis)

## Installation

### 1. Klona och installera

```bash
npm install
```

### 2. Skapa Neon-databas

1. Gå till [console.neon.tech](https://console.neon.tech) och skapa ett konto
2. Skapa ett nytt projekt
3. Kopiera **Connection string** (URI-format)

### 3. Kör databasschemat

1. Öppna **Neon SQL Editor** i ditt projekt
2. Kör innehållet i `supabase/migrations/001_neon_schema.sql`

### 4. Konfigurera miljövariabler

Kopiera `.env.example` till `.env.local`:

```bash
cp .env.example .env.local
```

Fyll i i `.env.local`:

```
DATABASE_URL=postgresql://...  # Din Neon connection string
NEXTAUTH_SECRET=...            # Generera med: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
```

### 5. Skapa användare

Kör seed-scriptet för att skapa användare. Namnet normaliseras (små bokstäver, inga mellanslag).

**Alternativ A – miljövariabel:**

```bash
SEED_USERS="anna:lösenord123,john:hemligt456" npm run db:seed
```

**Alternativ B – argument:**

```bash
npm run db:seed "anna:lösenord123" "john:hemligt456"
```

**Inloggning:** Användaren anger sitt namn (t.ex. `anna` eller `Anna`) och lösenord.

### 6. Starta utvecklingsservern

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000).

## Deployment på Vercel

1. Pusha koden till GitHub
2. Importera projektet i [Vercel](https://vercel.com)
3. Lägg till miljövariablerna:
   - `DATABASE_URL` (Neon connection string)
   - `NEXTAUTH_SECRET` (samma som lokalt)
   - `NEXTAUTH_URL` (t.ex. `https://ditt-projekt.vercel.app`)
4. Deploya

## Projektstruktur

```
app/
  api/              # API-routes (tasks, work-logs, events)
  login/            # Inloggningssida
  checklist/        # Uppgiftschecklista
  kalender/         # Arbetstidslogg
  schema/           # Möten och händelser
components/
  ChecklistView.tsx
  WorkCalendar.tsx
  EventsCalendar.tsx
  Nav.tsx
lib/
  auth.ts           # Auth.js-konfiguration
  db.ts             # Neon-klient
scripts/
  seed.ts           # Skapa användare
supabase/
  migrations/       # SQL-scheman
```

## Licens

Intern användning – Frontra
