# AgriPulse — Production-Ready Agentic Chatbot for Bangladeshi Farmers

## Context

Bangladeshi farmers need hyper-local, Bangla-language AI assistance for pest/disease detection, weather-driven crop decisions, livestock health, expert booking, and market information. The system must be production-grade: resilient, fast, self-improving, and deployable on modest infrastructure. This plan translates the architectural blueprint in project_descriptions_drafting.md into a fully executable implementation roadmap.

---

## 1. Tech Stack (Locked Decisions)

| Layer | Technology | Why |
|---|---|---|
| LLM | OpenRouter (unified API) | Multi-model routing; best model per task; cost optimization; fallback redundancy |
| Orchestration | LangGraph (Python) | Stateful multi-agent graphs; built-in checkpointing; human-in-the-loop |
| RAG | Graph-based RAG | Structured knowledge retrieval; relationship-aware answers; multi-hop reasoning |
| Vector DB | Qdrant Cloud (GCP Australia) | Managed vector search; hybrid filtering; geo-spatial queries; no local infra |
| Structured DB | Supabase (PostgreSQL + pgvector) | Cloud-managed Postgres; auth; real-time; vector search via pgvector |
| Short-term Memory | Redis 7 | Per-session chat context (TTL 2h) |
| Long-term Memory | Graphiti (Zep) | Temporal knowledge graph; entity extraction; episodic memory |
| Vision | External Disease Detection APIs | Cow muzzle + leaf disease detection via partner APIs |
| Weather | OpenWeatherMap API (Bangla locale) | Forecast + humidity for risk engine |
| Notifications | Firebase Cloud Messaging + Bangladesh SMS (SSL Wireless) | Push + fallback SMS |
| Backend | FastAPI (async) | Agent API; WebSocket streaming; webhook endpoints |
| Frontend (MVP) | React + Next.js 16 (App Router) | Web chat; image upload; alert dashboard |
| Mobile (Phase 4) | Flutter | Offline-first; voice input for low-literacy farmers |
| Container | Docker + Docker Compose | Dev + prod parity |
| Deployment | Railway.app (MVP) → Render, Vercel Openrouse that availabe right now | Fast deploy; managed Redis + Postgres |
| Monitoring | Sentry + LangFuse + custom feedback DB | Error tracking + LLM trace observability + prompt management |
| Knowledge Graph Build | Graphify (local) | Codebase graph for agent self-awareness |

---

## 2. Project Structure

