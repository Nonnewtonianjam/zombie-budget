/**
 * Zombie Strength Calculation Verification
 * 
 * This file demonstrates that the zombie strength calculation is correctly implemented.
 * The calculation follows the requirement: strength = transaction amount / 10
 */

import { calculateZombieStrength } from '../types/zombie';
import { spawnZombieFromTransaction } from './zombieSpawning';
import type { Transaction } from '../types/transaction';

/**
 * Verification examples showing zombie strength calculation
 */
export const verificationExamples = [
  {
    transactionAmount: 100,
    expectedStrength: 10,
    description: '$100 transaction creates zombie with strength 10'
  },
  {
    transactionAmount: 50,
    expectedStrength: 5,
    description: '$50 transaction creates zombie with strength 5'
  },
  {
    transactionAmount: 127.50,
    expectedStrength: 12.75,
    description: '$127.50 transaction creates zombie with strength 12.75'
  },
  {
    transactionAmount: 200,
    expectedStrength: 20,
    description: '$200 transaction creates zombie with strength 20'
  },
  {
    transactionAmount: 1000,
    expectedStrength: 100,
    description: '$1000 transaction creates zombie with strength 100'
  }
];

/**
 * Verify that calculateZombieStrength works correctly
 */
export function verifyStrengthCalculation(): boolean {
  console.log('🧟 Verifying Zombie Strength Calculation...\n');
  
  let allPassed = true;
  
  for (const example of verificationExamples) {
    const calculatedStrength = calculateZombieStrength(example.transactionAmount);
    const passed = calculatedStrength === example.expectedStrength;
    
    console.log(`${passed ? '✅' : '❌'} ${example.description}`);
    console.log(`   Amount: $${example.transactionAmount}`);
    console.log(`   Expected: ${example.expectedStrength}`);
    console.log(`   Calculated: ${calculatedStrength}`);
    console.log('');
    
    if (!passed) {
      allPassed = false;
    }
  }
  
  return allPassed;
}

/**
 * Verify that spawnZombieFromTransaction uses the strength calculation
 */
export function verifyZombieSpawning(): boolean {
  console.log('🧟 Verifying Zombie Spawning Integration...\n');
  
  const testTransaction: Transaction = {
    id: 'test-tx-1',
    amount: 150,
    category: 'food',
    date: new Date(),
    description: 'Test overspending transaction',
    isGoodSpending: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const zombie = spawnZombieFromTransaction(testTransaction);
  const expectedStrength = 15; // 150 / 10
  const passed = zombie.strength === expectedStrength;
  
  console.log(`${passed ? '✅' : '❌'} Zombie spawned with correct strength`);
  console.log(`   Transaction Amount: $${testTransaction.amount}`);
  console.log(`   Expected Strength: ${expectedStrength}`);
  console.log(`   Zombie Strength: ${zombie.strength}`);
  console.log(`   Zombie Type: ${zombie.type}`);
  console.log(`   Zombie State: ${zombie.state}`);
  console.log('');
  
  return passed;
}

/**
 * Run all verifications
 */
export function runAllVerifications(): boolean {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  ZOMBIE STRENGTH CALCULATION VERIFICATION');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const strengthPassed = verifyStrengthCalculation();
  const spawningPassed = verifyZombieSpawning();
  
  console.log('═══════════════════════════════════════════════════════');
  if (strengthPassed && spawningPassed) {
    console.log('✅ ALL VERIFICATIONS PASSED');
    console.log('   Zombie strength calculation is correctly implemented!');
  } else {
    console.log('❌ SOME VERIFICATIONS FAILED');
  }
  console.log('═══════════════════════════════════════════════════════');
  
  return strengthPassed && spawningPassed;
}

// Run verifications if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllVerifications();
}
