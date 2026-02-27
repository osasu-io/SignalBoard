export type FrictionType =
  | "checkout_confusion"
  | "payment_decline"
  | "refund_dispute"
  | "shipping_delay"
  | "inventory_outage"
  | "app_bug"
  | "pricing_confusion"
  | "support_experience"
  | "other";

export type RiskLevel = "low" | "medium" | "high";

export interface FeedbackItem {
  summary: string;
  friction_type: FrictionType;
  payment_issue: boolean;
  chargeback_risk: RiskLevel;
  sentiment_score: number;
  churn_risk: RiskLevel;
  confidence_score: number;
  key_evidence: string[];
  recommended_action: string;
}

export interface ProcessedItem extends FeedbackItem {
  requires_human_review: boolean;
  human_review_reason: string | null;
}

export interface AggregationResult {
  topIssue: FrictionType;
  highChurnPercent: number;
  paymentFlagsCount: number;
  humanReviewPercent: number;
  frictionBreakdown: Record<FrictionType, number>;
  totalItems: number;
}

export interface AnalysisResult {
  items: ProcessedItem[];
  aggregation: AggregationResult;
}
