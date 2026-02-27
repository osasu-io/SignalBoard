# SignalBoard
A lightweight feedback triage tool that turns messy seller feedback into structured insights and flags high-risk issues for review.


Built as a minimal proof-of-concept demonstrating structured AI-assisted decision support tool for commerce platforms and feedback triage with human-in-the-loop safeguards. 
---

## Why This Exists

Sellers receive feedback everywhere:

- Reviews  
- Support tickets  
- Refund notes  

The problem isn’t reading feedback.  
It’s knowing what matters.

SignalBoard extracts structured friction signals from unstructured text, scores confidence, and routes uncertain or high-risk cases to human review.

It separates noise from operational risk.

---

## What It Does

1. Accepts pasted feedback (reviews, tickets, refund notes)
2. Uses DeepSeek (OpenAI-compatible API) to extract structured signals
3. Applies deterministic review rules locally
4. Aggregates results into a visual summary:
   - Top issue
   - High churn risk percentage
   - Payment-related flags
   - Human review required percentage
5. Displays detailed per-item insights with confidence scoring

---

## System Design

### AI Layer
- Extracts structured JSON signals from messy text
- Returns:
  - `friction_type`
  - `sentiment_score`
  - `churn_risk`
  - `payment_issue`
  - `chargeback_risk`
  - `confidence_score`

### Deterministic Rules Layer
After model output, the system:

- Flags low-confidence outputs
- Escalates payment-related negative sentiment
- Routes medium/high chargeback risk
- Handles malformed responses safely

The model assists.  
The system decides.

---

## Trust & Safety Considerations

- LLM outputs are probabilistic.
- Confidence scoring is required.
- Payment-related issues are treated conservatively.
- Low-confidence predictions trigger human review.
- The UI never crashes on malformed model output.

This design assumes AI is an assistant, not an authority.

---

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS (light/dark mode)
- DeepSeek API (OpenAI-compatible)
- Vercel (deployment)

## Deployment

Deployed on Vercel using a server-side API route to protect API keys.

Environment variables are configured in the Vercel dashboard.

---

## Product Tradeoffs

- Batch processing vs real-time streaming
- False positives vs false negatives in payment flagging
- Strict JSON enforcement vs model flexibility
- Automation vs human oversight

---

## Future Directions (Not Included in MVP)

The current version is intentionally constrained to a single-page proof-of-concept demonstrating core signal extraction and triage logic.

- Trend detection over time
- Seller dashboard mode
- Integration with ticketing systems
- Risk prioritization scoring
- Model comparison or ensemble scoring

---

## Why This Matters

Commerce platforms operate at scale.

Surfacing the right signals early helps:

- Reduce churn
- Prevent chargebacks
- Improve checkout experience
- Protect seller trust

This project demonstrates AI-native product thinking:

- Structured outputs
- Guardrails around model uncertainty
- Human-in-the-loop design
- Clear separation between AI extraction and business logic