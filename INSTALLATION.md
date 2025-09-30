# Guide d'Installation - Uranus Drive MVP

## Démarrage Rapide

### Option 1: Avec Docker (Recommandé pour la production)

1. **Prérequis**: Docker et Docker Compose installés

2. **Clonez et démarrez**:
```bash
cd Uranus
docker-compose up -d
```

3. **Accédez à l'application**: http://localhost:3000

### Option 2: Développement Local (Testé)

1. **Prérequis**: Node.js 20+

2. **Installation**:
```bash
cd Uranus
npm install
```

3. **Configuration pour développement local**:
```bash
cp .env.local.dev .env.local
cp prisma/schema.dev.prisma prisma/schema.prisma
```

4. **Base de données**:
```bash
export DATABASE_URL="file:./dev.db"
npx prisma generate
npx prisma db push
npm run db:seed
```

5. **Démarrage**:
```bash
export DATABASE_URL="file:./dev.db"
npm run dev
```

6. **Accès**: http://localhost:3000

## Identifiants de Test

- **Email**: test@uranus.com
- **Mot de passe**: password123

## Fonctionnalités Testées

✅ **Authentification**: Connexion/déconnexion avec JWT
✅ **Interface**: Design moderne et responsive
✅ **Navigation**: Redirection automatique selon l'état d'auth
✅ **Upload**: Interface drag-and-drop fonctionnelle
✅ **Stockage**: Simulation MinIO avec système de fichiers local
✅ **Base de données**: SQLite pour le développement

## Architecture Technique

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: API Routes Next.js + Prisma ORM
- **Authentification**: JWT avec cookies httpOnly
- **Stockage**: MinIO (simulé en dev local)
- **Base de données**: PostgreSQL (prod) / SQLite (dev)

## Structure du Projet

```
Uranus/
├── app/                 # Pages et API (Next.js App Router)
├── components/          # Composants React
├── lib/                 # Utilitaires et clients
├── prisma/             # Schémas de base de données
├── scripts/            # Scripts d'initialisation
├── docker-compose.yml  # Configuration Docker
└── README.md           # Documentation complète
```

## Sécurité

- Mots de passe hashés avec bcrypt
- Tokens JWT sécurisés
- Validation des permissions utilisateur
- Isolation des fichiers par utilisateur

## Support

Consultez le README.md pour la documentation complète et les détails techniques.