```
agripulse-agent-revamp/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI app + lifespan
│   │   ├── config.py                  # Settings (pydantic-settings)
│   │   ├── agents/
│   │   │   ├── orchestrator.py        # LangGraph graph definition + routing
│   │   │   ├── knowledge_agent.py     # Graph-based RAG pipeline
│   │   │   ├── sql_agent.py           # Farmer data queries
│   │   │   ├── vision_agent.py        # External API image analysis
│   │   │   ├── weather_agent.py       # Forecast fetch + risk scoring
│   │   │   ├── notification_agent.py  # Alert generation + dispatch
│   │   │   └── action_agent.py        # Booking, scheduling, workflows
│   │   ├── memory/
│   │   │   ├── graphiti_client.py     # Graphiti long-term memory interface
│   │   │   ├── redis_client.py        # Session memory interface
│   │   │   └── memory_manager.py      # Read/write unified interface
│   │   ├── models/
│   │   │   ├── farmer.py              # Farmer profile ORM
│   │   │   ├── crop.py                # Crop records ORM
│   │   │   ├── alert.py               # Weather/pest alert ORM
│   │   │   ├── booking.py             # Expert booking ORM
│   │   │   └── feedback.py            # 👍/👎 + corrections
│   │   ├── tools/
│   │   │   ├── disease_detection.py   # Tool: call vision model
│   │   │   ├── weather_tools.py       # Tool: forecast fetch + risk calc
│   │   │   ├── rag_tools.py           # Tool: vector search
│   │   │   ├── db_tools.py            # Tool: SQL queries via agent
│   │   │   ├── booking_tools.py       # Tool: calendar + slot management
│   │   │   └── notification_tools.py  # Tool: FCM + SMS dispatch
│   │   ├── routers/
│   │   │   ├── chat.py                # WebSocket + REST chat endpoint
│   │   │   ├── alerts.py              # Alert trigger + CRON webhooks
│   │   │   ├── feedback.py            # Feedback capture endpoint
│   │   │   └── health.py              # Health check
│   │   ├── db/
│   │   │   ├── database.py            # Async SQLAlchemy engine
│   │   │   └── migrations/            # Alembic migrations
│   │   ├── rag/
│   │   │   ├── ingest.py              # Document ingestion pipeline
│   │   │   ├── index.py               # Vector index builder (Qdrant Cloud)
│   │   │   └── docs/                  # Seed documents (pest guides, policies)
│   │   └── utils/
│   │       ├── bangla.py              # Transliteration + language detection
│   │       ├── safety.py              # Response safety layer
│   │       └── logging.py             # Structured logging + LangFuse traces
│   ├── tests/
│   │   ├── unit/                      # Agent unit tests
│   │   ├── integration/               # DB + Redis + API tests
│   │   └── e2e/                       # Full flow simulation
│   ├── pyproject.toml
│   ├── Dockerfile
│   └── alembic.ini
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                       # Lint, test, build, deploy
│   │   └── security-check.yml           # Secret scan, dependency audit, container scan
│   └── PULL_REQUEST_TEMPLATE.md
├── frontend/
│   ├── app/
│   │   ├── page.tsx                   # Landing / chat interface
│   │   ├── dashboard/page.tsx         # Farmer dashboard + alerts
│   │   └── api/                       # Next.js API routes (proxy to backend)
│   ├── components/
│   │   ├── ChatWindow.tsx             # Streaming chat with image upload
│   │   ├── AlertBanner.tsx            # Active weather/pest alerts
│   │   └── BookingPanel.tsx           # Expert booking UI
│   ├── package.json
│   └── Dockerfile
├── infra/
│   ├── docker-compose.yml             # Full local stack
│   ├── docker-compose.prod.yml        # Production overrides
│   └── railway.toml                   # Railway deployment config
├── docs/
│   └── superpowers/specs/
│       └── 2026-05-06-agripulse-agent-design.md
├── graphify-out/                      # Auto-generated knowledge graph
├── .env.example
├── lefthook.yml                         # Pre-push hooks (ruff, eslint, prettier, tsc)
├── CLAUDE.md
└── README.md
```

---

## 3. Agent Definitions & Responsibilities

### Orchestrator Agent (LangGraph graph)

- **Input**: user message, session_id, farmer_id, optional image
- **Responsibilities**: intent classification, routing to sub-agents, parallel tool fan-out, response synthesis, Bangla output guarantee
- **LangGraph nodes**: classify_intent → route → fan-out to sub-agents → synthesize → safety_check → respond
- **State**: AgriState TypedDict holding messages, farmer_context, agent_outputs, tool_results

### Knowledge Agent (Graph-Based RAG)

- **Vector Store**: Qdrant Cloud (GCP Australia) for managed vector search; collection-based organization; hybrid search with payload filtering
- **Graph Layer**: Documents chunked and embedded; entity-relationship graph built from extracted concepts (pests, crops, treatments, regions); enables multi-hop reasoning
- **Retrieval Strategy**: Hybrid search — vector similarity + graph traversal + metadata filtering (crop_type, region, season); returns connected knowledge chunks rather than isolated passages
- **Tool**: search_knowledge(query, crop_type, region) → structured subgraph with top-5 passages + related entities
- **Language**: all docs ingested in both Bangla and English; cross-lingual retrieval via multilingual embeddings (text-embedding-3-small) or opensource embedding models from Openrouter

### SQL Agent (Agentic SQL Generator)

- **Schema Analysis**: Dynamically introspects database schema, table names, column names, relationships, and constraints via SQLAlchemy metadata
- **Natural Language to SQL**: Converts user questions into valid SQL by analyzing schema context — supports SELECT, UPDATE, INSERT, nested queries, JOINs, filtering (WHERE), grouping (GROUP BY), aggregation (COUNT, SUM, AVG), sorting (ORDER BY), and window functions
- **Query Validation**: Executes EXPLAIN on generated SQL before running; rolls back on errors; retries with schema hints
- **Safety**: Read-only by default for farmer-facing queries; write operations gated behind explicit confirmation prompts; parameterized queries only; query timeout limits (5s max)
- **Self-Correction**: On SQL errors, captures error message → re-prompts LLM with schema + error → generates corrected query (max 3 retries)
- **Context Awareness**: Maintains query history per session; references previous query results for follow-up questions

