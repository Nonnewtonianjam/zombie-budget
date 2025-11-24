/**
 * Recharts Configuration
 * 
 * Centralized configuration for all Recharts visualizations
 * with spooky theme colors and consistent styling
 */

export const CHART_COLORS = {
  // Category colors matching our spooky theme
  food: '#d97548', // Warning orange
  entertainment: '#a83232', // Blood red
  shopping: '#4a9d5f', // Toxic green
  subscriptions: '#8b7ba8', // Purple-gray
  
  // Chart elements
  grid: '#242432', // Tertiary background
  text: '#e8e8f0', // Ghost white
  axis: '#4a4a4a', // Decay gray
  
  // Line/area colors
  spending: '#a83232', // Blood red for spending line
  budget: '#4a9d5f', // Toxic green for budget line
  
  // Gradients
  spendingGradientStart: 'rgba(168, 50, 50, 0.4)',
  spendingGradientEnd: 'rgba(168, 50, 50, 0)',
} as const;

export const CHART_STYLES = {
  // Common chart styling
  background: '#1a0f1f', // Primary dark background
  fontSize: 12,
  fontFamily: 'Inter, sans-serif',
  
  // Tooltip styling
  tooltip: {
    backgroundColor: '#0a0a0f',
    border: '1px solid #242432',
    borderRadius: '4px',
    padding: '8px 12px',
  },
  
  // Legend styling
  legend: {
    iconSize: 12,
    fontSize: 12,
    color: '#e8e8f0',
  },
} as const;

/**
 * Get color for a transaction category
 */
export function getCategoryColor(category: string): string {
  const normalizedCategory = category.toLowerCase();
  
  switch (normalizedCategory) {
    case 'food':
      return CHART_COLORS.food;
    case 'entertainment':
      return CHART_COLORS.entertainment;
    case 'shopping':
      return CHART_COLORS.shopping;
    case 'subscriptions':
      return CHART_COLORS.subscriptions;
    default:
      return CHART_COLORS.axis; // Fallback to gray
  }
}

/**
 * Format currency for chart labels
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format date for chart labels
 */
export function formatChartDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
}
