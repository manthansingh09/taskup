# TaskUp Global

TaskUp Global is a single-page marketing site plus an Express backend for collecting quote requests and trial bookings. It serves the public website, handles form submissions, and exposes an admin portal for viewing and clearing lead data.

## What This Project Does

- Presents the TaskUp Global brand, services, proof points, FAQs, and call-to-action flows.
- Collects quote requests through a multi-step wizard.
- Collects trial call bookings through a scheduling flow.
- Protects an admin portal with HTTP Basic Auth.
- Stores data in either local JSON files or Supabase, depending on environment variables.

## Tech Stack

- Node.js
- Express
- Supabase client SDK
- Vanilla HTML, CSS, and JavaScript

## Project Structure

- [index.html](index.html) - main public landing page.
- [admin.html](admin.html) - secured admin dashboard.
- [app.js](app.js) - frontend behavior, modal handling, wizard logic, calculator, and form submissions.
- [index.css](index.css) - site styles and layout system.
- [server.js](server.js) - Express server, API routes, auth, and persistence layer.
- [DEPLOYMENT.md](DEPLOYMENT.md) - deployment guide for Render, VPS, and Supabase.
- [images/](images) - logos and hero assets used by the site.

## How It Works

The server serves the static frontend files directly from the project root. Public users interact with the website in the browser, and the frontend JavaScript submits data to the backend API.

There are two persistence modes:

- Local mode: quote and booking data are written to JSON files under `data/`.
- Supabase mode: if `SUPABASE_URL` and `SUPABASE_KEY` are set, the server writes to Supabase tables instead.

## Local Setup

### Prerequisites

- Node.js 18 or newer
- npm

### Install Dependencies

```bash
npm install
```

### Run the App

```bash
npm start
```

The app starts on `http://localhost:3000` unless `PORT` is set.

### Open the Site

- Public site: `http://localhost:3000/index.html`
- Admin portal: `http://localhost:3000/admin.html`

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `PORT` | Port for the Express server. Defaults to `3000`. |
| `DATA_DIR` | Directory used for local JSON persistence when Supabase is not configured. Defaults to `./data`. |
| `SUPABASE_URL` | Supabase project URL. Enables Supabase persistence when paired with `SUPABASE_KEY`. |
| `SUPABASE_KEY` | Supabase key used by the backend. |

If `SUPABASE_URL` and `SUPABASE_KEY` are not present, the server creates and uses:

- `data/quotes.json`
- `data/bookings.json`

## API Endpoints

### Public

- `POST /api/quote` - saves a quote request.
- `POST /api/schedule` - saves a trial booking.

### Admin

- `GET /api/admin/leads` - returns quote and booking data for the admin dashboard.
- `POST /api/admin/clear` - clears quotes, bookings, or both.

### Admin Page

- `GET /admin.html` - serves the admin dashboard behind Basic Auth.

## Admin Access

The current default credentials in `server.js` are:

- Username: `admin`
- Password: `taskupadmin123`

These are fine for local development, but they should be changed before any real production use.

## Frontend Behavior

The frontend script in `app.js` handles the interactive parts of the site, including:

- mobile navigation
- animated counters
- service tabs
- savings calculator
- onboarding stepper
- testimonial slider
- FAQ accordion behavior
- modal management
- quote wizard submission
- booking scheduler submission

## Development Notes

If you are continuing assigned work, start here:

1. [index.html](index.html) for layout and content structure.
2. [app.js](app.js) for interactions, form flows, and API calls.
3. [server.js](server.js) for backend logic, persistence, and auth.
4. [index.css](index.css) for styling changes.
5. [DEPLOYMENT.md](DEPLOYMENT.md) for hosting and production setup.

### Useful Mental Model

This project is not a framework app. It is a lightweight marketing site with a small backend. That means the main work usually falls into one of three buckets:

- changing the public website copy or layout
- adjusting frontend interactions and forms
- modifying backend storage, admin access, or deployment

## Deployment

Deployment options and environment-specific notes are documented in [DEPLOYMENT.md](DEPLOYMENT.md). In short:

- use Render or another Node host for quick deployment
- mount persistent storage if you use local JSON persistence in production
- set Supabase env vars if you want database-backed storage

## Troubleshooting

- If the app starts but data does not persist, check whether `SUPABASE_URL` and `SUPABASE_KEY` are set or whether `DATA_DIR` points to a writable directory.
- If the admin page returns `401`, re-check the Basic Auth credentials.
- If images do not load, confirm the files still exist under `images/` and the paths in `index.html` are unchanged.

## Suggested Next Improvements

- Move hard-coded admin credentials into environment variables.
- Add a small README section for any new endpoint or content area you introduce.
- Add automated tests for the backend routes if this project becomes more active.