### Vision Agent (External API Integration)

- **Cow Muzzle Detection**: Calls external livestock health API — uploads base64 image → receives structured JSON (disease_name, confidence, severity, recommended_action)
- **Leaf Disease Detection**: Calls external crop disease API — uploads base64 image → receives structured JSON (disease_name, confidence, severity, treatment_steps)
- **LLM Response Generation**: The orchestrator passes API response context to OpenRouter LLM → generates natural Bangla response with disease explanation, severity assessment, and next steps
- **Confidence Gate**: If API confidence < 60% → append "ছবিটি আরও স্পষ্ট করে তুলুন বা নিকটস্থ কৃষি অফিসে যোগাযোগ করুন" (Please take a clearer photo or contact your nearest agriculture office)
- **Fallback**: If external APIs are unavailable → store image for manual expert review + notify farmer

### Weather Agent

- **Data**: OpenWeatherMap 5-day forecast + current conditions, keyed to farmer's GPS coordinates
- **Risk engine**: rule-based + ML scoring (humidity > 80% + temp 25–30°C → fungal risk HIGH)
- **Output**: structured WeatherRisk object with alert_level, risk_type, affected_crops

### Notification Agent

- **Triggers**: scheduled CRON (twice daily) + event-driven (on weather risk > MEDIUM)
- **Channels**: FCM push (mobile) → SMS fallback (SSL Wireless API)
- **Message generation**: LLM-generated Bangla alert with prevention steps

### Action Agent

- **Booking**: slot lookup → calendar confirmation → DB write → confirmation SMS
- **Scheduling**: irrigation reminders, fertilizer timing — stored as cron-like tasks in DB

---

## 4. Memory Architecture

### Short-term (Redis)

- **Key**: session:{session_id} — last 20 messages, TTL 2 hours
- **Enables**: follow-up questions, context window management

### Long-term (Graphiti)

- Graphiti runs as a service (Docker), connected to Neo4j or in-process SQLite for dev
- **Entities extracted**: farmer, crop, disease, region, weather_event, treatment
- **Temporal edges**: farmer -[has_crop]→ crop, crop -[infected_by]→ disease, disease -[treated_with]→ treatment
- **On each conversation turn**: graphiti.add_episode(session_id, messages) → auto-extracts entities + edges
- **On query**: graphiti.search(query, farmer_id) → top facts injected into system prompt as structured context
- **Personalization example**: "আপনার যশোর অঞ্চলে গত মাসে ধানে ব্লাস্ট রোগ ছিল, এবার সতর্ক থাকুন"

---

## 5. Tools Catalog

| Tool Name | Agent | Input | Output |
|---|---|---|---|
| detect_disease | Vision | base64 image | API response → LLM-generated Bangla diagnosis |
| search_knowledge | Knowledge | query, crop, region | passages + source |
| get_weather_risk | Weather | lat, lon | WeatherRisk object |
| nl_to_sql | SQL | natural language question | SQL result + explanation |
| book_expert | Action | expert_id, slot | booking confirmation |
| schedule_reminder | Action | farmer_id, task, time | cron record |
| send_alert | Notification | farmer_ids, message | dispatch status |
| graphiti_search | Memory | query, farmer_id | facts list |
| graphiti_add | Memory | episode | updated graph |

---

## 6. Safety Layer

Every LLM response passes through safety.py:

1. **Pesticide overdose filter**: regex + semantic check — block responses suggesting >2x label dose
2. **Confidence gate**: if vision confidence < 60% → append "ছবিটি আরও স্পষ্ট করে তুলুন বা নিকটস্থ কৃষি অফিসে যোগাযোগ করুন"
3. **Hallucination guard**: all pesticide/medicine names verified against a static approved list
4. **Language guarantee**: output always in Bangla (detected via langdetect; re-prompt if English)

