# YuGiFav

> Chaque archétype a au moins un fan. Prouve-le.

Site de vote communautaire pour déterminer quel est l'archétype YuGiOh préféré de chaque joueur, et vérifier que tous les archétypes ont au moins un fan.

## Stack

- **Next.js 14** — App Router, Server Components, API Routes
- **Neon** — PostgreSQL serverless (free tier)
- **Vercel** — Hébergement (free tier)
- **YGOProDeck API** — Source de la liste des archétypes (gratuit, pas de clé requise)

## Setup local

### 1. Cloner et installer

```bash
git clone <ton-repo>
cd yugi-fav
npm install
```

### 2. Créer la base de données

1. Crée un compte sur [neon.tech](https://neon.tech) (gratuit)
2. Crée un nouveau projet
3. Dans le dashboard, va dans **SQL Editor** et colle le contenu de `lib/schema.sql`
4. Exécute le script

### 3. Variables d'environnement

```bash
cp .env.local.example .env.local
```

Édite `.env.local` :
- `DATABASE_URL` : récupère la connection string depuis Neon (onglet **Connection Details**)
- `IP_SALT` : mets n'importe quelle chaîne secrète (ex: `openssl rand -hex 16`)

### 4. Lancer en dev

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000)

## Déploiement sur Vercel

### 1. Push sur GitHub

```bash
git init
git add .
git commit -m "init"
gh repo create yugi-fav --public --push
```

### 2. Importer sur Vercel

1. Va sur [vercel.com](https://vercel.com) → **New Project**
2. Importe ton repo GitHub
3. Dans **Environment Variables**, ajoute :
   - `DATABASE_URL` (ta connection string Neon)
   - `IP_SALT` (ta chaîne secrète)
4. Deploy !

Alternativement, tu peux connecter directement Neon à Vercel via l'intégration native (Vercel Marketplace → Neon) — ça configure `DATABASE_URL` automatiquement.

## Structure du projet

```
app/
├── page.tsx                  # Page de vote
├── page.module.css
├── leaderboard/
│   ├── page.tsx              # Classement
│   └── leaderboard.module.css
└── api/
    ├── archetypes/route.ts   # GET liste des archétypes (YGOProDeck)
    ├── vote/route.ts         # POST voter / GET statut du vote
    └── results/route.ts      # GET classement + stats
lib/
├── db.ts                     # Connexion Neon
└── schema.sql                # Schéma BDD
```

## Notes

- **1 vote par IP** — hashé en SHA-256 avec le salt, l'IP brute n'est jamais stockée
- **Archétypes** — chargés depuis l'API YGOProDeck, cache 24h côté serveur
- **Classement** — top 100, rafraîchi toutes les 60 secondes
