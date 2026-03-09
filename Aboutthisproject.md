# About This Project

## 1. What Did We Build?

**Next.js Kanban** — a full-stack, production-ready Project & Task Management application built and deployed to the cloud. This is a Next.js migration of our original static Kanban prototype.

It is a dynamic, multi-user workspace where teams can organize work across projects using a Kanban-style board (To Do → In Progress → Done). The application features secure authentication, role-based access control, a rich task management system with notes and media uploads, and a polished Material Design 3 UI with gradient-bordered panels.

The live production app is available at:
👉 **https://next-kanban-25f3zmccwa-uc.a.run.app**

---

## 2. Tech Stack & Architecture

### Frontend
| Layer | Technology |
|-------|------------|
| Framework | **Next.js 15** (App Router, React Server Components) |
| Styling | **Vanilla CSS** (Material Design 3 principles, no UI libraries) |
| Authentication UI | **NextAuth.js** client-side session management |

### Backend
| Layer | Technology |
|-------|------------|
| API Routes | Next.js API Routes (REST) |
| Authentication | **NextAuth.js** (Credentials Provider + bcrypt password hashing) |
| ORM | **Prisma** (type-safe schema & database client) |
| Database | **Neon Serverless PostgreSQL** (free tier, scales to zero) |

### Infrastructure & Deployment
| Layer | Technology |
|-------|------------|
| Hosting | **Google Cloud Run** (containerized, scales to zero) |
| CI/CD Pipeline | **GitHub Actions** (auto-builds and deploys to Cloud Run on push to main) |
| Container Build | Next.js `standalone` output mode |
| Source Control | **GitHub** — https://github.com/cvbiju/nextkanban |

### Architecture Diagram

```
User (Browser)
      │
      ▼
Google Cloud Run  ──────────────────────────────────────────────┐
  Next.js App (App Router)                                       │
  ├── /login, /register        (Auth pages)                      │
  ├── / (Kanban Board)         (Protected pages)                 │
  ├── /projects, /team         (Management pages)                │
  └── /api/*                   (REST API endpoints)              │
                                       │                         │
                                       ▼                         │
                              Neon PostgreSQL                     │
                          (Serverless, us-east-1)                │
                                                                 │
NextAuth.js session tokens ──────────────────────────────────────┘
```

### Key Data Models
- **User** — email, bcrypt password, role (ADMIN/USER), avatar, isActive
- **Project** — title, description, creator, members (with roles)
- **Task** — title, description, status, priority, assignee
- **TaskNote** — text/image notes attached to tasks with timestamps

---

## 3. Monthly Cost

| Service | Cost |
|---------|------|
| **Google Cloud Run** (Next.js app server) | **$0** (scales to zero; free tier covers ~2M requests/month) |
| **Neon PostgreSQL** (database) | **$0** (free tier; scales to zero when idle) |
| **GitHub** (source control + Actions) | **$0** (public repo) |
| **Total** | **~$0 / month** 🎉 |

> **Note:** Neon's free tier "cold-starts" the database after a period of inactivity. The very first login after a long idle period may take 1–2 extra seconds — this is normal and only affects the first request.

---

## 4. How Long Did It Take?

The entire application — from a blank `create-next-app` scaffold to a fully deployed, production-ready cloud application — was designed, built, and shipped in a **single development session (~8–10 hours)**. This included:

- ✅ Setting up Next.js with App Router and Prisma ORM
- ✅ Designing and building the full Material Design 3 UI from scratch
- ✅ Implementing authentication (login, register, session management)
- ✅ Building full CRUD for Users, Projects, Tasks, and Notes
- ✅ Provisioning and configuring Google Cloud Run + Cloud SQL (PostgreSQL)
- ✅ Migrating the database to Neon serverless to reduce cost to $0
- ✅ Setting up a GitHub Actions CI/CD pipeline for automated deployments
- ✅ Checking all source code into GitHub
