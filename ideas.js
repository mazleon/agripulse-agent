const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat,
  TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');

// ─── Color Palette ───────────────────────────────────────────────
const C = {
  green:      "1B6B3A",
  greenLight: "E8F5E9",
  greenMid:   "C8E6C9",
  teal:       "00796B",
  tealLight:  "E0F2F1",
  gold:       "F57F17",
  goldLight:  "FFF9C4",
  blue:       "1565C0",
  blueLight:  "E3F2FD",
  red:        "B71C1C",
  redLight:   "FFEBEE",
  gray:       "546E7A",
  grayLight:  "ECEFF1",
  white:      "FFFFFF",
  dark:       "1A1A2E",
  border:     "BDBDBD",
  headerBg:   "1B6B3A",
  subhead:    "2E7D32",
};

// ─── Helpers ─────────────────────────────────────────────────────
const border = (color = C.border) => ({ style: BorderStyle.SINGLE, size: 1, color });
const borders = (color = C.border) => ({ top: border(color), bottom: border(color), left: border(color), right: border(color) });
const noBorder = () => ({ style: BorderStyle.NONE, size: 0, color: "FFFFFF" });
const noBorders = () => ({ top: noBorder(), bottom: noBorder(), left: noBorder(), right: noBorder() });

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.green, space: 4 } },
    children: [new TextRun({ text, font: "Arial", size: 32, bold: true, color: C.green })]
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 140 },
    children: [new TextRun({ text, font: "Arial", size: 26, bold: true, color: C.teal })]
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, font: "Arial", size: 22, bold: true, color: C.subhead })]
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 276 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: C.dark, ...opts })]
  });
}

function paraRuns(runs) {
  return new Paragraph({
    spacing: { after: 120, line: 276 },
    children: runs.map(r => new TextRun({ font: "Arial", size: 22, color: C.dark, ...r }))
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: C.dark })]
  });
}

function numbered(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "numbers", level },
    spacing: { after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: C.dark })]
  });
}

function spacer(n = 1) {
  return Array.from({ length: n }, () => new Paragraph({ children: [new TextRun("")], spacing: { after: 60 } }));
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// ─── Colored Info Box ─────────────────────────────────────────────
function infoBox(title, lines, bgColor = C.tealLight, titleColor = C.teal) {
  const cellBorders = borders(titleColor);
  const rows = [];
  // Title row
  rows.push(new TableRow({
    children: [new TableCell({
      borders: cellBorders,
      shading: { fill: titleColor, type: ShadingType.CLEAR },
      margins: { top: 100, bottom: 100, left: 180, right: 180 },
      children: [new Paragraph({
        children: [new TextRun({ text: title, font: "Arial", size: 22, bold: true, color: C.white })]
      })]
    })]
  }));
  // Content rows
  lines.forEach(line => {
    rows.push(new TableRow({
      children: [new TableCell({
        borders: cellBorders,
        shading: { fill: bgColor, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 180, right: 180 },
        children: [new Paragraph({
          children: [new TextRun({ text: line, font: "Arial", size: 21, color: C.dark })]
        })]
      })]
    }));
  });
  return new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360], rows });
}

// ─── Standard Table ───────────────────────────────────────────────
function twoColTable(rows, colWidths = [3120, 6240]) {
  const tableRows = rows.map((row, i) => new TableRow({
    children: row.map((cell, j) => new TableCell({
      borders: borders(C.border),
      shading: { fill: i === 0 ? C.green : (i % 2 === 0 ? C.grayLight : C.white), type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      width: { size: colWidths[j], type: WidthType.DXA },
      children: [new Paragraph({
        children: [new TextRun({
          text: cell, font: "Arial", size: i === 0 ? 22 : 21,
          bold: i === 0, color: i === 0 ? C.white : C.dark
        })]
      })]
    }))
  }));
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: tableRows
  });
}

function threeColTable(rows, colWidths = [2400, 3480, 3480]) {
  const tableRows = rows.map((row, i) => new TableRow({
    children: row.map((cell, j) => new TableCell({
      borders: borders(C.border),
      shading: { fill: i === 0 ? C.teal : (i % 2 === 0 ? C.tealLight : C.white), type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      width: { size: colWidths[j], type: WidthType.DXA },
      children: [new Paragraph({
        children: [new TextRun({
          text: cell, font: "Arial", size: i === 0 ? 22 : 21,
          bold: i === 0, color: i === 0 ? C.white : C.dark
        })]
      })]
    }))
  }));
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: tableRows
  });
}

function fourColTable(rows, colWidths = [1800, 2520, 2520, 2520]) {
  const tableRows = rows.map((row, i) => new TableRow({
    children: row.map((cell, j) => new TableCell({
      borders: borders(C.border),
      shading: { fill: i === 0 ? C.blue : (i % 2 === 0 ? C.blueLight : C.white), type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 100, right: 100 },
      width: { size: colWidths[j], type: WidthType.DXA },
      children: [new Paragraph({
        children: [new TextRun({
          text: cell, font: "Arial", size: i === 0 ? 20 : 19,
          bold: i === 0, color: i === 0 ? C.white : C.dark
        })]
      })]
    }))
  }));
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: tableRows
  });
}

// ─── Highlight Box ────────────────────────────────────────────────
function highlightBox(text, bg = C.goldLight, textColor = C.dark) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
    rows: [new TableRow({ children: [new TableCell({
      borders: borders(C.gold),
      shading: { fill: bg, type: ShadingType.CLEAR },
      margins: { top: 120, bottom: 120, left: 200, right: 200 },
      children: [new Paragraph({
        children: [new TextRun({ text, font: "Arial", size: 22, bold: true, color: textColor, italics: true })]
      })]
    })] })]
  });
}

