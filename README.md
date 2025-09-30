# Uranus Drive - MVP Intranet

Un drive intranet minimal mais fonctionnel construit avec Next.js 14, TypeScript, Prisma, PostgreSQL et MinIO.

## Fonctionnalités

- ✅ Authentification JWT avec cookies httpOnly
- ✅ Upload/download de fichiers avec interface drag-and-drop
- ✅ Stockage sécurisé avec MinIO (S3-compatible)
- ✅ Interface moderne avec Tailwind CSS
- ✅ Base de données PostgreSQL avec Prisma ORM
- ✅ Architecture containerisée avec Docker

## Stack Technique

- **Frontend & Backend**: Next.js 14 avec App Router
- **Langage**: TypeScript strict
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentification**: JWT avec httpOnly cookies
- **Base de données**: PostgreSQL avec Prisma ORM
- **Stockage**: MinIO (S3-compatible)
- **Cache**: Redis
- **Containerisation**: Docker + Docker Compose

## Installation et Démarrage

### Prérequis

- Docker et Docker Compose
- Node.js 20+ (pour le développement local)

### Démarrage avec Docker

1. Clonez le projet et naviguez dans le répertoire :
```bash
cd Uranus
```

2. Démarrez tous les services avec Docker Compose :
```bash
docker-compose up -d
```

3. Attendez que tous les services soient prêts (environ 1-2 minutes)

4. Accédez à l'application :
   - **Application**: http://localhost:3000
   - **MinIO Console**: http://localhost:9001 (admin/admin)

### Développement Local

1. Installez les dépendances :
```bash
npm install
```

2. Démarrez les services de base (PostgreSQL, MinIO, Redis) :
```bash
docker-compose up -d db minio redis
```

3. Configurez la base de données :
```bash
npm run db:migrate
npm run db:generate
npm run db:seed
```

4. Démarrez l'application en mode développement :
```bash
npm run dev
```

## Utilisation

### Connexion

Utilisez les identifiants de test créés automatiquement :
- **Email**: test@uranus.com
- **Mot de passe**: password123

### Upload de fichiers

1. Connectez-vous au dashboard
2. Utilisez la zone de drag-and-drop ou cliquez pour sélectionner un fichier
3. Cliquez sur "Uploader le fichier"

### Gestion des fichiers

- **Télécharger**: Cliquez sur le bouton "Télécharger" à côté du fichier
- **Supprimer**: Cliquez sur le bouton "Supprimer" (confirmation requise)
- **Rafraîchir**: Utilisez le bouton "Rafraîchir" pour mettre à jour la liste

## Configuration

### Variables d'environnement

Le fichier `.env.local` contient toutes les configurations nécessaires :

```env
DATABASE_URL="postgresql://user:password@db:5432/uranus_db?schema=public"
MINIO_ENDPOINT="minio"
MINIO_PORT="9000"
MINIO_USE_SSL="false"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
JWT_SECRET="your_jwt_secret_key_here"
```

### Sécurité

- Les mots de passe sont hashés avec bcrypt
- Les tokens JWT sont stockés dans des cookies httpOnly
- MinIO est configuré avec un réseau interne Docker
- Validation des permissions utilisateur sur tous les endpoints

## Architecture

```
Uranus/
├── app/                    # Pages et API routes (Next.js App Router)
│   ├── (auth)/            # Groupe de routes d'authentification
│   ├── dashboard/         # Page principale du drive
│   └── api/               # API endpoints
├── components/            # Composants React réutilisables
├── lib/                   # Utilitaires et configurations
├── prisma/               # Schéma et migrations de base de données
├── scripts/              # Scripts d'initialisation
└── docker-compose.yml    # Configuration des services
```

## API Endpoints

- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/logout` - Déconnexion utilisateur
- `GET /api/files` - Liste des fichiers de l'utilisateur
- `POST /api/files/upload` - Upload d'un fichier
- `GET /api/files/[id]/download` - Téléchargement d'un fichier
- `DELETE /api/files/[id]` - Suppression d'un fichier

## Développement

### Commandes utiles

```bash
# Base de données
npm run db:migrate      # Appliquer les migrations
npm run db:generate     # Générer le client Prisma
npm run db:seed         # Initialiser avec des données de test

# Développement
npm run dev             # Démarrer en mode développement
npm run build           # Construire pour la production
npm run start           # Démarrer en mode production
```

### Structure des données

```sql
-- Utilisateurs
User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // hash bcrypt
  createdAt DateTime @default(now())
  files     File[]
}

-- Fichiers
File {
  id        String   @id @default(cuid())
  name      String
  size      Int
  mimeType  String
  bucket    String   @default("user-files")
  objectKey String   // Clé MinIO "user_id/filename"
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}
```

## Déploiement

L'application est prête pour le déploiement avec Docker. Tous les services sont configurés pour fonctionner ensemble dans un réseau Docker isolé.

Pour un déploiement en production :

1. Modifiez les secrets dans `.env.local`
2. Configurez un reverse proxy (nginx) si nécessaire
3. Utilisez `docker-compose up -d` pour démarrer tous les services

## Licence

Ce projet est un MVP de démonstration. Utilisez-le comme base pour vos propres projets.