---

## 7. Self-Evolving / Continuous Improvement Pipeline

### Feedback Capture

- Every chat response shows 👍 / 👎 + optional text correction
- Stored in feedback table: session_id, message_id, rating, correction, agent_used

### Weekly Eval Loop

- **Script**: scripts/eval_weekly.py
- Pulls 👎 feedback from last 7 days
- Runs against a golden test set (50 Q&A pairs covering all agent types)
- If accuracy drops >5% → triggers Slack/email alert to team

### Prompt Tuning Pipeline

- 👎 + correction pairs accumulate in corrections table
- **Monthly**: export corrections → generate few-shot examples → update system prompts in agents/prompts/
- No fine-tuning initially; prompt engineering iteration cycle is faster with OpenRouter multi-model access

### RAG Index Refresh

- **CRON**: scripts/ingest_docs.py runs weekly — checks for new documents in rag/docs/incoming/
- **Embedding refresh**: re-index changed chunks only (incremental embedding updates)

### Graphiti Graph Growth

- Grows automatically with every conversation — no manual curation needed
- **Monthly**: run graphiti.prune() to remove stale/low-confidence edges

---

## 8. Deployment Guidelines

### Local Development

```bash
cp .env.example .env          # fill API keys
docker compose up -d          # redis, graphiti, backend, frontend (supabase + qdrant are cloud-hosted)
cd backend && alembic upgrade head
python -m app.rag.ingest      # seed RAG documents
uvicorn app.main:app --reload
```

### Environment Variables (.env.example)

```
OPENROUTER_API_KEY=                    # Unified LLM access
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
QDRANT_URL=https://your-cluster-id.region.gcp.cloud.qdrant.io:6333
QDRANT_API_KEY=your-qdrant-api-key
QDRANT_COLLECTION_NAME=agripulse_knowledge
OPENWEATHERMAP_API_KEY=
FIREBASE_SERVICE_ACCOUNT_JSON=
SSL_WIRELESS_API_KEY=                  # Bangladesh SMS
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-supabase-service-role-key
SUPABASE_DB_PASSWORD=your-supabase-db-password
DATABASE_URL=postgresql+asyncpg://postgres.your-project-ref:[password]@aws-0-region.pooler.supabase.com:6543/postgres
REDIS_URL=redis://localhost:6379
GRAPHITI_URL=http://localhost:7474
LANGFUSE_PUBLIC_KEY=
LANGFUSE_SECRET_KEY=
LANGFUSE_HOST=https://cloud.langfuse.com
SENTRY_DSN=
COW_MUZZLE_API_URL=                    # External livestock detection API
COW_MUZZLE_API_KEY=
LEAF_DISEASE_API_URL=                  # External crop disease detection API
LEAF_DISEASE_API_KEY=
```

### Production (Railway.app — MVP)

- **Services**: backend (FastAPI), frontend (Next.js), redis (managed)
- **Database**: Supabase PostgreSQL (cloud-managed with pgvector)
- **Graphiti**: Railway private service (Neo4j CE image)
- **Env**: set via Railway dashboard; never in repo
- **Deploy**: git push to main → Railway auto-deploys via Dockerfile
- **CRON jobs**: Railway CRON plugin → /api/alerts/trigger twice daily

### Production (AWS ECS — Scale)

- ECR for Docker images
- ECS Fargate for backend + frontend services
- Supabase PostgreSQL (structured data + pgvector); Qdrant Cloud (dedicated vector search)
- ElastiCache Redis
- ALB with SSL termination
- CloudWatch for logs + alarms
- **GitHub Actions CI/CD**: test → build → push to ECR → deploy

### CI/CD Pipeline (GitHub Actions)

**Workflows:**

1. **`.github/workflows/security-check.yml`** — runs first, gates all other jobs
   - TruffleHog secret scan (git history + filesystem)
   - `.env` file leak detection (verifies no `.env` committed except `.env.example`)
   - Hardcoded secret pattern scan (API keys, DB passwords, tokens in source)
   - pip-audit (Python dependency vulnerabilities)
   - npm audit (Node dependency vulnerabilities)
   - Trivy container image scan (on PRs)