// ─── Cover Page ───────────────────────────────────────────────────
function coverPage() {
  return [
    new Paragraph({ spacing: { after: 1200 }, children: [new TextRun("")] }),
    new Table({
      width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
      rows: [new TableRow({ children: [new TableCell({
        borders: borders(C.green),
        shading: { fill: C.green, type: ShadingType.CLEAR },
        margins: { top: 400, bottom: 400, left: 400, right: 400 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 160 },
            children: [new TextRun({ text: "KRISHI AI", font: "Arial", size: 64, bold: true, color: C.white })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [new TextRun({ text: "National-Scale Agricultural Intelligence System", font: "Arial", size: 28, color: C.greenMid, italics: true })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "for Bangladesh", font: "Arial", size: 28, color: C.greenMid, italics: true })]
          }),
        ]
      })] })]
    }),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun("")] }),
    new Table({
      width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
      rows: [new TableRow({ children: [new TableCell({
        borders: borders(C.teal),
        shading: { fill: C.tealLight, type: ShadingType.CLEAR },
        margins: { top: 200, bottom: 200, left: 300, right: 300 },
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
            children: [new TextRun({ text: "Production-Grade Multi-Agent AI Architecture", font: "Arial", size: 24, bold: true, color: C.teal })]
          }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
            children: [new TextRun({ text: "Serving Millions of Farmers with Deterministic, Safe, and Multilingual AI", font: "Arial", size: 20, color: C.gray })]
          }),
          new Paragraph({ alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Version 1.0  |  2025  |  Confidential Technical Blueprint", font: "Arial", size: 18, color: C.gray, italics: true })]
          }),
        ]
      })] })]
    }),
    new Paragraph({ spacing: { after: 300 }, children: [new TextRun("")] }),
    fourColTable([
      ["Metric", "Target", "Technology", "Priority"],
      ["Users", "10M+ Farmers", "Kubernetes + Redis", "Critical"],
      ["Response Time", "< 2 seconds", "Async FastAPI", "High"],
      ["Languages", "Bangla + English", "LLM + Templates", "Critical"],
      ["Uptime", "99.9% SLA", "Multi-region Deploy", "High"],
      ["Cost/Query", "< $0.001", "Model Routing", "High"],
    ], [1560, 2100, 2700, 3000]),
    pageBreak()
  ];
}

// ─── Executive Summary ────────────────────────────────────────────
function executiveSummary() {
  return [
    heading1("1. Executive Summary"),
    para("Bangladesh is home to over 16 million farming households, contributing roughly 13% of GDP and employing more than 40% of the workforce. Yet access to real-time, expert-level agronomic guidance remains severely limited, especially in rural areas. KRISHI AI addresses this gap with a world-class, multi-agent artificial intelligence platform designed specifically for the Bangladeshi agricultural context."),
    ...spacer(1),
    para("This document presents a complete production-grade architecture — not a prototype — designed to serve millions of farmers simultaneously, operate safely in high-stakes agronomic scenarios, and deliver responses in fluent Bangla and English."),
    ...spacer(1),
    highlightBox(
      "Core Mission: To build a national-scale agricultural intelligence system that is deterministic where it matters (fertilizer dosage, disease treatment), generative where it adds value (explanations, advice), and safe for every farmer in Bangladesh.",
      C.greenLight, C.green
    ),
    ...spacer(1),
    heading2("1.1 The Three Pillars of This Architecture"),
    threeColTable([
      ["Pillar", "Principle", "Implementation"],
      ["Hybrid Intelligence", "Rules + ML + LLM — not pure LLM", "Rule engine for dosage; LLM for explanation"],
      ["Agent Specialization", "Each agent has a strict contract", "LangGraph state machine orchestration"],
      ["Event-Driven Context", "Triggers based on real-world events", "Kafka pipeline for proactive alerts"],
    ]),
    ...spacer(1),
    heading2("1.2 Why This Approach Beats a Pure LLM Chatbot"),
    bullet("LLMs hallucinate fertilizer doses — farmers can destroy crops or poison soil"),
    bullet("LLMs cannot push proactive alerts when a pest outbreak is detected at 3am"),
    bullet("LLMs have no memory of a farmer's specific land, crops, or history"),
    bullet("LLMs cannot integrate live market prices or real-time weather APIs deterministically"),
    bullet("This architecture solves all of the above with agent specialization and strict guardrails"),
    pageBreak()
  ];
}

// ─── System Philosophy ────────────────────────────────────────────
function systemPhilosophy() {
  return [
    heading1("2. System Design Philosophy"),
    para("The KRISHI AI architecture is built on a fundamental insight: the real competitive moat is NOT the language model. It is the structured agricultural intelligence layer, the event-driven alert system, and deep farmer personalization. The LLM is a presentation layer, not the brain."),
    ...spacer(1),
    heading2("2.1 Deterministic vs. Generative Zones"),
    para("A critical architectural decision is clearly separating what must be deterministic (rule-based, verifiable) from what can be generative (LLM-produced explanations). Confusing these two leads to dangerous outcomes in agricultural contexts."),
    ...spacer(1),
    twoColTable([
      ["Zone", "Examples & Rationale"],
      ["DETERMINISTIC (Never use LLM alone)", "Fertilizer dosage per bigha/acre, Pesticide concentration and application rate, Seed rate calculations, Irrigation scheduling rules, Crop stage timelines"],
      ["GENERATIVE (LLM is appropriate)", "Plain-language explanation of a disease, Contextual farming advice, Seasonal planning narratives, Answer summaries for complex Q&A"],
      ["HYBRID (Rule + LLM together)", "Disease diagnosis (rules classify, LLM explains), Market insight (SQL fetches price, LLM adds context), Weather advice (API gets forecast, LLM advises action)"],
    ], [3600, 5760]),
    ...spacer(1),
    heading2("2.2 Agent Contract Model"),
    para("Each agent in the system has a strict, immutable contract defining its inputs, outputs, allowed tools, and failure behavior. No agent is allowed to perform actions outside its contract. This prevents cascading failures and ensures observability."),
    ...spacer(1),
    infoBox("Agent Contract Template", [
      "  Agent Name:      [e.g., Weather Intelligence Agent]",
      "  Input Schema:    [Defined Pydantic model]",
      "  Output Schema:   [Defined Pydantic model]",
      "  Allowed Tools:   [Weather API, Risk Engine, Redis Cache]",
      "  Forbidden:       [Direct DB writes, External LLM calls without validation]",
      "  Timeout:         [3 seconds maximum]",
      "  Fallback:        [Return cached result or safe default message]",
    ], C.blueLight, C.blue),
    ...spacer(1),
    heading2("2.3 Failure Isolation Principles"),
    bullet("Each agent runs in an independent execution context"),
    bullet("A failure in the Vision Agent must not crash the Weather Agent"),
    bullet("Circuit breakers prevent cascading API failures"),
    bullet("Every agent has a defined graceful fallback response"),
    bullet("All failures are logged to Langfuse with full trace context"),
    pageBreak()
  ];
}

