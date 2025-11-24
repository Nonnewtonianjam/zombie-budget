/**
 * Demo Data Generator
 * 
 * Generates realistic sample transactions for demo mode.
 * Creates 20-30 transactions with varied spending patterns and relatable descriptions.
 */

import type { Transaction, TransactionCategory } from '@/types/transaction';

/**
 * Demo transaction templates with realistic descriptions
 */
const DEMO_TEMPLATES = {
  food: [
    { description: 'DoorDash - Late night cravings', amountRange: [25, 45] },
    { description: 'Starbucks - Morning coffee run', amountRange: [8, 15] },
    { description: 'Whole Foods - Weekly groceries', amountRange: [85, 150] },
    { description: 'Chipotle - Quick lunch', amountRange: [12, 18] },
    { description: 'Pizza delivery - Friday night', amountRange: [30, 50] },
    { description: 'Uber Eats - Too tired to cook', amountRange: [20, 40] },
    { description: 'Local cafe - Breakfast sandwich', amountRange: [10, 16] },
    { description: 'Sushi restaurant - Date night', amountRange: [75, 120] },
    { description: 'Fast food - Quick bite', amountRange: [8, 15] },
    { description: 'Grocery store - Snacks and drinks', amountRange: [25, 45] },
  ],
  entertainment: [
    { description: 'Movie tickets - New release', amountRange: [25, 40] },
    { description: 'Concert tickets - Live show', amountRange: [80, 150] },
    { description: 'Bar tab - Night out with friends', amountRange: [45, 90] },
    { description: 'Bowling alley - Weekend fun', amountRange: [30, 50] },
    { description: 'Escape room - Team activity', amountRange: [35, 55] },
    { description: 'Arcade - Retro gaming night', amountRange: [20, 35] },
    { description: 'Mini golf - Sunday afternoon', amountRange: [15, 25] },
    { description: 'Streaming rental - New movie', amountRange: [5, 8] },
    { description: 'Comedy club - Stand-up show', amountRange: [25, 45] },
    { description: 'Karaoke bar - Birthday celebration', amountRange: [40, 70] },
  ],
  shopping: [
    { description: 'Amazon - Impulse buy', amountRange: [30, 80] },
    { description: 'Target - Just browsing...', amountRange: [50, 120] },
    { description: 'New shoes - Had to have them', amountRange: [70, 150] },
    { description: 'Online shopping - Late night scroll', amountRange: [40, 90] },
    { description: 'Clothing store - Sale items', amountRange: [60, 130] },
    { description: 'Electronics - New gadget', amountRange: [100, 250] },
    { description: 'Home decor - Impulse purchase', amountRange: [35, 75] },
    { description: 'Bookstore - New releases', amountRange: [25, 50] },
    { description: 'Sporting goods - Workout gear', amountRange: [45, 95] },
    { description: 'Beauty products - Self care', amountRange: [30, 70] },
  ],
  subscriptions: [
    { description: 'Netflix - Monthly subscription', amountRange: [15, 20] },
    { description: 'Spotify Premium - Music streaming', amountRange: [10, 12] },
    { description: 'Gym membership - Monthly fee', amountRange: [40, 80] },
    { description: 'Adobe Creative Cloud - Design tools', amountRange: [50, 60] },
    { description: 'Amazon Prime - Annual renewal', amountRange: [12, 15] },
    { description: 'Disney+ - Streaming service', amountRange: [8, 10] },
    { description: 'Cloud storage - Extra space', amountRange: [5, 10] },
    { description: 'Meal kit delivery - Weekly box', amountRange: [60, 90] },
    { description: 'Gaming subscription - Xbox/PS+', amountRange: [10, 15] },
    { description: 'News subscription - Digital access', amountRange: [8, 12] },
  ],
  savings: [
    { description: 'Emergency fund - Monthly deposit', amountRange: [100, 300] },
    { description: 'Savings account - Transfer', amountRange: [200, 500] },
    { description: 'Investment account - Contribution', amountRange: [150, 400] },
    { description: 'Vacation fund - Setting aside', amountRange: [100, 250] },
  ],
  debt_payment: [
    { description: 'Credit card - Payment', amountRange: [100, 500] },
    { description: 'Student loan - Monthly payment', amountRange: [200, 400] },
    { description: 'Car payment - Monthly installment', amountRange: [250, 450] },
  ],
} as const;

/**
 * Generate a random amount within a range
 */
function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

/**
 * Generate a random date within the current month
 */
function randomDateThisMonth(): Date {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  // Random day between 1 and current day (or 28 if we're past that)
  const maxDay = Math.min(now.getDate(), 28);
  const day = Math.floor(Math.random() * maxDay) + 1;
  
  // Random hour between 8 AM and 10 PM
  const hour = Math.floor(Math.random() * 14) + 8;
  
  // Random minute
  const minute = Math.floor(Math.random() * 60);
  
  return new Date(year, month, day, hour, minute);
}

/**
 * Select a random template from a category
 */
function selectRandomTemplate(category: TransactionCategory) {
  const templates = DEMO_TEMPLATES[category];
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Generate a unique ID for a transaction
 */
function generateId(): string {
  return `demo-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Generate a single demo transaction
 */
function generateDemoTransaction(category: TransactionCategory): Transaction {
  const template = selectRandomTemplate(category);
  const amount = randomAmount(template.amountRange[0], template.amountRange[1]);
  const date = randomDateThisMonth();
  const now = new Date();
  
  return {
    id: generateId(),
    amount,
    category,
    date,
    description: template.description,
    isGoodSpending: category === 'savings' || category === 'debt_payment',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Generate demo data with realistic spending patterns
 * 
 * Creates 20-30 transactions with:
 * - Varied spending across all categories
 * - Mix of good and bad spending
 * - Realistic amounts and descriptions
 * - Dates spread throughout the current month
 * 
 * @returns Array of demo transactions
 */
export function generateDemoData(): Transaction[] {
  const transactions: Transaction[] = [];
  
  // Generate 15-20 bad spending transactions (zombies)
  const badSpendingCount = Math.floor(Math.random() * 6) + 15; // 15-20
  const badCategories: TransactionCategory[] = ['food', 'entertainment', 'shopping', 'subscriptions'];
  
  for (let i = 0; i < badSpendingCount; i++) {
    const category = badCategories[Math.floor(Math.random() * badCategories.length)];
    transactions.push(generateDemoTransaction(category));
  }
  
  // Generate 5-10 good spending transactions (healing)
  const goodSpendingCount = Math.floor(Math.random() * 6) + 5; // 5-10
  const goodCategories: TransactionCategory[] = ['savings', 'debt_payment'];
  
  for (let i = 0; i < goodSpendingCount; i++) {
    const category = goodCategories[Math.floor(Math.random() * goodCategories.length)];
    transactions.push(generateDemoTransaction(category));
  }
  
  // Sort by date (chronological order)
  transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  return transactions;
}

/**
 * Generate demo budget configuration
 * Returns reasonable budget amounts for each category
 */
export function generateDemoBudget() {
  return {
    food: 400,
    entertainment: 200,
    shopping: 300,
    subscriptions: 150,
  };
}
