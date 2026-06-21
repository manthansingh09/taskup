# TaskUp Global - Premium Remote Workforce Platform

TaskUp Global is a premium BPO and Virtual Assistant operations platform designed to help businesses optimize their administrative, financial, development, and marketing workflows. It features a modern, interactive frontend alongside a secured Express.js backend supporting both local JSON file persistence and live **Supabase** SQL database persistence.

---

## 🚀 Key Features

*   **Interactive Cost & Savings Calculator**: Calculate net monthly savings comparing remote TaskUp specialists with U.S. in-house employees.
    *   *Virtual Assistant*: $7 / hr
    *   *Certified Bookkeeper*: $12 / hr
    *   *Personal Assistant*: $10 / hr
    *   *Software Developer*: $30 / hr
    *   *Digital Marketer*: $22 / hr
*   **Onboarding Quote Wizard**: Step-by-step interactive workflow capturing detailed business profiles, service needs, team size scaling, and custom notes.
*   **Mock Calendly Scheduler**: Real-time calendar slot scheduler allowing clients to book risk-free trials.
*   **Persistent Express Backend**: Persists submissions securely using JSON files locally or writes directly to Supabase.
*   **Secured Admin Dashboard (`admin.html`)**: Protected by basic authentication (`admin` / `taskupadmin123`) to let operations managers review leads, filter submissions, search queries, track bookings, and clear databases.

---

## 🛠️ Technology Stack

*   **Frontend**: HTML5, Vanilla JavaScript (ES6+), Premium CSS styling.
*   **Backend**: Express.js (Node.js framework).
*   **Database**: Supabase (PostgreSQL) with local file storage fallback.
*   **Environment Management**: Dotenv.

---

## ⚙️ Quick Start (Local Setup)

### 1. Clone & Install
Clone the repository, navigate to the directory, and install the dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in the values in your `.env` to connect to Supabase:
```env
PORT=3000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-public-api-key
```
*Note: If `SUPABASE_URL` and `SUPABASE_KEY` are not set, the server automatically falls back to storing data locally under `data/quotes.json` and `data/bookings.json`.*

### 3. Run the Server
Launch the development server:
```bash
npm start
```
The application will be live at **http://localhost:3000**.

---

## 🔐 Admin Dashboard

To access the administrator operations board, navigate to:
*   **URL**: `http://localhost:3000/admin.html`
*   **Default Username**: `admin`
*   **Default Password**: `taskupadmin123`

---

## ☁️ Deployment

For live hosting options (Render, VPS, Nginx, SSL, or Supabase SQL setup), refer to the detailed [Deployment Guide](DEPLOYMENT.md).