// ─── Tech Stack ───────────────────────────────────────────────────
function techStack() {
  return [
    heading1("3. Complete Technology Stack"),
    para("The technology stack is selected based on four criteria: production-readiness, cost efficiency, Bangladesh-relevant constraints (bandwidth limitations, mobile-first users), and the specific demands of a multi-agent agricultural AI system."),
    ...spacer(1),
    heading2("3.1 Core Infrastructure Layer"),
    fourColTable([
      ["Layer", "Technology", "Justification", "Alternative"],
      ["Frontend", "Next.js 14 (App Router)", "SSR for low-bandwidth, PWA support for offline use", "React SPA"],
      ["Backend API", "FastAPI (Python 3.11)", "Async support, Pydantic validation, ML ecosystem", "Django REST"],
      ["Authentication", "Clerk", "SMS OTP for farmers with no email, multi-tenant", "Auth0"],
      ["Primary DB", "Supabase (PostgreSQL)", "Row-level security, real-time subscriptions, vectors", "PlanetScale"],
      ["Object Storage", "Supabase Storage", "Image uploads (crop disease photos), integrated auth", "AWS S3"],
      ["Cache Layer", "Redis 7 (Cluster)", "Sub-millisecond response for weather/prices", "Memcached"],
      ["Message Queue", "Apache Kafka", "Event-driven alerts at 10M+ farmer scale", "RabbitMQ"],
      ["Workflow Engine", "Temporal.io", "Reliable long-running workflows (loan, subsidy)", "Celery"],
    ], [1560, 2100, 3360, 2340]),
    ...spacer(1),
    heading2("3.2 AI and Agent Stack"),
    fourColTable([
      ["Component", "Technology", "Purpose", "Cost Level"],
      ["Orchestration", "LangGraph 0.2+", "State machine for multi-agent coordination", "Free OSS"],
      ["RAG Framework", "LlamaIndex", "40+ agronomy knowledge domains", "Free OSS"],
      ["Vector Database", "Qdrant (self-hosted)", "Semantic search on agronomy knowledge base", "Free OSS"],
      ["LLM Gateway", "OpenRouter", "Unified API for multi-model routing", "Usage-based"],
      ["Primary LLM", "GPT-4o-mini", "Complex reasoning, Bangla generation", "Low cost"],
      ["Edge LLM", "Gemma 3 4B (local)", "Simple classification, cost savings", "Free"],
      ["Vision Model", "Gemini 1.5 Flash", "Crop disease image analysis", "Very low"],
      ["Observability", "Langfuse (self-hosted)", "Traces, cost tracking, eval scores", "Free OSS"],
      ["Embeddings", "text-embedding-3-small", "Vectorizing agronomy knowledge base", "Very low"],
    ], [1800, 2100, 3060, 2400]),
    ...spacer(1),
    heading2("3.3 Infrastructure and DevOps"),
    threeColTable([
      ["Category", "Technology", "Purpose"],
      ["Containerization", "Docker + Docker Compose", "Consistent environments dev to prod"],
      ["Orchestration", "Kubernetes (GKE/EKS)", "Auto-scaling to handle peak harvest season traffic"],
      ["Monitoring", "Prometheus + Grafana", "Infrastructure metrics and alerting"],
      ["CI/CD", "GitHub Actions", "Automated testing and deployment pipeline"],
      ["Secret Management", "HashiCorp Vault", "API keys, DB credentials, encryption keys"],
      ["CDN", "Cloudflare", "Low-latency asset delivery across Bangladesh"],
      ["Load Balancer", "NGINX + Ingress", "Traffic routing and SSL termination"],
    ]),
    pageBreak()
  ];
}

// ─── Agent Architecture ───────────────────────────────────────────
function agentArchitecture() {
  return [
    heading1("4. Agent Architecture — Strict Contract Model"),
    para("The system comprises one Orchestrator Agent and seven Specialized Agents. The Orchestrator is NOT a free-form reasoning agent. It is a deterministic state machine with defined routing logic, implemented using LangGraph's compiled graph structure. This is critical for production reliability."),
    ...spacer(1),
    heading2("4.1 Orchestrator Agent — The Routing Brain"),
    para("The Orchestrator receives all incoming queries, classifies intent, and routes execution to the appropriate specialized agent(s). It never generates agricultural content itself. Its only jobs are: receive, classify, route, validate, and respond."),
    ...spacer(1),
    infoBox("Orchestrator State Machine Flow", [
      "  Step 1: Receive user message (text / image / voice)",
      "  Step 2: Language detection (Bangla vs. English)",
      "  Step 3: Intent classification (10 intent classes — see Section 5)",
      "  Step 4: Context loading (farmer profile from Supabase via SQL Agent)",
      "  Step 5: Route to specialized agent(s) based on decision matrix",
      "  Step 6: Validate agent output against safety rules",
      "  Step 7: Format response in appropriate language",
      "  Step 8: Log full trace to Langfuse, cache if appropriate",
    ], C.greenLight, C.green),
    ...spacer(1),
    heading2("4.2 Specialized Agent Contracts"),
    ...spacer(1),
    heading3("Agent 1: Weather Intelligence Agent"),
    twoColTable([
      ["Property", "Specification"],
      ["Primary Responsibility", "Real-time forecast, seasonal prediction, weather risk scoring"],
      ["Input", "Location (district/upazila), query type (tomorrow / seasonal / flood risk)"],
      ["Output", "Structured forecast JSON + risk score (0-10) + farmer-actionable advice"],
      ["Tools Allowed", "OpenMeteo API, Bangladesh Meteorological Dept API, Redis cache, Risk Engine"],
      ["LLM Usage", "Only for final advice formatting — never for forecast data generation"],
      ["Cache Strategy", "Weather data cached in Redis for 30 minutes per location"],
      ["Timeout / Fallback", "3s timeout; fallback to last cached forecast with staleness warning"],
    ], [2880, 6480]),
    ...spacer(1),
    heading3("Agent 2: Agronomy Knowledge Agent (RAG)"),
    twoColTable([
      ["Property", "Specification"],
      ["Primary Responsibility", "Answer 40+ agricultural domain questions via retrieval-augmented generation"],
      ["Input", "Semantic query, crop type, region, farmer context"],
      ["Output", "Validated agronomic advice with source citations"],
      ["Knowledge Base", "BADC publications, DAE advisories, BRRI rice research, IPM manuals (Bangla + English)"],
      ["Retrieval Strategy", "Hybrid: BM25 keyword + dense vector search via Qdrant"],
      ["Validation Layer", "Output passed through Rule Engine before delivery to prevent dangerous advice"],
      ["Tools Allowed", "Qdrant vector search, BM25 retriever, Rule Engine, GPT-4o-mini"],
    ], [2880, 6480]),
    ...spacer(1),
    heading3("Agent 3: Farmer Context Agent (SQL)"),
    twoColTable([
      ["Property", "Specification"],
      ["Primary Responsibility", "Load and update farmer profile, land data, crop history, preferences"],
      ["Input", "Farmer ID, requested context fields"],
      ["Output", "Structured Pydantic FarmerContext object"],
      ["Tools Allowed", "Supabase PostgreSQL (read/write), Redis session cache"],
      ["Security", "Row-level security enforced at DB level; agent cannot access other farmers' data"],
      ["Used By", "Called by Orchestrator at every query start to provide personalization context"],
    ], [2880, 6480]),
    ...spacer(1),
    heading3("Agent 4: Vision Agent"),
    twoColTable([
      ["Property", "Specification"],
      ["Primary Responsibility", "Analyze crop disease images, livestock health images"],
      ["Input", "Base64-encoded image + crop type metadata"],
      ["Output", "Disease classification + confidence score + treatment recommendations"],
      ["Model", "Gemini 1.5 Flash Vision (cost-efficient) with custom agricultural prompt"],
      ["Validation", "Confidence < 70% triggers human-review flag and disclaimer"],
      ["Storage", "Images stored in Supabase Storage with farmer ID linkage for audit"],
    ], [2880, 6480]),
    ...spacer(1),
    heading3("Agent 5: Market Intelligence Agent"),
    twoColTable([
      ["Property", "Specification"],
      ["Primary Responsibility", "Crop prices, profit estimation, market opportunity alerts"],
      ["Input", "Crop name, district, quantity, date range"],
      ["Output", "Current price + 7-day trend + profit/loss estimate + sell timing advice"],
      ["Data Sources", "DAM (Department of Agricultural Marketing) API, local mandi aggregators, Redis cache"],
      ["LLM Usage", "Only for contextual insight generation on top of deterministic price data"],
      ["Cache Strategy", "Prices cached for 2 hours; spike alerts bypass cache and push immediately"],
    ], [2880, 6480]),
    ...spacer(1),
    heading3("Agent 6: Proactive Notification Agent"),
    twoColTable([
      ["Property", "Specification"],
      ["Primary Responsibility", "Push timely, personalized alerts to farmers without them asking"],
      ["Triggers", "Weather change, pest outbreak detected in region, price spike/drop, crop lifecycle event"],
      ["Pipeline", "Kafka consumer -> Risk Engine -> Farmer Filter (SQL) -> SMS / App Push"],
      ["Personalization", "Alerts sent only to farmers with matching crops and affected districts"],
      ["Channels", "In-app notification, SMS (Twilio/BD local gateway), WhatsApp Business API"],
      ["Rate Limiting", "Maximum 3 alerts per farmer per day to prevent notification fatigue"],
    ], [2880, 6480]),
    ...spacer(1),
    heading3("Agent 7: Action Agent"),
    twoColTable([
      ["Property", "Specification"],
      ["Primary Responsibility", "Handle transactional requests: loan guidance, subsidy applications, equipment booking"],
      ["Input", "Action intent + farmer profile + required documents list"],
      ["Output", "Step-by-step workflow + required form links + nearest office location"],
      ["Workflow Engine", "Temporal.io for reliable multi-step, long-running action workflows"],
      ["External Integrations", "Bangladesh Bank agricultural loan APIs, MoA subsidy portal, local agri-input dealers"],
      ["Human Handoff", "Complex cases escalated to DAE field officer with full context summary"],
    ], [2880, 6480]),
    pageBreak()
  ];
}

