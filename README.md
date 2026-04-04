# Vura - Form Builder SaaS

Vura est une plateforme SaaS professionnelle pour la création de formulaires dynamiques, avec un constructeur intuitif et des analyses en temps réel.

## 🚀 Fonctionnalités
- **Form Builder** : Interface drag-and-drop pour créer des formulaires complexes.
- **Analytics** : Suivi des réponses et performances en temps réel.
- **Intégrations** : Export vers Google Sheets, Excel, etc.
- **Authentification** : Gestion sécurisée des utilisateurs avec JWT.
- **Premium** : Système d'abonnement pour des fonctionnalités avancées.

## 🛠️ Stack Technique
- **Frontend** : React 19, Vite, Material UI (MUI), Recharts, Framer Motion, Zustand.
- **Backend** : Django 6.0, Django REST Framework, SimpleJWT, WhiteNoise.
- **Base de données** : SQLite (local) / PostgreSQL (production).

## 📂 Structure du Projet
- `/frontend` : Application React (Vite).
- `/backend` : API Django.
- `vercel.json` : Configuration pour le déploiement monorepo sur Vercel.

---

## 💻 Installation Locale

### 1. Backend (Django)
```bash
cd backend
# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt

# Migrations et lancement
python manage.py migrate
python manage.py runserver
```

### 2. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
Accédez à l'application sur `http://localhost:5173`.

---

## 🌍 Déploiement (Vercel)

Ce projet est configuré pour être déployé facilement sur **Vercel**.

### Variables d'Environnement Requises

#### Backend :
- `SECRET_KEY` : Votre clé secrète Django.
- `DEBUG` : `False` en production.
- `DATABASE_URL` : URL de votre base de données PostgreSQL.

#### Frontend :
- `VITE_API_URL` : L'URL de votre API backend déployée (ex: `https://vura-api.vercel.app/api/`).

### Étapes de déploiement :
1. Poussez le code sur GitHub.
2. Connectez votre dépôt sur Vercel.
3. Configurez deux projets distincts ou utilisez le `vercel.json` à la racine pour un déploiement monorepo.
4. Ajoutez les variables d'environnement listées ci-dessus.

---

## 📝 Licence
Ce projet est sous licence MIT.
