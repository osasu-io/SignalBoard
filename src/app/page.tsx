"use client";

import { useState, useEffect } from "react";
import type { ProcessedItem, AnalysisResult } from "@/lib/schema";

const SAMPLE_DATA: Record<string, string> = {
  reviews: `The checkout process is so confusing. I almost bought the wrong item.
Support was useless. waited 3 days for a response.
Refund took forever, 2 weeks and still no money back.
App keeps crashing when I try to view my order history.
Shipping was fast but the package arrived damaged.
Great product but way too expensive for what you get.
The discount code didn't work at checkout, very frustrating.
Order arrived wrong item, customer service was rude about it.`,
  tickets: `Customer report: Unable to complete purchase - payment declined repeatedly.
Ticket #1234: User requesting refund for order #98765 - product defective.
Urgent: Chargeback initiated - customer disputes transaction.
Feature request: Add PayPal support to checkout.
Bug report: App crashes on iOS 17 when scanning barcode.
Shipping inquiry: Where is order #45678? ETA requested.
Complaint: Wrong item shipped, customer demands immediate replacement.
Feedback: Checkout page confusing, too many steps required.`,
  refund: `Refund request for order #11111 - customer changed mind.
Chargeback case #5555: Customer claims item never received.
Partial refund needed: Item arrived damaged, customer kept it.
Full refund processed: Defective product returned.
Refund denied: Outside return window (30 days).
Refund appeal: Customer provides photos of damage.
Dispute: Customer says they returned item but no refund received.
Refund for duplicate charge: Customer billed twice for same order.`,
};

type FeedbackType = "reviews" | "tickets" | "refund";

interface InputPanelProps {
  feedbackType: FeedbackType;
  setFeedbackType: (type: FeedbackType) => void;
  feedbackText: string;
  setFeedbackText: (text: string) => void;
  isLoading: boolean;
  onAnalyze: () => void;
}

function InputPanel({
  feedbackType,
  setFeedbackType,
  feedbackText,
  setFeedbackText,
  isLoading,
  onAnalyze,
}: InputPanelProps) {
  const handleUseSampleData = () => {
    setFeedbackText(SAMPLE_DATA[feedbackType]);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md dark:shadow-lg dark:shadow-black/20 border border-gray-100 dark:border-white/10">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Input Feedback</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
            Feedback Type
          </label>
          <select
            value={feedbackType}
            onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
            className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="reviews">Reviews</option>
            <option value="tickets">Support Tickets</option>
            <option value="refund">Refund Notes</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
            Paste Feedback
          </label>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Paste your feedback here (one item per line)..."
            className="w-full h-48 px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleUseSampleData}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Use Sample Data
          </button>
          <button
            onClick={onAnalyze}
            disabled={isLoading || !feedbackText.trim()}
            className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </div>
    </div>
  );
}

const FRICTION_LABELS: Record<string, string> = {
  checkout_confusion: "Checkout Confusion",
  payment_decline: "Payment Decline",
  refund_dispute: "Refund Dispute",
  shipping_delay: "Shipping Delay",
  inventory_outage: "Inventory Outage",
  app_bug: "App Bug",
  pricing_confusion: "Pricing Confusion",
  support_experience: "Support Experience",
  other: "Other",
};

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  accentColor: string;
}