// ─── Query Routing ────────────────────────────────────────────────
function queryRouting() {
  return [
    heading1("5. Query Routing and Intent Classification"),
    para("Accurate intent classification is the most critical component of the entire system. A misclassified query that routes a fertilizer question to the general LLM instead of the Rule Engine could result in a farmer applying a dangerous dose. The classification system uses a two-layer approach for maximum accuracy."),
    ...spacer(1),
    heading2("5.1 Intent Classification — 10 Core Classes"),
    fourColTable([
      ["Intent Class", "Example Queries (Bangla)", "Example Queries (English)", "Routing Target"],
      ["WEATHER_REALTIME", "আগামীকাল বৃষ্টি হবে?", "Will it rain tomorrow?", "Weather Agent"],
      ["WEATHER_SEASONAL", "এই বর্ষায় বন্যার ঝুঁকি?", "Flood risk this monsoon?", "Weather + ML Model"],
      ["DISEASE_DIAGNOSIS", "ধানের ব্লাস্ট কিভাবে চিনব?", "How to identify rice blast?", "RAG Agent + Rules"],
      ["PEST_MANAGEMENT", "পোকামাকড় দমনে কী করব?", "How to control stem borer?", "RAG Agent + Rules"],
      ["FERTILIZER_DOSAGE", "১ বিঘায় ইউরিয়া কত?", "Urea dose per bigha?", "Rule Engine ONLY"],
      ["MARKET_PRICE", "ধানের দাম কত আজ?", "What is paddy price today?", "Market Agent + SQL"],
      ["IMAGE_DIAGNOSIS", "(uploads crop photo)", "(uploads crop photo)", "Vision Agent"],
      ["GOVERNMENT_SCHEME", "সার ভর্তুকি কিভাবে পাব?", "How to get fertilizer subsidy?", "Action Agent"],
      ["CROP_ADVISORY", "এখন কী চাষ করা ভালো?", "What crop to plant now?", "Multi-agent Fusion"],
      ["GENERAL_AGRI_QA", "SRI পদ্ধতি কী?", "What is SRI method?", "RAG Agent"],
    ], [1560, 2160, 2160, 3480]),
    ...spacer(1),
    heading2("5.2 Classification Architecture"),
    para("Layer 1 — Fast Filter: A fine-tuned mBERT model (multilingual BERT) running locally on CPU performs initial intent classification in under 50ms. This handles 80% of queries confidently (confidence > 0.90)."),
    ...spacer(1),
    para("Layer 2 — LLM Fallback: For ambiguous queries (confidence between 0.60–0.90), the Orchestrator calls GPT-4o-mini with a structured classification prompt and few-shot Bangla examples. This adds ~300ms latency but ensures accuracy."),
    ...spacer(1),
    para("Layer 3 — Human Review: For confidence below 0.60, the query is flagged for review, a safe generic response is returned, and the case is added to a retraining queue."),
    ...spacer(1),
    heading2("5.3 Multi-Agent Fusion for Complex Queries"),
    para("Approximately 15% of queries require multiple agents to cooperate. The Orchestrator manages this through a parallel execution pattern, where independent agents run simultaneously, and a Fusion step merges their outputs."),
    ...spacer(1),
    infoBox("Example: Crop Advisory Query — 'এখন কী চাষ করব?'", [
      "  Parallel Execution:",
      "    [1] Weather Agent → Current season, upcoming rainfall forecast",
      "    [2] Market Agent  → Highest-value crops in farmer's district this month",
      "    [3] Context Agent → Farmer's land type, irrigation access, past crops",
      "    [4] RAG Agent     → Crop suitability matrix for current conditions",
      "  Fusion Step:",
      "    Orchestrator merges all 4 outputs using a structured prompt",
      "    GPT-4o-mini generates final ranked recommendation in Bangla",
      "    Rule Engine validates no harmful combinations in advice",
    ], C.goldLight, C.gold),
    pageBreak()
  ];
}

