# OpenCode.md

## 0) One-line goal
Build a feedback triage tool: paste messy seller feedback → extract structured issues + confidence → apply human-review rules → show a clean visual summary + table.

---

## 1) Hard constraints (non-negotiable)
- Must ship a live demo before Feb 27.
- Must deploy with secrets kept server-side (no API keys in client code).
- Must be stable: no UI crashes from bad model output.
- Must keep scope tight: single-page app + single API endpoint.

---

## 2) Required technologies (MUST use)
### Core app + UI
- Next.js (App Router)
- TypeScript
- Tailwind CSS

### AI provider
- DeepSeek API (OpenAI-compatible)

### Deployment
- Vercel

### Optional (only if time permits)
- Zod for schema validation (recommended)
- Lucide icons

---

## 3) Official documentation sources (use these first)
### Next.js
- LLM/full docs text: https://nextjs.org/docs/llms-full.txt
- Main docs: https://nextjs.org/docs

### Tailwind CSS
- LLM docs text: https://tailwindcss.com/docs/llms-full.txt
- Main docs: https://tailwindcss.com/docs

### Vercel (deploy + env vars)
- Docs: https://vercel.com/docs

### DeepSeek API
- Docs: https://api-docs.deepseek.com
- JSON Mode guide: https://api-docs.deepseek.com/guides/json_mode

### OpenAI-compatible SDK (if used)
- OpenAI Node SDK: https://github.com/openai/openai-node

---

## 4) Product requirements (what the demo MUST do)
### Input
- Dropdown: Reviews | Support Tickets | Refund Notes
- Textarea for pasted feedback
- Button: "Use Sample Data" (one-click demo)
- Button: "Analyze"

### Output (visual summary)
- Summary cards:
  - Top Issue
  - % High Churn Risk
  - Payment Flags count
  - % Human Review Needed
- Friction breakdown bars (simple div-based bar chart)
- Detailed table:
  - Issue/friction type
  - Sentiment
  - Churn risk
  - Confidence score
  - Human review status + reason

### UX states
- Loading state during analysis
- Friendly error state (never crash)
- Empty state (prompt user to paste or use sample data)
- Light + Dark mode toggle

---

## 5) Non-goals (do NOT build)
- No authentication
- No database
- No user accounts
- No file uploads
- No multi-page navigation
- No real business integrations beyond DeepSeek

---

## 6) Layout and style rules
### Layout
- Desktop: 2-column layout
  - Left panel: input controls
  - Right panel: insights summary + charts + table
- Mobile: stacked layout

### Visual style (match reference aesthetics)
- Rounded, modern cards (rounded-xl / rounded-2xl)
- Soft shadows, subtle borders
- Calm typography, lots of whitespace
- Light and dark themes
- Minimal colors; use color mainly for status badges (risk/review)

---

## 7) Data contract: model output schema (per item)
Model must return JSON ONLY, matching this schema:

{
  "summary": "string",
  "friction_type": "checkout_confusion | payment_decline | refund_dispute | shipping_delay | inventory_outage | app_bug | pricing_confusion | support_experience | other",
  "payment_issue": boolean,
  "chargeback_risk": "low | medium | high",
  "sentiment_score": number,  // -1..1
  "churn_risk": "low | medium | high",
  "confidence_score": number, // 0..1
  "key_evidence": string[],   // short quotes/snippets
  "recommended_action": "string"
}

### Parsing rule
If JSON is invalid OR required fields are missing:
- Set `requires_human_review = true`
- Provide a human_review_reason ("Invalid JSON" / "Missing fields")
- Do not crash the UI

---

## 8) Deterministic human-review rules (apply AFTER model output)
The app computes these fields locally (do not rely on model for final routing):
- requires_human_review: boolean
- human_review_reason: string

Set requires_human_review = true if:
- confidence_score < 0.75
- payment_issue is true AND sentiment_score <= -0.4
- chargeback_risk is "medium" or "high"
- any required field is missing or invalid

---

## 9) DeepSeek integration rules (server-side only)
- API calls must happen in: app/api/analyze/route.ts
- Never call DeepSeek from the browser.
- Use JSON mode if supported:
  - response_format: { "type": "json_object" }
  - prompt must include the word "json"
- Timeouts + safe fallback required.

ENV VARS:
- DEEPSEEK_API_KEY=api key here
- Optional: DEEPSEEK_BASE_URL=https://api.deepseek.com (or provider url if different)

---

## 10) Repository structure (MUST follow)
Minimal structure:

app/
  page.tsx                      // UI
  api/
    analyze/
      route.ts                  // DeepSeek call + validation + rules + aggregation
lib/
  parseInput.ts                 // split pasted text into items
  reviewRules.ts                // deterministic review logic
  aggregate.ts                  // summary metrics + counts
  prompts.ts                    // prompt strings/templates
  schema.ts                     // shared types (and Zod schemas if used)
public/
OpenCode.md
README.md
.env.example

---

