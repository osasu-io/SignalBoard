import type { FrictionType } from "./schema";

const FRICTION_TYPES: FrictionType[] = [
  "checkout_confusion",
  "payment_decline",
  "refund_dispute",
  "shipping_delay",
  "inventory_outage",
  "app_bug",
  "pricing_confusion",
  "support_experience",
  "other",
];

export function buildAnalysisPrompt(feedbackText: string): string {
  return `You are a feedback analysis assistant. Analyze the following feedback items and extract structured information.

For each feedback item, respond with a JSON object containing:
{
  "summary": "Brief 1-2 sentence summary of the feedback",
  "friction_type": One of: ${FRICTION_TYPES.join(" | ")},
  "payment_issue": true if the feedback mentions payment problems, false otherwise,
  "chargeback_risk": "low" | "medium" | "high" - assess chargeback risk based on sentiment and issue type,
  "sentiment_score": A number from -1 (very negative) to 1 (very positive),
  "churn_risk": "low" | "medium" | "high" - likelihood customer will stop using the service,
  "confidence_score": A number from 0 to 1 indicating your confidence in this analysis,
  "key_evidence": Array of short quotes/snippets from the feedback that support your analysis,
  "recommended_action": Brief recommendation for how to address this feedback
}

Respond with a JSON array of objects, one for each feedback item. Ensure ALL fields are present in each object.

Feedback to analyze:
${feedbackText}`;
}

export function getSystemPrompt(): string {
  return "You are a feedback analysis assistant that outputs valid JSON only.";
}