// ─── Key Flows ────────────────────────────────────────────────────
function keyFlows() {
  return [
    heading1("6. Critical System Flows"),
    ...spacer(1),
    heading2("6.1 Fertilizer Dosage Flow — Deterministic Engine (CRITICAL)"),
    para("Fertilizer dosage is the highest-risk query type in the system. An incorrect dose can destroy a crop or cause long-term soil damage. This flow NEVER uses an LLM for the calculation itself."),
    ...spacer(1),
    twoColTable([
      ["Step", "Process Detail"],
      ["1. Intent Detection", "Classified as FERTILIZER_DOSAGE with > 0.90 confidence"],
      ["2. Parameter Extraction", "mBERT NER extracts: crop type, land area, unit (bigha/acre/decimal), soil type (if mentioned)"],
      ["3. Rule Engine Lookup", "Deterministic lookup in BADC-approved fertilizer table: crop x soil x season -> N/P/K ratios"],
      ["4. Unit Conversion", "Standardize to kg/decimal then convert to farmer's preferred unit"],
      ["5. Safety Validation", "Check output against maximum safe application limits; flag if exceeded"],
      ["6. LLM Formatting", "GPT-4o-mini formats the validated numbers into clear Bangla instructions ONLY"],
      ["7. Disclaimer Appended", "System appends: 'Please verify with your local DAE officer before application'"],
    ], [2520, 6840]),
    ...spacer(1),
    heading2("6.2 Disease Diagnosis Flow"),
    para("Example Query: 'ধানের ব্লাস্ট রোগ কিভাবে নিয়ন্ত্রণ করব?' (How to control rice blast disease?)"),
    ...spacer(1),
    infoBox("Disease Diagnosis Execution Flow", [
      "  User Query → Orchestrator (intent: DISEASE_DIAGNOSIS)",
      "    ↓",
      "  RAG Agent: Vector search on BRRI + BADC disease database",
      "    → Returns: Top 3 matching documents on rice blast management",
      "    ↓",
      "  Rule Engine: Validates fungicide name, dosage, and application method",
      "    → Checks against Bangladesh-approved pesticide registry",
      "    → Blocks any non-approved or banned substances",
      "    ↓",
      "  LLM (GPT-4o-mini): Simplifies technical content into farmer-friendly Bangla",
      "    → Generates step-by-step treatment instructions",
      "    ↓",
      "  Safety Layer: Appends protective equipment advice and safety warnings",
      "  Final Output: Delivered to farmer in < 2 seconds",
    ], C.redLight, C.red),
    ...spacer(1),
    heading2("6.3 Proactive Alert Flow — The Game Changer"),
    para("This is the most powerful differentiation of the KRISHI AI platform. Rather than waiting for farmers to ask questions, the system proactively monitors events and pushes personalized, actionable alerts."),
    ...spacer(1),
    twoColTable([
      ["Trigger Event", "Alert Logic and Farmer Action"],
      ["Heavy Rain Forecast (> 50mm in 24h)", "Alert farmers with fertilizer recently applied: delay next application. Alert those with standing crops: check drainage."],
      ["High Humidity + Temperature (Fungus Risk)", "Alert rice farmers in affected upazilas: apply preventive fungicide within 48 hours."],
      ["Price Spike > 15% for Stored Crop", "Alert farmers holding that crop: optimal sell window open. Connects to nearest market."],
      ["Pest Outbreak Reported in Neighboring Upazila", "Alert farmers with same crop in adjacent area: begin scouting immediately. IPM protocol attached."],
      ["Crop Lifecycle Event", "Remind farmer that their Boro rice (planted 45 days ago) needs top-dressing urea this week."],
      ["Flood Warning Issued by BMD", "Alert all farmers in affected districts: harvest early if possible, move equipment."],
    ], [3240, 6120]),
    ...spacer(1),
    heading2("6.4 Image-Based Disease Diagnosis Flow"),
    para("A farmer takes a photo of a diseased leaf and uploads it via the app. The Vision Agent processes the image and provides a diagnosis within 3 seconds."),
    ...spacer(1),
    numbered("Image received and compressed client-side (max 800px, JPEG 80%)"),
    numbered("Uploaded to Supabase Storage with farmer ID and timestamp"),
    numbered("Vision Agent calls Gemini 1.5 Flash with structured agricultural prompt"),
    numbered("Model returns: disease name, confidence %, severity level, affected area %"),
    numbered("If confidence > 70%: RAG Agent retrieves treatment protocol"),
    numbered("If confidence 40-70%: Response includes disclaimer and suggests local DAE consultation"),
    numbered("If confidence < 40%: Image flagged for human expert review queue"),
    numbered("Final response delivered in Bangla with disease photo examples for confirmation"),
    pageBreak()
  ];
}

// ─── Database Schema ──────────────────────────────────────────────
function databaseSchema() {
  return [
    heading1("7. Database Architecture"),
    para("The database design supports all 40+ agricultural use cases, full farmer personalization, event-driven alerts, and long-term agronomic data analysis. PostgreSQL via Supabase is used for relational data, with pgvector extension for embedding storage."),
    ...spacer(1),
    heading2("7.1 Core Database Tables"),
    threeColTable([
      ["Table Name", "Key Fields", "Purpose"],
      ["farmers", "id, phone, name, division, district, upazila, preferred_language, created_at", "Core farmer identity and location"],
      ["farmer_lands", "id, farmer_id, area_decimal, soil_type, irrigation_type, gps_lat, gps_lng", "Land parcels with soil and irrigation data"],
      ["crop_records", "id, farmer_id, land_id, crop_name, variety, planted_date, harvest_date, yield_kg", "Crop history per land parcel"],
      ["weather_snapshots", "id, district, upazila, temp_c, humidity, rainfall_mm, forecast_json, recorded_at", "Cached weather data for fast retrieval"],
      ["market_prices", "id, crop_name, district, price_per_kg, market_name, recorded_at", "Daily market price records"],
      ["disease_reports", "id, farmer_id, crop_id, image_url, diagnosis, confidence, treatment_applied, outcome", "Disease diagnosis audit trail"],
      ["alert_history", "id, farmer_id, alert_type, message, channel, sent_at, read_at", "All proactive alerts sent"],
      ["query_logs", "id, farmer_id, intent_class, query_text, agent_used, response_ms, cost_usd, langfuse_trace_id", "Full audit log for every query"],
      ["knowledge_base", "id, title, content, crop_type, category, embedding vector(1536), source_doc, language", "RAG knowledge store with pgvector"],
      ["subsidy_applications", "id, farmer_id, scheme_name, status, submitted_at, documents_json, officer_notes", "Government scheme tracking"],
    ]),
    ...spacer(1),
    heading2("7.2 Memory Architecture"),
    twoColTable([
      ["Memory Type", "Implementation and TTL"],
      ["Session Memory (Short-term)", "Redis: stores last 10 messages of active conversation. TTL: 2 hours. Used for multi-turn context."],
      ["User Profile Memory (Long-term)", "Supabase PostgreSQL: farmer profile, land, crop history. Permanent. Loaded at each session start."],
      ["Weather Cache", "Redis: per-location forecast. TTL: 30 minutes. Prevents excessive API calls."],
      ["Market Price Cache", "Redis: per-crop per-district price. TTL: 2 hours. Updated by background job."],
      ["RAG Embeddings", "Qdrant vector database: persistent, versioned. Updated monthly with new agronomy publications."],
      ["Agent State", "LangGraph in-memory state per request. Not persisted. Cleared after response delivery."],
    ], [3000, 6360]),
    pageBreak()
  ];
}

