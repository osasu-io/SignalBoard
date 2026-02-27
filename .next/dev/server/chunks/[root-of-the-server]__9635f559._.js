module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/prompts.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildAnalysisPrompt",
    ()=>buildAnalysisPrompt,
    "getSystemPrompt",
    ()=>getSystemPrompt
]);
const FRICTION_TYPES = [
    "checkout_confusion",
    "payment_decline",
    "refund_dispute",
    "shipping_delay",
    "inventory_outage",
    "app_bug",
    "pricing_confusion",
    "support_experience",
    "other"
];
function buildAnalysisPrompt(feedbackText) {
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
function getSystemPrompt() {
    return "You are a feedback analysis assistant that outputs valid JSON only.";
}
}),
"[project]/src/lib/parseInput.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseInputText",
    ()=>parseInputText
]);
function parseInputText(text) {
    const lines = text.split("\n").map((line)=>line.trim()).filter((line)=>line.length > 0);
    if (lines.length === 0) {
        return [
            text.trim()
        ].filter(Boolean);
    }
    return lines;
}
}),
"[project]/src/app/api/analyze/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prompts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prompts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$parseInput$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/parseInput.ts [app-route] (ecmascript)");
;
;
;
const API_KEY = process.env.DEEPSEEK_API_KEY;
const BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
function isValidFrictionType(value) {
    const validTypes = [
        "checkout_confusion",
        "payment_decline",
        "refund_dispute",
        "shipping_delay",
        "inventory_outage",
        "app_bug",
        "pricing_confusion",
        "support_experience",
        "other"
    ];
    return validTypes.includes(value);
}
function isValidRiskLevel(value) {
    return [
        "low",
        "medium",
        "high"
    ].includes(value);
}
function parseAndValidateItem(raw, index) {
    const item = raw;
    const frictionTypeRaw = item?.friction_type || "";
    const churnRiskRaw = item?.churn_risk || "";
    const chargebackRiskRaw = item?.chargeback_risk || "";
    const friction_type = isValidFrictionType(frictionTypeRaw) ? frictionTypeRaw : "other";
    const churn_risk = isValidRiskLevel(churnRiskRaw) ? churnRiskRaw : "low";
    const chargeback_risk = isValidRiskLevel(chargebackRiskRaw) ? chargebackRiskRaw : "low";
    const sentiment_score = typeof item?.sentiment_score === "number" ? Math.max(-1, Math.min(1, item.sentiment_score)) : 0;
    const payment_issue = Boolean(item?.payment_issue);
    const confidence_score = typeof item?.confidence_score === "number" ? Math.max(0, Math.min(1, item.confidence_score)) : 0;
    const requires_human_review = confidence_score < 0.75 || payment_issue && sentiment_score <= -0.4 || chargeback_risk === "medium" || chargeback_risk === "high";
    let human_review_reason = null;
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
        human_review_reason
    };
}
function aggregateResults(items) {
    const frictionBreakdown = {
        checkout_confusion: 0,
        payment_decline: 0,
        refund_dispute: 0,
        shipping_delay: 0,
        inventory_outage: 0,
        app_bug: 0,
        pricing_confusion: 0,
        support_experience: 0,
        other: 0
    };
    let highChurnCount = 0;
    let paymentFlagsCount = 0;
    let humanReviewCount = 0;
    for (const item of items){
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
    const topIssue = Object.entries(frictionBreakdown).sort(([, a], [, b])=>b - a)[0]?.[0] || "other";
    return {
        topIssue,
        highChurnPercent: totalItems > 0 ? Math.round(highChurnCount / totalItems * 100) : 0,
        paymentFlagsCount,
        humanReviewPercent: totalItems > 0 ? Math.round(humanReviewCount / totalItems * 100) : 0,
        frictionBreakdown,
        totalItems
    };
}
async function POST(request) {
    try {
        const body = await request.json();
        const { feedbackText } = body;
        if (!feedbackText || typeof feedbackText !== "string") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "feedbackText is required"
            }, {
                status: 400
            });
        }
        const feedbackItems = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$parseInput$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseInputText"])(feedbackText);
        const formattedText = feedbackItems.join("\n\n---\n\n");
        const prompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prompts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildAnalysisPrompt"])(formattedText);
        const systemPrompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prompts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSystemPrompt"])();
        if (!API_KEY) {
            throw new Error("DEEPSEEK_API_KEY is not set");
        }
        console.log("[DEBUG] Calling DeepSeek API with key length:", API_KEY.length);
        const response = await fetch(`${BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                response_format: {
                    type: "json_object"
                },
                temperature: 0.3
            })
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error("[ERROR] DeepSeek API error:", response.status, errorText);
            throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
        }
        const completion = await response.json();
        const responseText = completion.choices?.[0]?.message?.content;
        if (!responseText) {
            throw new Error("Empty response from DeepSeek");
        }
        let parsed;
        try {
            parsed = JSON.parse(responseText);
        } catch  {
            const processedItem = {
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
                human_review_reason: "Invalid JSON response"
            };
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                items: [
                    processedItem
                ],
                aggregation: aggregateResults([
                    processedItem
                ])
            });
        }
        let items = [];
        if (Array.isArray(parsed)) {
            items = parsed;
        } else if (parsed && typeof parsed === "object" && "items" in parsed && Array.isArray(parsed.items)) {
            items = parsed.items;
        } else {
            items = [
                parsed
            ];
        }
        const processedItems = items.map((raw, index)=>parseAndValidateItem(raw, index));
        const aggregation = aggregateResults(processedItems);
        const result = {
            items: processedItems,
            aggregation
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result);
    } catch (error) {
        console.error("[ERROR] Analysis error:", error);
        if (error instanceof Error) {
            console.error("[ERROR] Message:", error.message);
        }
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const errorItem = {
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
            human_review_reason: errorMessage
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            items: [
                errorItem
            ],
            aggregation: aggregateResults([
                errorItem
            ]),
            error: errorMessage
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__9635f559._.js.map