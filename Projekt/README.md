# Projekt

Monorepo scaffold for the university project.

## Structure

- `frontend/` - React + Vite client
- `backend/` - Node.js + Express API with Sequelize structure
- `.env.example` - shared environment template

## Initialize Frontend

```bash
cd Projekt
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

## Initialize Backend

```bash
cd Projekt/backend
npm install
```

## Run

```bash
cd Projekt/frontend
npm run dev
```

```bash
cd Projekt/backend
npm run dev
```