// ─── Multilingual ─────────────────────────────────────────────────
function multilingualSection() {
  return [
    heading1("8. Multilingual Strategy — Bangladesh-First"),
    para("Bangla is the mother tongue of Bangladesh's 170 million people, and the vast majority of farmers are most comfortable receiving information in Bangla. The multilingual architecture ensures that every feature, from weather alerts to disease diagnosis, is fully operational in Bangla."),
    ...spacer(1),
    heading2("8.1 Language Pipeline"),
    twoColTable([
      ["Stage", "Bangla Handling Strategy"],
      ["Input Detection", "fasttext language detection model identifies Bangla vs. English vs. mixed in < 10ms"],
      ["Bangla NER", "Fine-tuned mBERT model for Bangladeshi agricultural entities: crop names, district names, units (bigha, kani, decimal)"],
      ["Prompt Templates", "All system prompts have Bangla-specific versions with culturally appropriate framing"],
      ["LLM Output", "GPT-4o-mini instructed to respond in formal Bangla with agricultural terminology from BADC glossary"],
      ["Numerics", "Numbers always rendered in Bengali numerals (০১২৩৪৫৬৭৮৯) as per farmer preference settings"],
      ["Voice Output", "Optional TTS using Google Cloud TTS with Bangla (bn-BD) voice for low-literacy farmers"],
      ["Transliteration", "Handles Banglish (Bangla in English letters) with phonetic normalization"],
    ], [2640, 6720]),
    ...spacer(1),
    heading2("8.2 Critical Bangla-Specific Agricultural Terms"),
    para("The knowledge base and prompt templates use standardized Bangla terms for all agricultural concepts to ensure consistency and clarity:"),
    ...spacer(1),
    fourColTable([
      ["English Term", "Bangla Term", "English Term", "Bangla Term"],
      ["Rice blast disease", "ব্লাস্ট রোগ", "Fertilizer", "সার"],
      ["Stem borer pest", "কাণ্ড মাজরা পোকা", "Pesticide", "কীটনাশক"],
      ["IPM (Integrated Pest Mgmt)", "সমন্বিত বালাই ব্যবস্থাপনা", "Irrigation", "সেচ"],
      ["SRI (System of Rice Intensification)", "ধানের নিবিড় চাষ পদ্ধতি", "Compost", "জৈব সার"],
      ["Top dressing (fertilizer)", "উপরি প্রয়োগ", "Crop rotation", "ফসল পরিবর্তন"],
    ], [1800, 2880, 1800, 2880]),
    ...spacer(1),
    heading2("8.3 Fallback and Escalation Messages (Bangla)"),
    infoBox("Standard Bangla Fallback Messages", [
      "  Low confidence:   'আমি সম্পূর্ণ নিশ্চিত নই। অনুগ্রহ করে নিকটস্থ কৃষি কর্মকর্তার সাথে যোগাযোগ করুন।'",
      "  Fertilizer advice: 'এই পরামর্শ প্রয়োগের আগে অনুগ্রহ করে স্থানীয় DAE কর্মকর্তার সাথে যাচাই করুন।'",
      "  Image unclear:    'ছবিটি স্পষ্ট নয়। আরও কাছ থেকে ছবি তুলুন অথবা বিশেষজ্ঞের পরামর্শ নিন।'",
      "  Service error:    'সাময়িক সমস্যা হচ্ছে। কিছুক্ষণ পর আবার চেষ্টা করুন।'",
    ], C.greenLight, C.green),
    pageBreak()
  ];
}

// ─── Safety ───────────────────────────────────────────────────────
function safetySection() {
  return [
    heading1("9. Safety Architecture and Guardrails"),
    para("Agricultural AI carries real-world risk. An incorrect pesticide recommendation can kill a farmer's entire crop. A wrong fertilizer dose can poison soil for years. The KRISHI AI safety architecture treats safety as a non-negotiable system property, not an afterthought."),
    ...spacer(1),
    heading2("9.1 Multi-Layer Safety Stack"),
    numbered("Input Sanitization: Remove prompt injection attempts, detect adversarial inputs"),
    numbered("Intent Firewall: Certain intents (FERTILIZER_DOSAGE, PESTICIDE_DOSAGE) are hard-locked to Rule Engine — LLM cannot override"),
    numbered("Rule Engine Validation: All chemical dosages validated against Bangladesh-approved pesticide registry"),
    numbered("Confidence Gating: Responses below 70% confidence include mandatory disclaimer and escalation prompt"),
    numbered("Output Filtering: Scan final response for banned chemical names, dangerous combinations, and unsafe doses"),
    numbered("Human Escalation: Any query flagged as high-risk is routed to a DAE officer queue within 2 hours"),
    numbered("Audit Trail: Every recommendation stored with full provenance (source document, rule applied, confidence)"),
    ...spacer(1),
    heading2("9.2 Hardcoded Safety Rules (Never Overridable by LLM)"),
    twoColTable([
      ["Rule Category", "Specific Guardrails"],
      ["Pesticide Safety", "Maximum application rates from Bangladesh Pesticide Technical Advisory Committee. Any dose exceeding these is blocked and flagged."],
      ["Banned Substances", "Complete list of Bangladesh-banned pesticides maintained. Any mention triggers immediate block + safe alternative suggestion."],
      ["Fertilizer Limits", "N/P/K maximum safe limits per crop per season from BADC. Excess doses trigger warning and dose correction."],
      ["Drug Interactions", "Pesticide mixing rules: flag incompatible combinations that create toxic compounds."],
      ["Flood Zone Rules", "No fertilizer or pesticide application advice when farmer's district is under flood alert."],
      ["Pregnancy/Child Safety", "When farmer's profile indicates family members, extra safety warnings included for all chemical advice."],
    ], [2880, 6480]),
    ...spacer(1),
    highlightBox(
      "Zero Tolerance Policy: The KRISHI AI system will never recommend a banned pesticide, an unsafe fertilizer dose, or an unapproved treatment protocol — regardless of how the query is phrased, even if a user attempts to bypass restrictions through creative prompting.",
      C.redLight, C.red
    ),
    pageBreak()
  ];
}

