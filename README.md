# 📊 API-Driven Financial Data Aggregator

This project is a robust, API-driven financial data aggregator featuring a real-time, role-based analytics dashboard. Built with **Node.js**, **Express**, and **React**, it provides a secure and user-friendly interface for visualizing and analyzing financial data, tailored for both individual users and platform administrators.

---

## ✨ Features

### 👤 For Regular Users (My Analytics Dashboard)
- **At-a-Glance Insights**: Professional data cards display key metrics like Total Spending, Total Income, and Net Cash Flow.
- **Monthly Spending Trends**: An interactive line chart visualizes spending patterns over time.
- **Spending by Category**: A clean doughnut chart shows a breakdown of expenses by category (e.g., Groceries, Transport).
- **Secure & Private**: Users can only view their own financial data, enforced via strict data segregation in the API.

### 👑 For Admins (Platform Overview)
- **Aggregated Platform View**: Default dashboard view shows platform-wide financial summaries.
- **Per-User Drill-Down**: Admins can select any user to view their full dashboard.
- **Role-Based Access Control**: Admin-only features protected via role-based authentication.

---

## ⚙️ Technology Stack

| Category      | Technology                              |
|---------------|------------------------------------------|
| **Backend**   | Node.js, Express.js                      |
| **Frontend**  | React (via CDN), Chart.js, Tailwind CSS  |
| **Database**  | SQLite (RDBMS)                           |
| **Security**  | JSON Web Tokens (JWT), bcrypt.js, dotenv, express-rate-limit |
| **Dev Tools** | npm, npx serve                           |

---

## 🚀 Setup and Running

### 1. Prerequisites
- Node.js (v14 or later)
- npm (comes with Node.js)

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/financial-data-dashboard.git
cd financial-data-dashboard
