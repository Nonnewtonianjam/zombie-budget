/**
 * Dashboard Component
 * 
 * Main dashboard view with transactions, budget management, charts, and insights.
 * Premium finance application interface with spooky theming.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { useBudget } from '../../hooks/useBudget';
import { useTransactions } from '../../hooks/useTransactions';
import { TransactionForm } from '../transactions/TransactionForm';
import { TransactionList } from '../transactions/TransactionList';
import { BudgetConfiguration } from '../budget/BudgetConfiguration';
import { SpendingChart } from '../charts/SpendingChart';
import { CategoryBreakdown } from '../charts/CategoryBreakdown';
import { generateInsights } from '../../lib/insightsGenerator';
import { Play, TrendingUp, Wallet, Shield, Home, AlertTriangle, TrendingDown, Award, Lightbulb, Plus } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  const {
    budgetConfig,
    totalBudget,
    totalSpent,
    overallUtilization,
  } = useBudget(transactions);

  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const { addTransaction, deleteTransaction } = useTransactions();

  // Calculate quick stats
  const remainingBudget = totalBudget - totalSpent;
  const budgetHealth = totalBudget > 0 ? (remainingBudget / totalBudget) * 100 : 100;

  // Generate insights
  const insights = generateInsights(transactions, budgetConfig);
  const criticalInsights = insights.filter(i => i.impact === 'high').slice(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-tertiary text-neutral-100">
      {/* Header */}
      <header className="bg-background-card/95 backdrop-blur-xl border-b-2 border-brand-purple/30 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-3 py-2 bg-background-secondary/60 hover:bg-background-tertiary/80 border border-brand-purple/20 hover:border-brand-purple/50 rounded-lg text-neutral-300 hover:text-neutral-100 transition-all duration-200 hover:scale-105"
              >
                <Home size={16} />
                <span className="text-sm font-medium">Home</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-neutral-100 flex items-center gap-2">
                  <span className="text-3xl">🧟</span>
                  Dashboard
                </h1>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Manage your budget and track spending
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="small"
                onClick={() => setShowTransactionModal(true)}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Transaction
              </Button>
              <Button
                variant="secondary"
                size="small"
                onClick={() => setShowInsightsModal(true)}
                className="flex items-center gap-2"
              >
                <TrendingUp size={16} />
                Insights
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate('/playback')}
                className="flex items-center gap-2 bg-brand-purple hover:bg-brand-purple-dark shadow-lg"
              >
                <Play size={16} />
                Watch Playback
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-background-card/50 backdrop-blur-sm border-2 border-brand-purple/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400 mb-1">Total Budget</p>
                <p className="text-3xl font-bold text-neutral-100">${totalBudget.toFixed(0)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-brand-purple/20 flex items-center justify-center">
                <Wallet className="text-brand-purple" size={24} />
              </div>
            </div>
          </Card>

          <Card className="bg-background-card/50 backdrop-blur-sm border-2 border-accent-red/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400 mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-accent-red">${totalSpent.toFixed(0)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent-red/20 flex items-center justify-center">
                <span className="text-2xl">🧟</span>
              </div>
            </div>
          </Card>

          <Card className={`bg-background-card/50 backdrop-blur-sm border-2 p-6 ${
            budgetHealth > 50 ? 'border-accent-green/30' : budgetHealth > 25 ? 'border-accent-orange/30' : 'border-accent-red/30'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400 mb-1">Remaining</p>
                <p className={`text-3xl font-bold ${
                  budgetHealth > 50 ? 'text-accent-green' : budgetHealth > 25 ? 'text-accent-orange' : 'text-accent-red'
                }`}>
                  ${remainingBudget.toFixed(0)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                budgetHealth > 50 ? 'bg-accent-green/20' : budgetHealth > 25 ? 'bg-accent-orange/20' : 'bg-accent-red/20'
              }`}>
                <Shield className={
                  budgetHealth > 50 ? 'text-accent-green' : budgetHealth > 25 ? 'text-accent-orange' : 'text-accent-red'
                } size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Transactions & Budget (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Budget Configuration */}
            <Card className="bg-background-card/50 backdrop-blur-sm border-2 border-brand-purple/30 p-6">
              <h2 className="text-xl font-bold text-neutral-100 mb-4 flex items-center gap-2">
                <Wallet size={20} className="text-brand-purple" />
                Budget Configuration
              </h2>
              <BudgetConfiguration 
                budgetConfig={budgetConfig}
                onUpdate={() => {}}
                onReset={() => {}}
                totalBudget={totalBudget}
                totalSpent={totalSpent}
                overallUtilization={overallUtilization}
              />
            </Card>

            {/* Transaction History */}
            <Card className="bg-background-card/50 backdrop-blur-sm border-2 border-brand-purple/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
                  <span className="text-2xl">💸</span>
                  Transaction History
                </h2>
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => setShowTransactionModal(true)}
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Transaction
                </Button>
              </div>
              <TransactionList
                transactions={transactions}
                onEdit={(tx) => {
                  // Could open modal with transaction pre-filled for editing
                  console.log('Edit transaction:', tx);
                }}
                onDelete={deleteTransaction}
              />
            </Card>
          </div>

          {/* Right Column - Charts & Insights (1/3 width) */}
          <div className="space-y-6">
            {/* Spending Chart */}
            <div className="h-[320px]">
              <SpendingChart 
                transactions={transactions}
                budget={budgetConfig}
              />
            </div>

            {/* Category Breakdown */}
            <div className="h-[320px]">
              <CategoryBreakdown 
                transactions={transactions}
              />
            </div>

            {/* AI Insights */}
            {transactions.length > 0 && (
              <Card className="bg-background-card/50 backdrop-blur-sm border-2 border-brand-purple/30 p-6">
                <h3 className="text-lg font-bold text-neutral-100 mb-4 flex items-center gap-2">
                  <Lightbulb size={18} className="text-brand-purple" />
                  AI Insights
                </h3>
                <div className="space-y-3">
                  {criticalInsights.length > 0 ? (
                    criticalInsights.map((insight, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-background-tertiary/50 border border-brand-purple/20 rounded-lg"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          {insight.type === 'warning' && <AlertTriangle size={16} className="text-accent-red mt-0.5" />}
                          {insight.type === 'trend' && <TrendingDown size={16} className="text-accent-orange mt-0.5" />}
                          <p className="text-sm font-medium text-neutral-100">{insight.title}</p>
                        </div>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                          {insight.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-accent-green/10 border border-accent-green/30 rounded-lg">
                      <div className="flex items-start gap-2 mb-2">
                        <Award size={16} className="text-accent-green mt-0.5" />
                        <p className="text-sm font-medium text-accent-green">Excellent Financial Health</p>
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Your spending is well-managed across all categories. Keep up the great work!
                      </p>
                    </div>
                  )}
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => setShowInsightsModal(true)}
                    className="w-full"
                  >
                    View All Insights ({insights.length})
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        title="Add Transaction"
        size="medium"
      >
        <TransactionForm
          onSubmit={(transaction) => {
            addTransaction(transaction);
            setShowTransactionModal(false);
          }}
          onCancel={() => setShowTransactionModal(false)}
        />
      </Modal>

      {/* Insights Modal */}
      <Modal
        isOpen={showInsightsModal}
        onClose={() => setShowInsightsModal(false)}
        title="Financial Insights & Recommendations"
        size="xlarge"
      >
        <div className="space-y-6">
          {insights.length === 0 ? (
            <div className="text-center py-12">
              <Award size={48} className="text-brand-purple mx-auto mb-4" />
              <h3 className="text-xl font-bold text-neutral-100 mb-2">No Insights Available</h3>
              <p className="text-neutral-400">Add more transactions to receive personalized financial insights.</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="bg-background-card/50 border border-brand-purple/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-neutral-100 mb-3">Analysis Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-neutral-400 mb-1">Total Insights</p>
                    <p className="text-2xl font-bold text-neutral-100">{insights.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400 mb-1">High Priority</p>
                    <p className="text-2xl font-bold text-accent-red">
                      {insights.filter(i => i.impact === 'high').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400 mb-1">Opportunities</p>
                    <p className="text-2xl font-bold text-accent-green">
                      {insights.filter(i => i.type === 'opportunity' || i.type === 'achievement').length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Insights List */}
              <div className="space-y-4">
                {insights.map((insight, idx) => {
                  const iconMap = {
                    warning: <AlertTriangle size={20} className="text-accent-red" />,
                    opportunity: <Lightbulb size={20} className="text-accent-orange" />,
                    trend: <TrendingUp size={20} className="text-brand-purple" />,
                    achievement: <Award size={20} className="text-accent-green" />,
                  };

                  const bgMap = {
                    warning: 'bg-accent-red/10 border-accent-red/30',
                    opportunity: 'bg-accent-orange/10 border-accent-orange/30',
                    trend: 'bg-brand-purple/10 border-brand-purple/30',
                    achievement: 'bg-accent-green/10 border-accent-green/30',
                  };

                  return (
                    <div
                      key={idx}
                      className={`border rounded-xl p-5 ${bgMap[insight.type]}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          {iconMap[insight.type]}
                          <div>
                            <h4 className="text-base font-bold text-neutral-100 mb-1">
                              {insight.title}
                            </h4>
                            <p className="text-xs text-neutral-400 uppercase tracking-wide">
                              {insight.category} • {insight.impact} impact
                            </p>
                          </div>
                        </div>
                        {insight.metric && (
                          <span className="text-xs font-mono bg-background-tertiary px-2 py-1 rounded">
                            {insight.metric}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-300 mb-3 leading-relaxed">
                        {insight.description}
                      </p>
                      <div className="bg-background-tertiary/50 rounded-lg p-3">
                        <p className="text-xs text-neutral-400 mb-1 font-medium">Recommended Action:</p>
                        <p className="text-sm text-neutral-200">{insight.actionable}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