2. **`.github/workflows/ci.yml`** — runs in parallel but branch protection requires both
   - Backend lint (ruff, mypy)
   - Backend tests (unit + integration with Postgres + Redis)
   - Frontend lint + type check + build
   - Docker build verification

```yaml
# .github/workflows/security-check.yml
on: [push, pull_request]
jobs:
  trufflehog: secret scan
  env-file-check: .env leak detection
  dependency-check: pip-audit + npm audit
  container-scan: Trivy image scan

# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  backend-lint: ruff + mypy
  backend-test: pytest
  frontend-lint: eslint + tsc
  docker-build: image verification
```

### Pre-Push Hooks (Local)

Install **lefthook** to run checks before every `git push`:
```bash
npx lefthook install
```

Checks run automatically on push (parallel):
- **Backend**: `uv run ruff check --fix`, `uv run ruff format --check`, `uv run mypy`
- **Frontend**: `npx eslint --fix`, `npx prettier --check`, `npx tsc --noEmit`
- **Commit message**: Conventional Commits validation

The push is blocked if any check fails. Fix locally, then push again.

**Branch Protection Rules:**
- Require `security-check` + `ci` to pass before merge
- Require signed commits
- Require 1 reviewer approval
- Dismiss stale reviews on new commits

> 📋 **Setup Instructions:** See `docs/GITHUB_POLICY_SETUP.md` for step-by-step GitHub configuration (branch protection, security scanning, collaborator access, labels). Branch protection requires GitHub Pro for private repos — free for public repos.

---

## 9. Graphify Integration

After any code changes in this session:
```bash
graphify update .    # updates codebase knowledge graph (AST-only, no API cost)
```

Key graph queries for developers:
```bash
graphify query "how does orchestrator route to vision agent"
graphify path "orchestrator" "notification_agent"
graphify explain "graphiti memory integration"
```

The graph lives in graphify-out/ and is indexed in GRAPH_REPORT.md.

---

## 10. Implementation Phases & Tasks

---

### Phase 0 — Foundation (Week 1)

**Goal**: Working local dev environment, DB schema, config

| # | Task | Description | Output |
|---|---|---|---|
| 0.1 | Init Python project | pyproject.toml, ruff, mypy, pytest, FastAPI, LangGraph, qdrant-client, SQLAlchemy, Alembic, pydantic-settings | backend/pyproject.toml |
| 0.2 | Docker Compose stack | redis, graphiti (neo4j), backend placeholder (supabase + qdrant are cloud-hosted) | infra/docker-compose.yml |
| 0.3 | Database schema | Alembic migrations for: farmers, crops, alerts, bookings, feedback, corrections tables | backend/app/db/migrations/ |
| 0.4 | Config + env setup | config.py with pydantic-settings; .env.example with all keys | backend/app/config.py |
| 0.5 | FastAPI skeleton | main.py, health router, CORS, lifespan hooks | backend/app/main.py |
| 0.6 | Redis client | Session memory read/write with TTL | backend/app/memory/redis_client.py |
| 0.7 | Graphiti client | Init Graphiti, add_episode(), search() wrappers | backend/app/memory/graphiti_client.py |
| 0.8 | Pre-push hooks | lefthook.yml with uv ruff + eslint + prettier + tsc checks | lefthook.yml |
| 0.9 | GitHub Actions security | security-check.yml with TruffleHog, pip-audit, npm audit, Trivy | .github/workflows/security-check.yml |

---

### Phase 1 — Core Agents (Week 2–3)

**Goal**: Orchestrator + Knowledge + SQL agents functional end-to-end

