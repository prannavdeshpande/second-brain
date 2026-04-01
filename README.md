# 🧠 Second Brain

> Your AI-powered personal knowledge engine — capture, organise, search, and surface anything.

![React](https://img.shields.io/badge/React-Vite-blue?style=flat-square)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-green?style=flat-square)
![FastAPI](https://img.shields.io/badge/ML%20Service-FastAPI-purple?style=flat-square)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen?style=flat-square)
![Stripe](https://img.shields.io/badge/Billing-Stripe-orange?style=flat-square)

---

## 📖 About

Second Brain is a full-stack, AI-powered knowledge management platform that lets you save, tag, and semantically search any piece of content — web pages, documents, notes, or files. The system pairs a slick React SPA with a Node.js/Express backend and a Python FastAPI ML service for RAG-style (Retrieval-Augmented Generation) indexing and retrieval.

Content is chunked, embedded, and stored in a **Chroma vector database**, making every upload instantly searchable via natural-language queries. Stripe handles subscription billing, Google/GitHub OAuth handles authentication, and AWS S3 stores original files — everything you'd expect from a production-grade SaaS knowledge tool.

---

## ✨ Features

- 🔍 **AI-powered semantic search** — Natural-language queries return an AI-generated answer with ranked source citations via RAG.
- 📥 **File & URL ingestion** — Upload documents or paste a URL; both are chunked, embedded, and indexed automatically via the ML service.
- 🔐 **Auth & OAuth** — Email/password login plus Google and GitHub OAuth via Passport.js, all secured with JWT tokens.
- 🏷️ **Tagging & filtering** — Organise content with custom tags and filter your dashboard to find items instantly.
- 📊 **Activity & usage stats** — Track add, edit, delete, and share events with a user-facing activity feed and usage metrics.
- 💳 **Stripe billing** — Full subscription management: checkout sessions, customer billing portal, and webhook handling.
- 🌗 **Theme toggle** — Light/dark mode support built into the frontend dashboard.
- 🔗 **Content sharing** — Share individual content items with others via the content management layer.

---

## 🏗️ Architecture

### High-level system overview

```mermaid
graph TD
  U([👤 User]) -->|Browser| FE["🖥️ Frontend\nVite · React · TanStack Query"]
  FE -->|REST + JWT| API["⚙️ Backend API\nNode.js · Express"]

  API -->|MongoDB queries| DB[("🍃 MongoDB\nContent · Activity")]
  API -->|multipart: file OR url| MLS["🤖 ML Service\nFastAPI · RAG · Embeddings"]
  API -->|checkout / webhooks| Stripe["💳 Stripe\nBilling · Subscriptions"]

  MLS -->|persist embeddings| VDB[("🔮 Chroma\nVector DB")]
  MLS -->|store originals| S3[("☁️ AWS S3\nFile Storage")]
```

---

### 🔀 Request flow — upload & index content

```mermaid
sequenceDiagram
  autonumber
  participant FE as 🖥️ Frontend
  participant API as ⚙️ Express API
  participant ML as 🤖 FastAPI ML Service
  participant S3 as ☁️ AWS S3
  participant VDB as 🔮 Chroma
  participant DB as 🍃 MongoDB

  FE->>API: POST /api/content (JWT · file OR url · title · tags)
  API->>ML: POST /upload/ (file or url)
  ML->>S3: Store original file
  ML->>VDB: Chunk → embed → persist vectors
  ML-->>API: { type, s3_path, chunk_ids }
  API->>DB: Create Content doc + Activity log
  API-->>FE: 201 Created (content + mlServiceResponse)
```

---

### 🔍 Request flow — AI search

```mermaid
sequenceDiagram
  autonumber
  participant FE as 🖥️ Frontend
  participant API as ⚙️ Express API
  participant ML as 🤖 FastAPI ML Service
  participant VDB as 🔮 Chroma
  participant DB as 🍃 MongoDB

  FE->>API: POST /api/search (query · JWT)
  API->>ML: POST /query/ (query text)
  ML->>VDB: Embed query → similarity search
  VDB-->>ML: Top-k matching chunks
  ML-->>API: { answer, sources[] }
  API->>DB: Enrich sources with metadata (optional)
  API-->>FE: { answer, enriched sources[] }
```

---

### 🔐 Auth flow — login & OAuth

```mermaid
flowchart TD
  A([👤 User]) --> B{Login method?}
  B -->|Email + Password| C[POST /api/auth/login]
  B -->|Google| D[GET /api/auth/google]
  B -->|GitHub| E[GET /api/auth/github]

  C --> F[Validate credentials\nBcrypt compare]
  D --> G[Passport Google Strategy\nOAuth 2.0]
  E --> H[Passport GitHub Strategy\nOAuth 2.0]

  F --> I{Valid?}
  G --> I
  H --> I

  I -->|Yes| J[Sign JWT token]
  I -->|No| K[401 Unauthorized]

  J --> L[Return JWT to Frontend]
  L --> M[🖥️ Dashboard]
```

---

### 💳 Billing flow — Stripe subscription

```mermaid
flowchart LR
  A([👤 User]) -->|Clicks upgrade| B[POST /api/billing/checkout]
  B --> C[Create Stripe Checkout Session]
  C --> D[🔗 Redirect to Stripe]
  D -->|Payment success| E[Stripe Webhook\nPOST /api/billing/webhook]
  D -->|Payment cancel| F[Back to Pricing page]
  E --> G[Verify webhook signature]
  G --> H[Update user plan in MongoDB]
  H --> I[✅ Premium access unlocked]
```

---

## 📁 Project structure

```
/
├── Frontend/                  # Vite + React SPA
│   ├── src/
│   │   ├── pages/             # Landing, Login, Signup, Dashboard, Settings, Pricing
│   │   ├── components/        # AddContentDialog, EditContentDialog, UI kit
│   │   ├── hooks/             # use-mobile, use-toast
│   │   └── lib/               # Utility helpers (cn, etc.)
│   ├── index.html
│   ├── vite.config.ts
│   └── README.md              # ← Frontend setup guide
│
├── Backend/                   # Node.js / Express API
│   ├── routes/                # Auth, Content, Search, User, Billing
│   ├── models/                # MongoDB schemas
│   ├── middleware/            # JWT protect, raw body for Stripe
│   ├── server.js
│   └── README.md              # ← Backend setup guide
│
└── README.md                  # ← You are here
```

> 📘 Each sub-directory has its own detailed README — see [Frontend/README.md](./Frontend/README.md) and [Backend/README.md](./Backend/README.md) for full setup instructions.

---

## 🚀 Getting started

### Prerequisites

- Node.js 18+
- Python 3.10+ (for the ML service)
- MongoDB (local or Atlas)
- AWS S3 bucket
- Stripe account

### 1. Clone the repo

```bash
git clone https://github.com/your-username/second-brain.git
cd second-brain
```

### 2. Start the Frontend

```bash
cd Frontend
npm install
npm run dev
# → http://localhost:8080
```

### 3. Start the Backend

```bash
cd Backend
npm install
npm run dev
# → http://localhost:5001
```

### 4. Environment variables (Backend)

Create a `Backend/.env` file:

```ini
# Server
PORT=5001
CLIENT_URL=http://localhost:8080

# Database
MONGO_URI=mongodb://localhost:27017/second_brain_db

# Auth
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# ML Service
ML_API_URL=http://localhost:8000

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PREMIUM_PLAN_ID=
STRIPE_PRO_PLAN_ID=
```

> ⚠️ The Stripe webhook endpoint requires a raw body handler for signature verification — this is already configured in `server.js`.

---

## 🧰 Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Radix UI, Tailwind CSS |
| Backend | Node.js, Express, Passport.js (Google + GitHub OAuth), JWT |
| ML Service | Python, FastAPI, LangChain / embeddings, Chroma vector DB |
| Database | MongoDB (metadata + activity), Chroma (vector embeddings) |
| Storage | AWS S3 (original files) |
| Billing | Stripe (subscriptions, portal, webhooks) |

---

