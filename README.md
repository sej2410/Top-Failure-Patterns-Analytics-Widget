# Top Failure Patterns Analytics Widget

This project implements a full-stack customer support analytics widget for a SaaS application. It surfaces the top 3 unresolved failure categories for a specific customer, allowing account managers to proactively address recurring problems.

## 🚀 Features
- **Optimized SQL Query**: Computes the top 3 unresolved failure categories in a single database pass using `JOIN`, `GROUP BY`, and `ORDER BY`.
- **Node.js/Express API**: A robust backend endpoint that safely parameterizes inputs to prevent SQL injection.
- **React + TypeScript Frontend**: A sleek, responsive widget with three distinct UI states:
  - **Loading Skeleton**: Smooth animated placeholders while data fetches.
  - **Populated Chart**: A beautiful horizontal bar chart representing the failure counts.
  - **Empty State**: Clear, positive feedback when a customer has no unresolved issues.

---

## 📁 Project Structure

- `/backend`: Node.js Express server and PostgreSQL configuration.
  - `query.sql`: Contains the raw, heavily-optimized SQL query logic.
  - `index.js`: The Express API endpoint implementation.
  - `seed.js`: Database initialization and dummy data population script.
- `/frontend`: React & Vite frontend widget application.
  - `src/components/TopFailureWidget.tsx`: The primary React component handling all three UI states.

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL database

### 1. Database Setup
Ensure you have a PostgreSQL database running. You can configure your connection string in the backend directory:
```bash
cd backend
cp .env.example .env
```
Edit `.env` to include your `DATABASE_URL`. Then run the seeder to create tables and dummy data:
```bash
npm install
npm run seed
```

> [!TIP]
> **Don't want to set up a database?**
> You can bypass the PostgreSQL requirement to quickly view the UI by adding `DEMO_MODE=true` to your `.env` file. This will safely intercept the database query and return hardcoded mock data so you can evaluate the frontend widget instantly.

### 2. Run the Backend API
Start the Express server on port 4000:
```bash
npm run dev
```

### 3. Run the Frontend Widget
In a new terminal window, start the Vite development server:
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173` to view the widget!