| # | Task | Description | Output |
|---|---|---|---|
| 1.1 | AgriState definition | TypedDict for LangGraph state: messages, farmer_ctx, agent_outputs | agents/orchestrator.py |
| 1.2 | Intent classifier node | OpenRouter haiku call → classifies intent into: pest_detection, weather_query, irrigation_advice, booking, general | agents/orchestrator.py |
| 1.3 | RAG document ingestion | Ingest 20+ seed docs into Qdrant Cloud collection; build entity-relationship graph layer | app/rag/ingest.py + rag/docs/ |
| 1.4 | Knowledge agent | Graph-based RAG query engine as LangGraph node; hybrid vector + graph traversal retrieval | agents/knowledge_agent.py |
| 1.5 | SQL agent | Agentic NL-to-SQL with schema introspection; supports SELECT, UPDATE, nested queries, JOINs, filtering, grouping | agents/sql_agent.py |
| 1.6 | Response synthesizer | LangGraph node: merge agent outputs → OpenRouter → Bangla response | agents/orchestrator.py |
| 1.7 | Safety layer | Pesticide filter + confidence gate + Bangla guarantee | app/utils/safety.py |
| 1.8 | Chat WebSocket endpoint | Streaming response via WebSocket; session management via Redis | app/routers/chat.py |
| 1.9 | Basic frontend chat | Next.js streaming chat UI with image upload placeholder | frontend/app/page.tsx |
| 1.10 | Unit tests Phase 1 | Test each agent node in isolation with mock LLM | tests/unit/ |

---

### Phase 2 — Vision + Weather (Week 4)

**Goal**: Image-based disease detection + weather risk alerts

| # | Task | Description | Output |
|---|---|---|---|
| 2.1 | Vision agent | External API integration for cow muzzle + leaf disease; LLM generates Bangla response from API context | agents/vision_agent.py |
| 2.2 | Disease detection tool | Base64 image → detect_disease() tool registered in LangGraph | tools/disease_detection.py |
| 2.3 | Image upload endpoint | Multipart form → base64 encode → inject into chat message | app/routers/chat.py |
| 2.4 | Weather agent | OpenWeatherMap fetch + risk scoring rule engine | agents/weather_agent.py |
| 2.5 | Weather tools | get_weather_risk(lat, lon) → WeatherRisk object | tools/weather_tools.py |
| 2.6 | Orchestrator routing update | Add vision + weather branches to LangGraph graph | agents/orchestrator.py |
| 2.7 | Pest flow test | Full Flow #1 from blueprint: image → vision → RAG → SQL → Bangla answer | tests/e2e/test_pest_flow.py |
| 2.8 | Weather flow test | Full Flow #2: weather trigger → risk → farmer lookup → alert | tests/e2e/test_weather_flow.py |

---

### Phase 3 — Notifications + Action Agent (Week 5)

**Goal**: Proactive alerts + expert booking

| # | Task | Description | Output |
|---|---|---|---|
| 3.1 | Notification agent | FCM push + SSL Wireless SMS dispatch | agents/notification_agent.py |
| 3.2 | Alert CRON endpoint | /api/alerts/trigger — runs weather scan for all farmers twice daily | app/routers/alerts.py |
| 3.3 | Alert LLM generation | Generate Bangla prevention-step message per alert type | agents/notification_agent.py |
| 3.4 | Action agent | Expert booking: slot lookup → calendar write → confirmation | agents/action_agent.py |
| 3.5 | Booking tools | book_expert(), schedule_reminder() | tools/booking_tools.py |
| 3.6 | Booking flow test | Full Flow #5: "ডাক্তার দেখাতে চাই" → booking confirmation | tests/e2e/test_booking_flow.py |
| 3.7 | Dashboard UI | Next.js dashboard: active alerts, booking history, crop status | frontend/app/dashboard/ |

---

### Phase 4 — Memory + Personalization (Week 6)

**Goal**: Graphiti-powered personalized responses

| # | Task | Description | Output |
|---|---|---|---|
| 4.1 | Graphiti episode ingestion | After every chat turn: add_episode() with extracted entities | app/memory/memory_manager.py |
| 4.2 | Graphiti context injection | Before every LLM call: graphiti.search() → inject top facts into system prompt | agents/orchestrator.py |
| 4.3 | Personalization test | Verify: second visit references past disease/crop history | tests/e2e/test_personalization.py |
| 4.4 | Memory manager | Unified read/write: Redis (short-term) + Graphiti (long-term) | app/memory/memory_manager.py |
| 4.5 | Irrigation advisory flow | Full Flow #3: weather + soil + crop → irrigation decision in Bangla | tests/e2e/test_irrigation_flow.py |
| 4.6 | Livestock flow | Full Flow #4: cow muzzle image → disease → vet booking suggestion | tests/e2e/test_livestock_flow.py |