// ─── Performance & Scalability ────────────────────────────────────
function performanceSection() {
  return [
    heading1("10. Performance and Scalability Strategy"),
    para("The system must serve 10 million+ farmers simultaneously, with peak loads during planting and harvest seasons. The architecture is designed to handle this load cost-efficiently without degrading response quality."),
    ...spacer(1),
    heading2("10.1 Performance Targets"),
    fourColTable([
      ["Query Type", "P50 Latency Target", "P99 Latency Target", "Cache Strategy"],
      ["Weather (cached)", "< 100ms", "< 300ms", "Redis, 30min TTL"],
      ["Market Price (cached)", "< 100ms", "< 300ms", "Redis, 2hr TTL"],
      ["Simple RAG Q&A", "< 1.5s", "< 3s", "Semantic cache (Qdrant)"],
      ["Fertilizer Dosage", "< 800ms", "< 1.5s", "Rule lookup, no LLM"],
      ["Multi-agent Fusion", "< 3s", "< 6s", "Partial caching"],
      ["Vision Diagnosis", "< 3s", "< 6s", "No cache (unique images)"],
      ["Proactive Alert Push", "< 30s (background)", "< 2min", "Kafka batch processing"],
    ], [2160, 1980, 1980, 3240]),
    ...spacer(1),
    heading2("10.2 Cost Optimization Strategy"),
    para("With 10 million farmers potentially generating multiple queries per day, LLM cost control is critical. The model routing strategy ensures that expensive models are only invoked when genuinely necessary."),
    ...spacer(1),
    twoColTable([
      ["Query Complexity", "Model Used and Cost Estimate"],
      ["Simple intent classification", "Local Gemma 3 4B — $0.00 (on-device or self-hosted)"],
      ["Fertilizer / Weather (deterministic)", "Rule Engine only — $0.00 (no LLM)"],
      ["Standard RAG Q&A", "GPT-4o-mini with 500 token output — ~$0.0002 per query"],
      ["Complex multi-agent advisory", "GPT-4o-mini with 1000 token output — ~$0.0004 per query"],
      ["Vision diagnosis", "Gemini 1.5 Flash — ~$0.0001 per image"],
      ["Monthly cost at 1M queries/day", "~$120-200/day with smart routing (vs. $1,200+/day with GPT-4o everywhere)"],
    ], [3120, 6240]),
    ...spacer(1),
    heading2("10.3 Horizontal Scaling Architecture"),
    bullet("FastAPI backend deployed as stateless pods — autoscales from 3 to 100+ instances on Kubernetes"),
    bullet("LangGraph Orchestrator is stateless per-request — no shared state, fully parallelizable"),
    bullet("Supabase PostgreSQL with connection pooling via PgBouncer — handles 10,000+ concurrent DB connections"),
    bullet("Redis Cluster in 3-node configuration — 99.99% cache availability"),
    bullet("Qdrant deployed with replication factor 2 — no single point of failure on vector search"),
    bullet("Kafka with 12 partitions for alert topic — 12 consumers process alerts in parallel"),
    bullet("Temporal workers for action workflows — scales independently of API layer"),
    pageBreak()
  ];
}

// ─── Observability ────────────────────────────────────────────────
function observabilitySection() {
  return [
    heading1("11. Observability and Continuous Improvement"),
    para("A production agricultural AI system that cannot be monitored cannot be trusted. The observability stack provides full visibility into system behavior, LLM quality, cost, and farmer outcomes."),
    ...spacer(1),
    heading2("11.1 Langfuse Observability — Every LLM Call Traced"),
    twoColTable([
      ["Tracked Metric", "How It Is Used"],
      ["Prompt + Response", "Full audit trail for every LLM call. Enables debugging of incorrect advice."],
      ["Latency per Agent", "Identify bottlenecks. If RAG agent consistently slow, optimize embedding or increase Qdrant replicas."],
      ["Token Cost per Query", "Daily cost dashboard. Alerts if cost exceeds budget threshold."],
      ["Intent Classification Accuracy", "Monitor misclassification rate. Feed errors into weekly retraining cycle."],
      ["Hallucination Detection Score", "Automated evaluation using LLM-as-judge to score factual accuracy of responses."],
      ["Human Feedback Score", "Farmers can rate responses 1-5. Low-rated responses automatically queued for review."],
    ], [3000, 6360]),
    ...spacer(1),
    heading2("11.2 Prometheus + Grafana Dashboards"),
    bullet("Infrastructure Dashboard: CPU, memory, pod count, Kafka lag, Redis hit rate"),
    bullet("Business Dashboard: Queries per second, active users, alert delivery rate, farmer engagement"),
    bullet("AI Quality Dashboard: Intent accuracy %, confidence distribution, escalation rate %"),
    bullet("Cost Dashboard: Daily LLM spend, cost per query by intent class, model usage breakdown"),
    ...spacer(1),
    heading2("11.3 Continuous Improvement Loop"),
    numbered("Daily: Automated evaluation of 5% random sample of responses for quality scoring"),
    numbered("Weekly: Retraining of intent classifier on new misclassified examples"),
    numbered("Monthly: Knowledge base refresh with new BADC/DAE publications in Bangla and English"),
    numbered("Quarterly: Full RAG pipeline evaluation — retrieve 100 test queries and measure precision@k"),
    numbered("Ongoing: Human expert review of all escalated high-risk queries (fertilizer, disease treatment)"),
    pageBreak()
  ];
}

