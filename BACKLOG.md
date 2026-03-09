# Kanban 2.0 — Product Backlog

> Items are ordered by priority. Status: `[ ]` Todo · `[/]` In Progress · `[x]` Done

---

## 🔴 Priority 1 — Critical (Production Hardening)

- [x] **Adopt Prisma Migrations**
  - Replace `prisma db push` with `prisma migrate dev` to generate versioned migration files
  - Commit migration files to git to prevent accidental data loss on schema changes
  - Est: ~1 hour | Cost impact: $0

- [x] **CI/CD Pipeline with GitHub Actions**
  - Auto-build and deploy to Cloud Run on every push to `main`
  - Add a basic lint/type-check step as a gate before deploy
  - Est: ~2 hours | Cost impact: $0

- [x] **Secrets via Google Secret Manager**
  - Move `NEXTAUTH_SECRET` and `DATABASE_URL` out of CLI args and into Secret Manager
  - Configure Cloud Run to read secrets at runtime
  - Est: ~1 hour | Cost impact: ~$0.06/month

---

## 🟡 Priority 2 — Important (Feature & UX Gaps)

- [ ] **Drag & Drop Task Cards**
  - Implement card drag between Kanban columns using `@dnd-kit`
  - Should update task `status` via PATCH API on drop
  - Est: ~3–4 hours | Cost impact: $0

- [ ] **Wire Up Search Bar**
  - Connect the top bar search input to a `/api/tasks/search?q=` endpoint
  - Return filtered tasks across all of the user's accessible projects
  - Est: ~2–3 hours | Cost impact: $0

- [ ] **Real-Time Board Refresh (Polling)**
  - Use SWR's `refreshInterval` to poll the task API every 15–30 seconds
  - Ensures multiple users see each other's changes without manual reload
  - Est: ~2 hours | Cost impact: $0

- [ ] **Forgot Password / Password Reset**
  - Add a "Forgot password?" link on the login page
  - Integrate with an email provider (Resend.com or SendGrid free tier)
  - Send a time-limited reset link via email
  - Est: ~3–4 hours | Cost impact: ~$0–$3/month

---

## 🟢 Priority 3 — Code Quality & Reliability

- [ ] **Error Boundaries & Loading States**
  - Wrap key page sections in React `<ErrorBoundary>` components
  - Add skeleton placeholder cards while Kanban data is loading
  - Est: ~2 hours | Cost impact: $0

- [ ] **Extract Inline Panel Styles to CSS**
  - Move gradient border styles from JSX inline `style={{}}` props in `NavRail.tsx` and `KanbanBoard.tsx` to named classes in `globals.css`
  - Est: ~1 hour | Cost impact: $0

- [ ] **Automated Test Suite**
  - Unit tests for API route logic (Jest)
  - E2E tests for login, task creation, and role-based access (Playwright)
  - Est: ~1–2 days | Cost impact: $0

---

## 💡 Future Ideas (Not Scheduled)

- [ ] Task due dates and calendar view
- [ ] Email / in-app notifications on task assignment
- [ ] Task comments / @mentions
- [ ] Dark mode toggle
- [ ] Project-level analytics dashboard
- [ ] Mobile-responsive layout

---

*Last updated: 2026-03-07*
