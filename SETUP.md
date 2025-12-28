# Beam Setup Guide

Complete setup guide for the distributed Beam Budget Tracker application.

## Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- Git
- Python 3 with pip (for pre-commit hooks, optional but recommended)

## Quick Start (Docker - Recommended)

```bash
# 1. Clone and navigate to the project
cd beam

# 2. (Optional) Set up development environment with pre-commit hooks
./dev-setup.sh

# 3. Run the setup script
./setup.sh

# 4. Start all services
docker-compose up -d

# 5. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000
# Database: localhost:5432
```

## Manual Setup

### 1. Environment Configuration

```bash
# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env

# Edit backend/.env and set a strong JWT_SECRET
# Generate one with: openssl rand -base64 32
```

### 2. Database Setup

```bash
# Start PostgreSQL
docker-compose up -d database

# Wait for database to be ready (10 seconds)
sleep 10

# Run migrations
cd backend
npm install
npm run migrate
```

### 3. Start Services

#### Option A: Docker Compose (Production-like)
```bash
docker-compose up -d
```

#### Option B: Local Development
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
npm install --legacy-peer-deps
npm run dev

# Terminal 3 - Database
docker-compose up database
```

## First Time Usage

1. Navigate to http://localhost:3000
2. Click "Register" to create your first user account
3. Login with your credentials
4. Start tracking your budget!

## Architecture

```
beam/
├── frontend/          # React app (port 3000)
├── backend/           # Node.js API (port 4000)
└── database/          # PostgreSQL (port 5432)
```

## Common Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Access database
docker-compose exec database psql -U beam_user -d beam

# Run backend tests
cd backend && npm test

# Backup database
docker-compose exec database pg_dump -U beam_user beam > backup.sql
```

## Troubleshooting

### Database connection fails
```bash
# Check database is running
docker-compose ps

# Restart database
docker-compose restart database
```

### Frontend can't connect to backend
- Verify `VITE_API_URL` in `.env` points to `http://localhost:4000/api`
- Check backend is running: `curl http://localhost:4000/health`

### Port conflicts
If ports 3000, 4000, or 5432 are in use, edit `docker-compose.yml` to change the port mappings.

## Security Notes

- Change `JWT_SECRET` in production
- Use strong passwords for database
- Keep `.env` files out of version control
- This setup is for homelab/private use only