---

### Phase 5 — Self-Evolving Pipeline (Week 7)

**Goal**: Feedback capture, eval loop, prompt improvement

| # | Task | Description | Output |
|---|---|---|---|
| 5.1 | Feedback endpoint | /api/feedback — capture 👍/👎 + correction per message | app/routers/feedback.py |
| 5.2 | Feedback UI | Thumbs buttons on each chat message in frontend | frontend/components/ChatWindow.tsx |
| 5.3 | Golden test set | 50 Q&A pairs covering all 5 flows + edge cases | tests/eval/golden_set.json |
| 5.4 | Weekly eval script | Compare current prompts against golden set; report accuracy delta | scripts/eval_weekly.py |
| 5.5 | Prompt improvement pipeline | Export 👎 corrections → generate few-shot examples → update prompts | scripts/prompt_tuning.py |
| 5.6 | RAG refresh CRON | Weekly: ingest new docs from rag/docs/incoming/; incremental re-index | scripts/ingest_docs.py |
| 5.7 | LangFuse tracing | Wrap all LLM calls with LangFuse trace decorator; prompt versioning + evaluation | app/utils/logging.py |
| 5.8 | Sentry integration | Backend error tracking + performance monitoring | app/main.py |

---

### Phase 6 — Mobile + Scale (Week 8–10)

**Goal**: Flutter app + production hardening

| # | Task | Description | Output |
|---|---|---|---|
| 6.1 | Flutter app scaffold | Offline-first chat + image capture + voice input (STT) | mobile/ |
| 6.2 | Voice input (STT) | Google Speech-to-Text API → Bangla transcript → chat message | mobile/lib/voice_input.dart |
| 6.3 | Offline mode | Queue messages when offline; sync on reconnect | mobile/lib/offline_queue.dart |
| 6.4 | AWS ECS migration | ECR + ECS Fargate + RDS + ElastiCache + ALB | infra/aws/ |
| 6.5 | Load testing | Locust test: 1000 concurrent farmers; identify bottlenecks | tests/load/locustfile.py |
| 6.6 | Rate limiting | Per-farmer API rate limits via Redis token bucket | app/utils/rate_limiter.py |
| 6.7 | CDN + image optimization | CloudFront for frontend assets; S3 for uploaded images | infra/aws/cloudfront.tf |

---

## 11. Verification Plan

### Per-Phase Verification

| Phase | How to verify |
|---|---|
| 0 | docker compose up starts clean; Supabase connection verified; alembic upgrade head passes; /health returns 200 |
| 1 | Send Bangla text message → receive Bangla response with crop/pest knowledge; Redis session persists across messages |
| 2 | Upload leaf photo → response names disease in Bangla with treatment steps; weather endpoint returns risk level |
| 3 | POST to /api/alerts/trigger → FCM notification appears on test device; booking stored in DB |
| 4 | Second conversation with same farmer_id → response references past disease history from Graphiti |
| 5 | 👎 feedback stored in DB; eval_weekly.py runs without error; LangFuse shows traces + prompt evaluations |
| 6 | Flutter app connects; voice message transcribed; offline queue syncs; Locust shows <2s P99 latency |

### Golden Test Scenarios (e2e)

1. **Pest Detection**: Upload rice leaf image → expect "Leaf Blight" mention in Bangla + treatment
2. **Irrigation Decision**: Ask "আজ সেচ দেব?" → expect weather-aware yes/no in Bangla
3. **Weather Alert**: Trigger alert for farmer in Sylhet with high humidity → expect fungal risk alert
4. **Livestock**: Upload cow image → expect disease classification + vet booking suggestion
5. **Booking**: "কৃষি বিশেষজ্ঞ দরকার" → expect slot confirmation in Bangla

---

## 12. Key Files to Create First

1. backend/pyproject.toml — all dependencies locked
2. infra/docker-compose.yml — full local stack
3. backend/app/config.py — pydantic Settings
4. backend/app/agents/orchestrator.py — LangGraph graph skeleton
5. backend/app/db/migrations/001_initial.py — all tables
6. .env.example — all required keys documented
