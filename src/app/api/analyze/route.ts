import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildAnalysisPrompt, getSystemPrompt } from "@/lib/prompts";
import { parseInputText } from "@/lib/parseInput";
import type { FeedbackItem, ProcessedItem, AnalysisResult, AggregationResult, FrictionType, RiskLevel } from "@/lib/schema";

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "",
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
});

function isValidFrictionType(value: string): value is FrictionType {
  const validTypes = [
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
  return validTypes.includes(value);
}

function isValidRiskLevel(value: string): value is RiskLevel {
  return ["low", "medium", "high"].includes(value);
}

function parseAndValidateItem(raw: unknown, index: number): ProcessedItem {
  const item = raw as Partial<FeedbackItem>;
  
  const frictionTypeRaw = item?.friction_type || "";
  const churnRiskRaw = item?.churn_risk || "";
  const chargebackRiskRaw = item?.chargeback_risk || "";
  
  const friction_type: FrictionType = isValidFrictionType(frictionTypeRaw) ? frictionTypeRaw : "other";
  const churn_risk: RiskLevel = isValidRiskLevel(churnRiskRaw) ? churnRiskRaw : "low";
  const chargeback_risk: RiskLevel = isValidRiskLevel(chargebackRiskRaw) ? chargebackRiskRaw : "low";
  
  const sentiment_score = typeof item?.sentiment_score === "number" 
    ? Math.max(-1, Math.min(1, item.sentiment_score)) 
    : 0;
  const payment_issue = Boolean(item?.payment_issue);
  const confidence_score = typeof item?.confidence_score === "number" 
    ? Math.max(0, Math.min(1, item.confidence_score)) 
    : 0;
  
  const requires_human_review = 
    confidence_score < 0.75 ||
    (payment_issue && sentiment_score <= -0.4) ||
    chargeback_risk === "medium" ||
    chargeback_risk === "high";

  let human_review_reason: string | null = null;
  if (confidence_score < 0.75) {
    human_review_reason = "Low confidence score";
  } else if (payment_issue && sentiment_score <= -0.4) {
    human_review_reason = "Payment issue with negative sentiment";
  } else if (chargeback_risk === "medium" || chargeback_risk === "high") {
    human_review_reason = `Chargeback risk: ${chargeback_risk}`;
  }

  return {
    summary: item?.summary || "Unable to analyze",
    friction_type,
    payment_issue,
    chargeback_risk,
    sentiment_score,
    churn_risk,
    confidence_score,
    key_evidence: Array.isArray(item?.key_evidence) ? item.key_evidence : [],
    recommended_action: item?.recommended_action || "No action recommended",
    requires_human_review,
    human_review_reason,
  };
}

function aggregateResults(items: ProcessedItem[]): AggregationResult {
  const frictionBreakdown: Record<FrictionType, number> = {
    checkout_confusion: 0,
    payment_decline: 0,
    refund_dispute: 0,
    shipping_delay: 0,
    inventory_outage: 0,
    app_bug: 0,
    pricing_confusion: 0,
    support_experience: 0,
    other: 0,
  };

  let highChurnCount = 0;
  let paymentFlagsCount = 0;
  let humanReviewCount = 0;

  for (const item of items) {
    frictionBreakdown[item.friction_type]++;
    
    if (item.churn_risk === "high") {
      highChurnCount++;
    }
    
    if (item.payment_issue) {
      paymentFlagsCount++;
    }
    
    if (item.requires_human_review) {
      humanReviewCount++;
    }
  }

  const totalItems = items.length;
  
  const topIssue = (Object.entries(frictionBreakdown) as [FrictionType, number][])
    .sort(([, a], [, b]) => b - a)[0]?.[0] || "other";

  return {
    topIssue,
    highChurnPercent: totalItems > 0 ? Math.round((highChurnCount / totalItems) * 100) : 0,
    paymentFlagsCount,
    humanReviewPercent: totalItems > 0 ? Math.round((humanReviewCount / totalItems) * 100) : 0,
    frictionBreakdown,
    totalItems,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { feedbackText } = body;

    if (!feedbackText || typeof feedbackText !== "string") {
      return NextResponse.json(
        { error: "feedbackText is required" },
        { status: 400 }
      );
    }

    const feedbackItems = parseInputText(feedbackText);
    const formattedText = feedbackItems.join("\n\n---\n\n");

    const prompt = buildAnalysisPrompt(formattedText);
    const systemPrompt = getSystemPrompt();

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("Empty response from DeepSeek");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      const processedItem: ProcessedItem = {
        summary: "Failed to parse model response",
        friction_type: "other",
        payment_issue: false,
        chargeback_risk: "low",
        sentiment_score: 0,
        churn_risk: "low",
        confidence_score: 0,
        key_evidence: [],
        recommended_action: "Retry analysis",
        requires_human_review: true,
        human_review_reason: "Invalid JSON response",
      };
      
      return NextResponse.json({
        items: [processedItem],
        aggregation: aggregateResults([processedItem]),
      });
    }

    let items: unknown[] = [];
    if (Array.isArray(parsed)) {
      items = parsed;
    } else if (parsed && typeof parsed === "object" && "items" in parsed && Array.isArray((parsed as Record<string, unknown>).items)) {
      items = (parsed as Record<string, unknown>).items as unknown[];
    } else {
      items = [parsed];
    }

    const processedItems = items.map((raw, index) => parseAndValidateItem(raw, index));
    const aggregation = aggregateResults(processedItems);

    const result: AnalysisResult = {
      items: processedItems,
      aggregation,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    
    const errorItem: ProcessedItem = {
      summary: "Analysis failed",
      friction_type: "other",
      payment_issue: false,
      chargeback_risk: "low",
      sentiment_score: 0,
      churn_risk: "low",
      confidence_score: 0,
      key_evidence: [],
      recommended_action: "Retry analysis",
      requires_human_review: true,
      human_review_reason: error instanceof Error ? error.message : "Unknown error",
    };

    return NextResponse.json({
      items: [errorItem],
      aggregation: aggregateResults([errorItem]),
    });
  }
}
