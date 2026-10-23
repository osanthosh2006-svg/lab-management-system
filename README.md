# LabTrack — Laboratory Management System

A full-stack platform for research laboratories to manage **sample lifecycle
tracking, experiment documentation, instrument usage, and report
generation** — replacing spreadsheets and paper logbooks with a single,
auditable system.

Built with the **MERN stack**: MongoDB, Express, React, Node.js.

---

## Features

**Sample tracking**
- Register samples with a unique auto-generated ID (`SMP-000001`)
- Full lifecycle tracking: Registered → In Storage → In Use → Analyzed → Archived / Disposed
- Status-change history with timestamps and notes, so every sample has an audit trail
- Search and filter by status, type, or free text

**Experiment records**
- Auto-numbered experiments (`EXP-000001`) with objective, protocol, and results
- Link one experiment to multiple samples and instruments
- Linking a sample to an experiment automatically moves it to "In Use"
- Status tracking: Planned → In Progress → Completed / Cancelled

**Instrument usage**
- Equipment inventory with model, serial number, category, location, and calibration dates
- Start/stop usage sessions per instrument, tied to the logged-in user and (optionally) an experiment
- Full usage history per instrument
- Instrument status automatically updates (Available ↔ In Use)

**Report generation**
- On-demand PDF reports for sample inventory, experiment records, and instrument usage
- Filterable by status, date range, or instrument
- Generated server-side with `pdfkit` and downloaded directly from the browser

**Access control**
- JWT authentication with two roles: `admin` and `researcher`
- Admins manage the instrument inventory; researchers manage samples and experiments

---

## Tech stack

| Layer      | Technology                                   |
|------------|-----------------------------------------------|
| Frontend   | React 18, Vite, React Router, Tailwind CSS, Recharts, Axios |
| Backend    | Node.js, Express                              |
| Database   | MongoDB (Mongoose ODM)                        |
| Auth       | JSON Web Tokens, bcrypt password hashing      |
| Reports    | pdfkit (server-generated PDFs)                |

---

## Project structure

```
lab-management-system/
├── backend/
│   ├── config/          # DB connection
│   ├── models/          # Mongoose schemas (User, Sample, Experiment, Instrument, UsageLog, Counter)
│   ├── controllers/     # Route handlers / business logic
│   ├── routes/          # Express route definitions
│   ├── middleware/      # Auth (JWT) and error handling
│   ├── utils/           # Token signing, PDF layout helpers
│   ├── seed/            # Demo data seed script
│   └── server.js        # App entry point
└── frontend/
    └── src/
        ├── api/          # Axios instance with auth interceptor
        ├── context/      # AuthContext (login/register/session)
        ├── components/   # Sidebar, Layout, StatusTag, Modal, etc.
        └── pages/        # Dashboard, Samples, Experiments, Instruments, Reports, Login, Register
```

---

## Prerequisites

- [Node.js](https://nodejs.org) v18 or later
- A MongoDB database — either:
  - a local MongoDB server ([install guide](https://www.mongodb.com/docs/manual/installation/)), or
  - a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (recommended if you don't want to install MongoDB locally)

---

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set:
- `MONGO_URI` — your local MongoDB URI or Atlas connection string
- `JWT_SECRET` — any long random string

Load the database with demo data (creates an admin, a researcher, sample instruments, samples and experiments):

```bash
npm run seed
```

Start the API server:

```bash
npm run dev
```

The API runs at `http://localhost:5000`. Visit `http://localhost:5000/api/health` to confirm it's up.

### 2. Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and proxies `/api` requests to the backend automatically (see `vite.config.js`).

### 3. Log in

Use one of the seeded demo accounts, or register your own:

| Role       | Email                  | Password     |
|------------|-------------------------|--------------|
| Admin      | admin@labtrack.io       | admin123     |
| Researcher | researcher@labtrack.io  | research123  |

---

## API reference

All routes are prefixed with `/api` and (except auth) require an
`Authorization: Bearer <token>` header.

| Method | Route                                     | Description                          |
|--------|--------------------------------------------|---------------------------------------|
| POST   | `/auth/register`                           | Create a researcher account           |
| POST   | `/auth/login`                              | Log in, returns a JWT                 |
| GET    | `/auth/me`                                 | Get the current user                  |
| GET    | `/samples`                                 | List samples (filter by status/type/q)|
| POST   | `/samples`                                 | Register a new sample                 |
| GET    | `/samples/:id`                             | Get a sample's details + history      |
| PUT    | `/samples/:id`                             | Edit sample fields                    |
| PATCH  | `/samples/:id/status`                      | Update lifecycle status               |
| DELETE | `/samples/:id`                             | Delete a sample                       |
| GET    | `/experiments`                             | List experiments                      |
| POST   | `/experiments`                             | Create an experiment                  |
| GET    | `/experiments/:id`                         | Get experiment details                |
| PUT    | `/experiments/:id`                         | Update status, results, links         |
| DELETE | `/experiments/:id`                         | Delete an experiment                  |
| GET    | `/instruments`                             | List instruments                      |
| POST   | `/instruments`                             | Add an instrument (admin only)        |
| GET    | `/instruments/:id`                         | Get instrument + usage logs           |
| PUT    | `/instruments/:id`                         | Edit instrument (admin only)          |
| DELETE | `/instruments/:id`                         | Remove instrument (admin only)        |
| POST   | `/instruments/:id/usage/start`             | Start a usage session                 |
| POST   | `/instruments/:id/usage/:logId/end`        | End a usage session                   |
| GET    | `/reports/samples`                         | Download samples PDF report           |
| GET    | `/reports/experiments`                     | Download experiments PDF report       |
| GET    | `/reports/instrument-usage`                | Download instrument usage PDF report  |
| GET    | `/dashboard/summary`                       | Aggregate stats for the overview page |

---

## Possible extensions

- Email/notification alerts when calibration is due or a sample nears expiry
- Barcode/QR generation and scanning for physical sample labels
- CSV export alongside PDF reports
- File attachments (raw data, chromatograms, images) on experiments
- Fine-grained per-department permissions