## 11) Prompting workflow (Research → Planning → Implementation)
### Research prompts (no code)
- Confirm stack decisions
- Confirm DeepSeek request/response format
- Identify top demo-breaking risks and mitigations

### Planning prompts (no code)
- Produce a 10-step build plan
- Include acceptance criteria per step
- Lock file paths and data contracts

### Implementation prompts (code in small slices)
Rules:
- Implement one step at a time
- Only edit specified files
- Provide run/test instructions after each step
- No refactors unless explicitly requested

---

## 12) Definition of done (before deploy)
- "Use Sample Data" produces valid results in 1 click
- Visual summary cards update correctly
- Friction breakdown bars render from aggregated counts
- Table shows review flags + reasons
- Light/dark mode works
- No secrets committed
- Deployed on Vercel with env vars set
- README includes: what it is, how it works, trust & safety, tradeoffs, run locally
---

# 13) Strict MVP Implementation Plan (Resume-Safe)

This project must be self-recoverable from the repository alone.

If resuming after interruption:

1. Read this file (OpenCode.md).
2. Scan the repository structure.
3. Compare implemented files against the steps below.
4. Identify the highest fully completed step.
5. Resume from the next incomplete step.
6. Do NOT re-architect completed steps unless broken.
7. Maintain all hard constraints.

This is a strict single-page MVP. No scope expansion.

---

## Step 1 — Project Setup

Goal:
Initialize environment and structure.

Must Exist:
- Next.js (App Router)
- TypeScript
- Tailwind configured
- Dark mode via `class`
- Folder structure:
  - src/app
  - src/app/api/analyze
  - src/lib

Done When:
- `npm run dev` works
- Dark mode toggle switches `html` class

---

## Step 2 — Layout Skeleton

Goal:
Create 2-column layout structure.

Must Include:
- Desktop: 2 columns (Input left, Insights right)
- Mobile: stacked
- Header with project name + dark mode toggle
- Placeholder InputPanel
- Placeholder InsightsPanel

Done When:
- Layout renders cleanly
- Dark mode styles apply
- No runtime errors

---

## Step 3 — Input Panel

Goal:
Replace InputPanel placeholder with working UI.

Must Include:
- Dropdown:
  - Reviews
  - Support Tickets
  - Refund Notes
- Textarea
- "Use Sample Data" button
- "Analyze" button
- Local loading state (frontend only)

Must NOT:
- Call API yet
- Modify InsightsPanel

Done When:
- Sample button fills textarea
- Analyze button toggles loading state

---

## Step 4 — DeepSeek API Route

File:
`src/app/api/analyze/route.ts`

Goal:
Call DeepSeek and return structured JSON.

Must Include:
- deepseek-chat
- JSON mode
- try/catch around JSON.parse
- Safe fallback on failure
- Server-side only (never client)

Response Format (array of items):

{
  friction_type: string,
  sentiment_score: number,
  churn_risk: "low" | "medium" | "high",
  payment_issue: boolean,
  confidence_score: number
}

Done When:
- Hardcoded input returns valid structured JSON
- Invalid responses do not crash server

---

## Step 5 — Manual Validation + Review Rules

Files:
- lib/schema.ts
- lib/reviewRules.ts

Goal:
Apply deterministic human-review logic.

Rules:
Set `requires_human_review = true` if:
- confidence_score < 0.75
- payment_issue is true AND sentiment_score <= -0.4
- chargeback_risk is "medium" or "high"
- Any required field missing or invalid

Add:
- human_review_reason

Done When:
- Missing fields never crash app
- Review flags applied deterministically

---

## Step 6 — Aggregation Logic

File:
`lib/aggregate.ts`

Goal:
Generate summary metrics.

Compute:
- Top friction type
- % high churn
- Payment flags count
- % human review required

Done When:
- Aggregated metrics match raw data accurately

---

## Step 7 — Insights Panel

Goal:
Replace placeholder with visual summary.

Must Include:
- 4 summary cards:
  - Top Issue
  - % High Churn Risk
  - Payment Flags
  - % Human Review Needed
- Subtle left accent bar per card
- Friction breakdown horizontal bars (div width %)

Must NOT:
- Add sorting
- Add animation
- Add new features

Done When:
- Cards update dynamically
- Bars render from aggregate data
- No visual crashes in dark mode

---

## Step 8 — Table + Deploy

Goal:
Render structured results and deploy live.

Must Include:
- Clean table
- Status badges (green/yellow/red)
- human_review_reason column

Deployment:
- Vercel
- Environment variables configured
- No secrets committed

README must include:
- Local run instructions
- Environment setup
- Brief architecture explanation

Done When:
- "Use Sample Data" works in 1 click on live site
- No console errors
- Definition of Done checklist satisfied

---

## Final Definition of Done

The MVP is complete when:

1. "Use Sample Data" produces results in 1 click
2. Summary cards update correctly
3. Friction bars render from aggregated data
4. Table shows review flags + reasons
5. Light/dark mode works
6. No API keys exposed
7. Deployed on Vercel
8. README documents setup and tradeoffs