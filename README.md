# Beam ✨

**Smart Budget Tracker**

A clean, modern budget tracking application with Hebrew support. Track your monthly spending, manage categories, plan budgets, and keep your finances clear and organized.

---

## Features

✅ **Simple Login** - Just enter your name and email, no complex auth setup
✅ **Monthly Budget Planning** - Set spending limits for each category
✅ **Category Management** - 20+ icons to choose from, customize colors
✅ **Transaction Tracking** - Record and monitor all your expenses
✅ **Savings Tracker** - Keep track of all your savings accounts
✅ **Month Navigation** - Browse through past and future months
✅ **Hebrew Support** - Full RTL support with Hebrew interface
✅ **Privacy-First** - All data stored locally, nothing sent to servers
✅ **Negative Budgets** - See when you're over budget

---

## Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Open in browser
http://localhost:3000
```

---

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: Tailwind CSS
- **Build**: Vite

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
