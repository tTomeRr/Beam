# Beam

Smart budget tracker with full Hebrew/RTL support for multi-user family budgeting.

## Quick Start

```bash
./setup.sh                    # Initial setup
docker-compose up -d          # Start all services
```

Access at http://localhost:3000

## Architecture

- **Frontend**: React + TypeScript + Vite (frontend/)
- **Backend**: Node.js + Express + TypeScript (backend/)
- **Database**: PostgreSQL 16
- **Authentication**: JWT
- **Deployment**: Docker Compose

## Features

- Multi-user authentication
- Category management with custom icons and colors
- Monthly budget planning
- Transaction tracking
- Savings accounts
- Full Hebrew RTL support
- Docker-based deployment

## Development

```bash
# Frontend
cd frontend
npm install --legacy-peer-deps
npm run dev

# Backend
cd backend
npm install
npm run dev
npm test
```

## Commands

```bash
docker-compose up -d          # Start services
docker-compose down           # Stop services
docker-compose logs -f        # View logs
docker-compose restart        # Restart
```
