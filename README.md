# AgriPulse — বাংলাদেশের কৃষকদের জন্য AI চ্যাটবট

> Production-ready multi-agent chatbot for Bangladeshi farmers — pest detection, weather alerts, expert booking, and personalized Bangla advisory.

## Quick Start (Local Dev)

```bash
# 1. Clone and configure
cp .env.example .env
# Fill in ANTHROPIC_API_KEY and other required keys in .env

# 2. Start all services (Postgres, Redis, Neo4j, Backend, Frontend)
cd infra && docker compose up -d

# 3. Run DB migrations
cd backend && alembic upgrade head

# 4. Seed RAG documents
python -m app.rag.ingest

# 5. Backend is live at http://localhost:8000
# 6. Frontend is live at http://localhost:3000
# 7. API docs at http://localhost:8000/docs
# 8. Neo4j browser at http://localhost:7474
```

## Architecture

```
User (Farmer)
   ↓
Interface (Next.js chat + image upload)
   ↓
Orchestrator Agent (LangGraph)
   ↓
Specialized Agents
   ├── Knowledge Agent  (LlamaIndex RAG — pest guides, policies)
   ├── SQL Agent        (farmer profiles, crop history)
   ├── Vision Agent     (Claude Vision + YOLO — leaf/livestock disease)
   ├── Weather Agent    (OpenWeatherMap + risk engine)
   ├── Notification     (FCM push + SSL Wireless SMS)
   └── Action Agent     (expert booking, irrigation reminders)
   ↓
Memory System
   ├── Redis            (short-term session, 2h TTL)
   └── Graphiti/Neo4j   (long-term knowledge graph, grows with every chat)
```

## Branch Strategy

See [docs/BRANCHES.md](docs/BRANCHES.md) for the full git workflow, branch naming rules, PR process, and GitHub branch protection setup.

| Branch | Purpose |
|--------|---------|
| `main` | Production — protected, 2 approvals required |
| `test` | QA/staging |
| `dev` | Integration — all features merge here first |
| `feat/*` | Feature branches |
| `fix/*` | Bug fixes |
| `hotfix/*` | Urgent production fixes |

## Project Structure

```
agripulse-agent-revamp/
├── backend/           # FastAPI + LangGraph agents
├── frontend/          # Next.js 14 chat UI
├── infra/             # Docker Compose + Railway config
├── docs/              # Architecture docs, branch guidelines
└── .github/           # CI/CD workflows + PR template
```

## Tech Stack

| Layer | Tech |
|-------|------|
| LLM | Claude Sonnet 4.6 + Haiku 4.5 |
| Agents | LangGraph |
| RAG | LlamaIndex + pgvector |
| Database | PostgreSQL 16 |
| Memory | Redis (short) + Graphiti/Neo4j (long) |
| Vision | Claude Vision + YOLO v8 |
| Notifications | Firebase + SSL Wireless SMS |
| Backend | FastAPI (async) |
| Frontend | Next.js 14 |

## Development Phases

| Phase | Focus | Status |
|-------|-------|--------|
| 0 | Foundation (DB, config, Docker) | ✅ Complete |
| 1 | Core agents (chat, RAG, SQL) | 🔜 Next |
| 2 | Vision + Weather | 🔜 Planned |
| 3 | Notifications + Booking | 🔜 Planned |
| 4 | Memory + Personalization | 🔜 Planned |
| 5 | Self-evolving pipeline | 🔜 Planned |
| 6 | Flutter mobile + AWS scale | 🔜 Planned |
