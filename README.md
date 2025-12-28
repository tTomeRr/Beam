# Beam ✨

**Smart Budget Tracker - Multi-User Family Edition**

A modern budget tracking application with Hebrew support, now with full backend support for multi-user family budgeting on your private homelab.

---

## Features

✅ **Multi-User Support** - Secure JWT authentication for family members
✅ **Data Persistence** - PostgreSQL database with automated backups
✅ **Monthly Budget Planning** - Set spending limits for each category
✅ **Category Management** - 20+ icons to choose from, customize colors
✅ **Transaction Tracking** - Record and monitor all your expenses
✅ **Savings Tracker** - Keep track of all your savings accounts
✅ **Month Navigation** - Browse through past and future months
✅ **Hebrew Support** - Full RTL support with Hebrew interface
✅ **Docker Deployment** - Easy homelab setup with Docker Compose
✅ **Negative Budgets** - See when you're over budget

---

## Quick Start

```bash
# Setup and start all services (recommended)
./setup.sh
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000
```

For detailed setup instructions, see [SETUP.md](SETUP.md).

---

## Architecture

- **Frontend**: React 19 + TypeScript (Vite)
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL 16
- **Authentication**: JWT tokens
- **Deployment**: Docker Compose
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: Tailwind CSS

---

## How It Works

1. **Login**: Enter your name and email (stored in localStorage)
2. **Add Categories**: Create custom spending categories with icons
3. **Set Budget**: Plan monthly spending limits for each category
4. **Track Expenses**: Record transactions as you spend
5. **Monitor**: See your spending vs budget in real-time

---

## Features Overview

### Dashboard
- Monthly summary with budget vs actual spending
- Available to spend (shows negative when over budget)
- Total savings across all accounts
- Category breakdown with visual charts
- Recent transactions list

### Categories
- Pre-loaded default categories (Food, Health, Car, etc.)
- Add custom categories with 20+ icon options
- Color coding for easy identification
- Enable/disable categories (can't delete to preserve history)

### Budget Planning
- Set monthly spending limits per category
- Month-by-month planning
- Visual progress bars showing budget usage

### Transactions
- Record expenses with amount, date, and description
- Filter by month and category
- Edit and delete transactions
- Full transaction history

### Savings
- Track multiple savings accounts
- Different account types (pension, savings, etc.)
- Update balances manually
- See total savings at a glance

---

## Data Storage

All your data is stored locally in your browser using `localStorage`:
- `bt_user` - Your login info (name, email)
- `bt_categories` - Your categories
- `bt_transactions` - All transactions
- `bt_budgets` - Budget plans
- `bt_savings` - Savings accounts

**Privacy**: Nothing is sent to any server. Everything stays on your computer.

---

## Development

```bash
# Run dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Requires localStorage support.

---

## License

Private use - Not for distribution

---

**Built with ❤️ for simple, effective budget tracking**