function SummaryCard({ title, value, subtitle, accentColor }: SummaryCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 p-4 shadow-md dark:shadow-lg dark:shadow-black/20 border border-gray-100 dark:border-white/10">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor}`} />
      <div className="pl-3">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

interface FrictionBarProps {
  label: string;
  count: number;
  maxCount: number;
  color: string;
}

function FrictionBar({ label, count, maxCount, color }: FrictionBarProps) {
  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
  
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <span className="text-slate-900 dark:text-slate-100 font-medium">{count}</span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface ResultsTableProps {
  items: ProcessedItem[];
}

function ResultsTable({ items }: ResultsTableProps) {
  const getSentimentStyles = (score: number) => {
    if (score >= 0.3) return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (score <= -0.3) return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  };

  const getRiskStyles = (risk: string) => {
    if (risk === "high") return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    if (risk === "medium") return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  };

  const getConfidenceStyles = (score: number) => {
    if (score >= 0.75) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 0.5) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="text-left py-3 px-3 font-semibold text-slate-500 dark:text-slate-400">Friction</th>
            <th className="text-left py-3 px-3 font-semibold text-slate-500 dark:text-slate-400">Sentiment</th>
            <th className="text-left py-3 px-3 font-semibold text-slate-500 dark:text-slate-400">Churn</th>
            <th className="text-left py-3 px-3 font-semibold text-slate-500 dark:text-slate-400">Confidence</th>
            <th className="text-left py-3 px-3 font-semibold text-slate-500 dark:text-slate-400">Review</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr 
              key={index} 
              className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td className="py-3 px-3">
                <span className="text-slate-900 dark:text-slate-100">
                  {FRICTION_LABELS[item.friction_type] || item.friction_type}
                </span>
              </td>
              <td className="py-3 px-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getSentimentStyles(item.sentiment_score)}`}>
                  {item.sentiment_score.toFixed(1)}
                </span>
              </td>
              <td className="py-3 px-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRiskStyles(item.churn_risk)}`}>
                  {item.churn_risk}
                </span>
              </td>
              <td className="py-3 px-3">
                <span className={`font-medium ${getConfidenceStyles(item.confidence_score)}`}>
                  {(item.confidence_score * 100).toFixed(0)}%
                </span>
              </td>
              <td className="py-3 px-3">
                {item.requires_human_review ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                    {item.human_review_reason || "Needs review"}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    OK
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface InsightsPanelProps {
  isLoading: boolean;
  results: AnalysisResult | null;
}

function InsightsPanel({ isLoading, results }: InsightsPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md dark:shadow-lg dark:shadow-black/20 border border-gray-100 dark:border-white/10">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="font-medium">Analyzing feedback...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md dark:shadow-lg dark:shadow-black/20 border border-gray-100 dark:border-white/10">
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-500">
            <svg className="w-16 h-16 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm font-medium">Enter feedback and click Analyze to see insights</p>
          </div>
        </div>
      </div>
    );
  }

  const { aggregation, items } = results;
  const maxFrictionCount = Math.max(...Object.values(aggregation.frictionBreakdown), 1);

  const frictionColors: Record<string, string> = {
    checkout_confusion: "bg-blue-500",
    payment_decline: "bg-red-500",
    refund_dispute: "bg-orange-500",
    shipping_delay: "bg-amber-500",
    inventory_outage: "bg-violet-500",
    app_bug: "bg-pink-500",
    pricing_confusion: "bg-indigo-500",
    support_experience: "bg-cyan-500",
    other: "bg-slate-500",
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md dark:shadow-lg dark:shadow-black/20 border border-gray-100 dark:border-white/10">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-5">Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <SummaryCard
            title="Top Issue"
            value={FRICTION_LABELS[aggregation.topIssue] || aggregation.topIssue}
            subtitle={`${aggregation.totalItems} items analyzed`}
            accentColor="bg-blue-500"
          />
          <SummaryCard
            title="High Churn Risk"
            value={`${aggregation.highChurnPercent}%`}
            subtitle="Customers at risk"
            accentColor="bg-red-500"
          />
          <SummaryCard
            title="Payment Flags"
            value={aggregation.paymentFlagsCount}
            subtitle="Issues detected"
            accentColor="bg-amber-500"
          />
          <SummaryCard
            title="Human Review"
            value={`${aggregation.humanReviewPercent}%`}
            subtitle="Need attention"
            accentColor="bg-violet-500"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md dark:shadow-lg dark:shadow-black/20 border border-gray-100 dark:border-white/10">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-5">Friction Breakdown</h2>
        <div className="space-y-1">
          {Object.entries(aggregation.frictionBreakdown)
            .filter(([, count]) => count > 0)
            .sort(([, a], [, b]) => b - a)
            .map(([type, count]) => (
              <FrictionBar
                key={type}
                label={FRICTION_LABELS[type] || type}
                count={count}
                maxCount={maxFrictionCount}
                color={frictionColors[type] || "bg-slate-500"}
              />
            ))}
          {Object.values(aggregation.frictionBreakdown).every((c) => c === 0) && (
            <p className="text-slate-400 dark:text-slate-500 text-sm py-4 text-center">No friction data</p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md dark:shadow-lg dark:shadow-black/20 border border-gray-100 dark:border-white/10">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-5">Detailed Results</h2>
        <ResultsTable items={items} />
      </div>
    </div>
  );
}

function DarkModeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
  };

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    <button
      onClick={toggleDarkMode}
      suppressHydrationWarning
      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <svg
          className="w-5 h-5 text-amber-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5 text-slate-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg shadow-sm" />
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">SignalBoard</h1>
      </div>
      <DarkModeToggle />
    </header>
  );
}

export default function Home() {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("reviews");
  const [feedbackText, setFeedbackText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!feedbackText.trim()) return;
    setIsLoading(true);
    setResults(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackText }),
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <InputPanel
            feedbackType={feedbackType}
            setFeedbackType={setFeedbackType}
            feedbackText={feedbackText}
            setFeedbackText={setFeedbackText}
            isLoading={isLoading}
            onAnalyze={handleAnalyze}
          />
          <InsightsPanel isLoading={isLoading} results={results} />
        </div>
      </main>
    </div>
  );
}