// ─── Implementation Roadmap ───────────────────────────────────────
function roadmapSection() {
  return [
    heading1("12. Implementation Roadmap"),
    para("The platform is built in four phases over 12 months, prioritizing the highest-value and highest-safety features first."),
    ...spacer(1),
    heading2("Phase 1 — Foundation (Months 1-3)"),
    infoBox("Phase 1: Core Infrastructure and MVP", [
      "  Infrastructure: Supabase setup, FastAPI skeleton, Clerk auth, Redis, Docker",
      "  Agents Built:   Farmer Context Agent, Weather Agent (basic), RAG Agent (Bangla knowledge base)",
      "  Safety:         Rule Engine v1 (fertilizer and pesticide tables from BADC)",
      "  Multilingual:   Bangla prompt templates, fasttext language detection",
      "  Target:         5,000 pilot farmers in 3 upazilas. Validate core flows.",
    ], C.blueLight, C.blue),
    ...spacer(1),
    heading2("Phase 2 — Intelligence (Months 4-6)"),
    infoBox("Phase 2: Full Agent Suite and Proactive Alerts", [
      "  Agents Built:   Market Agent, Vision Agent, Notification Agent",
      "  Infrastructure: Kafka setup, Temporal workflows, Qdrant production cluster",
      "  AI Quality:     Intent classifier fine-tuning, Langfuse observability",
      "  Alerts:         Weather, pest, and market alert pipeline live",
      "  Target:         50,000 farmers, 10 districts. Measure alert engagement rate.",
    ], C.greenLight, C.green),
    ...spacer(1),
    heading2("Phase 3 — Scale (Months 7-9)"),
    infoBox("Phase 3: National Scale and Government Integration", [
      "  Infrastructure: Kubernetes autoscaling, multi-region deployment",
      "  Agents Built:   Action Agent (loan, subsidy, booking workflows)",
      "  Integrations:   DAE portal, Bangladesh Bank agri-loan API, MoA subsidy portal",
      "  Performance:    Load testing to 500,000 concurrent users",
      "  Target:         500,000 farmers, all 64 districts.",
    ], C.goldLight, C.gold),
    ...spacer(1),
    heading2("Phase 4 — Intelligence Expansion (Months 10-12)"),
    infoBox("Phase 4: Advanced AI and Ecosystem Expansion", [
      "  AI Features:    Seasonal ML yield prediction, soil health trend analysis",
      "  Voice:          Bangla voice input/output for low-literacy farmers",
      "  Partnerships:   BRRI, BARI, DAE data partnerships for expanded knowledge",
      "  Analytics:      National crop performance dashboard for policymakers",
      "  Target:         5 million farmers. Present to MoA for national adoption.",
    ], C.tealLight, C.teal),
    ...spacer(1),
    heading2("12.1 Success Metrics"),
    twoColTable([
      ["Metric", "Target by Month 12"],
      ["Active Farmers on Platform", "5,000,000+"],
      ["Query Response Time (P95)", "< 3 seconds"],
      ["Intent Classification Accuracy", "> 95%"],
      ["Farmer Satisfaction Score (1-5)", "> 4.2 average"],
      ["Proactive Alert Engagement Rate", "> 60% open rate"],
      ["Cost per Query", "< $0.001 USD"],
      ["System Uptime", "> 99.9%"],
      ["Incorrect Fertilizer Advice Incidents", "Zero (hard rule: no LLM for dosage)"],
    ], [3600, 5760]),
    pageBreak()
  ];
}

// ─── Final Architecture Summary ────────────────────────────────────
function finalArchitecture() {
  return [
    heading1("13. Final Architecture Diagram — System Overview"),
    para("The following table provides a complete, layered view of the entire KRISHI AI system architecture, from the farmer's device to the deepest data layer."),
    ...spacer(1),
    twoColTable([
      ["System Layer", "Components and Responsibilities"],
      ["Layer 1: User Interface", "Next.js PWA (web + mobile), SMS interface via Twilio, WhatsApp Business API, Voice (future). Fully responsive, works on 2G connections."],
      ["Layer 2: API Gateway", "FastAPI backend with JWT validation via Clerk. Rate limiting (100 req/min per user). Request logging and Langfuse trace injection."],
      ["Layer 3: Orchestration", "LangGraph state machine. Intent classification (mBERT + GPT-4o-mini). Context loading (Farmer Context Agent). Routing to specialist agents."],
      ["Layer 4: Specialist Agents", "Weather Agent, RAG Agent, Market Agent, Vision Agent, Notification Agent, Action Agent — each with strict input/output contracts."],
      ["Layer 5: Intelligence Layer", "Rule Engine (fertilizer/pesticide tables), RAG retrieval (Qdrant), ML models (yield prediction), Safety validator."],
      ["Layer 6: Event System", "Apache Kafka for event streaming. Temporal for long-running workflows. Proactive alert pipeline with farmer targeting."],
      ["Layer 7: Data Layer", "Supabase PostgreSQL (primary data), Qdrant (vectors), Redis Cluster (cache), Supabase Storage (images)."],
      ["Layer 8: External APIs", "OpenMeteo / BMD (weather), DAM (market prices), DAE portal (subsidies), Bangladesh Bank (loans), OpenRouter (LLM gateway)."],
      ["Layer 9: Observability", "Langfuse (LLM traces), Prometheus (metrics), Grafana (dashboards), Sentry (error tracking), Cost monitoring."],
    ], [2880, 6480]),
    ...spacer(1),
    highlightBox(
      "Architectural Truth: The real competitive moat of KRISHI AI is NOT the language model. It is the structured agricultural intelligence layer, the deterministic rule engine, the event-driven alert system, the Bangla-first design, and deep farmer personalization. The LLM is a presentation layer. The intelligence is in the architecture.",
      C.greenLight, C.green
    ),
    ...spacer(1),
    heading2("13.1 What Makes This World-Class"),
    twoColTable([
      ["Property", "How This Architecture Achieves It"],
      ["Deterministic Safety", "Rule Engine hard-codes all dosages. LLM cannot override. Zero tolerance for hallucinated chemical advice."],
      ["Scale to Millions", "Stateless agents, Kubernetes autoscaling, Redis caching, Kafka event streaming — designed for 10M+ concurrent users."],
      ["Cost Efficiency", "Model routing uses free local models for simple tasks. LLM only invoked when necessary. < $0.001 per query."],
      ["Bangla-First Design", "Every feature — alerts, diagnosis, advice — delivered in fluent, culturally appropriate Bangla."],
      ["Proactive Intelligence", "System monitors weather, pests, and prices and alerts farmers before they even know to ask."],
      ["Full Observability", "Every LLM call traced in Langfuse. Every response auditable. Continuous quality improvement loop."],
      ["Farmer Personalization", "Every response informed by farmer's specific crops, land type, location, and history — not generic advice."],
      ["Government Integration", "Action Agent connects farmers directly to subsidies, loans, and DAE extension services."],
    ], [3000, 6360]),
  ];
}

// ─── ASSEMBLE DOCUMENT ────────────────────────────────────────────
const allContent = [
  ...coverPage(),
  ...executiveSummary(),
  ...systemPhilosophy(),
  ...techStack(),
  ...agentArchitecture(),
  ...queryRouting(),
  ...keyFlows(),
  ...databaseSchema(),
  ...multilingualSection(),
  ...safetySection(),
  ...performanceSection(),
  ...observabilitySection(),
  ...roadmapSection(),
  ...finalArchitecture(),
];

const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } } },
      ]},
      { reference: "numbers", levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
      ]},
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: C.green },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: C.teal },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial", color: C.subhead },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1080, bottom: 1440, left: 1080 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.green, space: 4 } },
          spacing: { after: 60 },
          children: [
            new TextRun({ text: "KRISHI AI — National Agricultural Intelligence System for Bangladesh", font: "Arial", size: 18, color: C.gray }),
            new TextRun({ text: "  |  CONFIDENTIAL  |  2025", font: "Arial", size: 18, color: C.gray, bold: true }),
          ]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.green, space: 4 } },
          spacing: { before: 60 },
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            new TextRun({ text: "Production-Grade Multi-Agent Architecture Blueprint", font: "Arial", size: 18, color: C.gray }),
            new TextRun({ text: "\tPage ", font: "Arial", size: 18, color: C.gray }),
            new PageNumber(),
          ]
        })]
      })
    },
    children: allContent
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/home/claude/krishi_ai_bangladesh.docx', buffer);
  console.log('Document created successfully!');
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
