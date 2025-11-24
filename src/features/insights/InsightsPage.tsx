/**
 * InsightsPage Component
 * 
 * Full-page view for detailed financial insights and recommendations.
 * Wraps InsightsDashboard with navigation and layout.
 */

import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { InsightsDashboard } from './InsightsDashboard';
import { useTransactions } from '../../hooks/useTransactions';
import { useBudget } from '../../hooks/useBudget';

export function InsightsPage() {
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  const {
    budgets,
    totalBudget,
    totalSpent,
    overallUtilization,
  } = useBudget(transactions);

  return (
    <div className="min-h-screen bg-background-primary text-ghost-white">
      {/* Header */}
      <header className="bg-background-secondary border-b border-decay-gray">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-ghost-white">
                Financial Insights
              </h1>
              <p className="text-sm text-ghost-dim mt-1">
                Detailed analysis and recommendations
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <InsightsDashboard
          totalBudget={totalBudget}
          totalSpent={totalSpent}
          overallUtilization={overallUtilization}
          budgets={budgets}
        />
      </main>
    </div>
  );
}
