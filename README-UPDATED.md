# Uranus Drive - Solution Drive Intranet

Un drive intranet professionnel avec panneau d'administration construit avec Next.js 14, TypeScript, Prisma, SQLite et MinIO.

## ✨ Fonctionnalités

### 🔐 Authentification Sécurisée
- Connexion par email/mot de passe
- Tokens JWT avec cookies httpOnly
- Sessions persistantes et sécurisées
- **Système de rôles** (Utilisateur/Administrateur)

### 📁 Gestion de Fichiers
- Upload par glisser-déposer ou sélection
- Téléchargement sécurisé des fichiers
- Visualisation des métadonnées (taille, type, date)
- Suppression avec confirmation
- **Gestion personnalisée par utilisateur**

### 👥 Panneau d'Administration
- **Dashboard administrateur** avec statistiques
- **Gestion complète des utilisateurs** :
  - Création de nouveaux comptes
  - Modification des informations utilisateur
  - Attribution des rôles (User/Admin)
  - Suppression sécurisée des comptes
- **Interface intuitive** avec tableaux interactifs
- **Protection des routes** sensibles

### 🎨 Interface Moderne
- Design responsive (mobile/desktop)
- Interface utilisateur intuitive
- Thème professionnel avec Tailwind CSS
- Animations et transitions fluides
- **Navigation conditionnelle** selon les rôles

## 🛠️ Stack Technique

- **Frontend & Backend**: Next.js 14 avec App Router
- **Langage**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentification**: JWT avec httpOnly cookies + système de rôles
- **Base de données**: SQLite avec Prisma ORM (développement) / PostgreSQL (production)
- **Stockage**: MinIO (S3-compatible) avec simulation pour développement
- **Containerisation**: Dockerfile + Docker Compose

## 🚀 Installation et Démarrage

### Développement Local (Recommandé pour test)

1. **Clonez et naviguez dans le projet** :
```bash
cd Uranus
```

2. **Installez les dépendances** :
```bash
npm install
```

3. **Configurez l'environnement de développement** :
```bash
cp .env.local.dev .env.local
cp prisma/schema.dev.prisma prisma/schema.prisma
```

4. **Initialisez la base de données** :
```bash
cp .env.local.dev .env.local
cp prisma/schema.dev.prisma prisma/schema.prisma
export DATABASE_URL="file:./dev.db"
npx prisma generate
npx prisma db push
npm run db:seed
export DATABASE_URL="file:./dev.db"
npm run dev
```

5. **Démarrez l'application** :
```bash
export DATABASE_URL="file:./dev.db"
npm run dev
```

6. **Accédez à l'application** : http://localhost:3000

### Production avec Docker

1. **Démarrez tous les services** :
```bash
docker-compose up -d
```

2. **Accédez à l'application** :
   - **Application**: http://localhost:3000
   - **MinIO Console**: http://localhost:9001 (admin/admin)

## 👤 Comptes de Test

L'application est livrée avec des comptes pré-configurés :

### Administrateur
- **Email**: admin@uranus.com
- **Mot de passe**: admin123
- **Accès**: Dashboard + Panneau d'administration

### Utilisateur Standard
- **Email**: test@uranus.com
- **Mot de passe**: password123
- **Accès**: Dashboard uniquement

## 📖 Guide d'Utilisation

### Pour les Utilisateurs

1. **Connexion** : Utilisez vos identifiants pour accéder au dashboard
2. **Upload de fichiers** : Glissez-déposez ou sélectionnez vos fichiers
3. **Gestion** : Téléchargez, visualisez ou supprimez vos fichiers
4. **Déconnexion** : Utilisez le bouton de déconnexion sécurisée

### Pour les Administrateurs

1. **Connexion admin** : Connectez-vous avec un compte administrateur
2. **Accès au panneau** : Cliquez sur le bouton "Administration"
3. **Gestion des utilisateurs** :
   - Visualisez tous les utilisateurs
   - Créez de nouveaux comptes
   - Modifiez les informations existantes
   - Supprimez des comptes (protection auto-suppression)
4. **Gestion personnelle** : Accès complet aux fonctionnalités utilisateur

## 🔒 Sécurité

### Authentification
- Mots de passe hashés
- Tokens JWT sécurisés avec cookies httpOnly
- Protection CSRF intégrée
- Sessions avec expiration automatique

### Autorisation
- Middleware de vérification des rôles
- Protection des routes administrateur
- Validation côté serveur pour toutes les API
- Isolation des données par utilisateur

### Stockage
- Clés de stockage uniques par utilisateur
- Validation des types de fichiers
- Limitation de taille configurable
- Accès sécurisé via proxy authentifié

## 🏗️ Architecture

```
Uranus/
├── app/                    # Pages et API routes (Next.js App Router)
│   ├── (auth)/            # Routes d'authentification
│   ├── admin/             # Panneau d'administration
│   ├── dashboard/         # Dashboard utilisateur
│   └── api/               # API endpoints
│       ├── auth/          # Authentification + rôles
│       ├── admin/         # API d'administration
│       └── files/         # Gestion des fichiers
├── components/            # Composants React réutilisables
├── lib/                   # Utilitaires et configurations
├── prisma/               # Schéma et migrations
└── scripts/              # Scripts d'initialisation
```

## 🔌 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/logout` - Déconnexion utilisateur
- `GET /api/auth/me` - Informations utilisateur + rôle

### Gestion des Fichiers
- `GET /api/files` - Liste des fichiers de l'utilisateur
- `POST /api/files/upload` - Upload d'un fichier
- `GET /api/files/[id]/download` - Téléchargement d'un fichier
- `DELETE /api/files/[id]` - Suppression d'un fichier

### Administration
- `GET /api/admin/users` - Liste tous les utilisateurs
- `POST /api/admin/users` - Créer un nouvel utilisateur
- `GET /api/admin/users/[id]` - Obtenir un utilisateur spécifique
- `PUT /api/admin/users/[id]` - Modifier un utilisateur
- `DELETE /api/admin/users/[id]` - Supprimer un utilisateur

## 💾 Structure des Données

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String?
  password  String   // hash bcrypt
  role      String   @default("USER") // USER or ADMIN
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  files     File[]
}

model File {
  id        String   @id @default(cuid())
  name      String
  size      Int
  mimeType  String
  bucket    String   @default("user-files")
  objectKey String   // user_id/filename
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}
```

## 🧪 Tests et Validation

### Fonctionnalités Testées ✅
- Authentification utilisateur et administrateur
- Gestion complète des fichiers (upload/download/delete)
- Panneau d'administration complet
- Création/modification/suppression d'utilisateurs
- Protection des routes et autorisations
- Interface responsive et intuitive
- Navigation conditionnelle selon les rôles

## 🚀 Déploiement

### Environnement de Développement
- Configuration SQLite pour simplicité
- Simulation MinIO pour tests locaux
- Hot-reload et debugging intégré

### Environnement de Production
- Support PostgreSQL pour performance
- Serveur MinIO pour stockage distribué
- Configuration Docker complète
- Variables d'environnement sécurisées
