/**
 * Game Store (Zustand)
 * 
 * Global state management for game entities (zombies, blockades, home base).
 * Provides centralized state that can be accessed from any component.
 * 
 * Benefits:
 * - Single source of truth for game state
 * - No prop drilling
 * - Automatic re-renders when state changes
 * - DevTools support for debugging
 * 
 * @example
 * // Use entire store
 * const { zombies, addZombie, removeZombie } = useGameStore();
 * 
 * @example
 * // Use selector for optimized re-renders (only re-renders when zombies change)
 * const zombies = useGameStore(selectZombies);
 * 
 * @example
 * // Use specific state slice
 * const zombieCount = useGameStore(selectZombieCount);
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Zombie } from '@/types/zombie';
import type { Blockade } from '@/types/blockade';
import type { HomeBase } from '@/types/homebase';
import type { Particle } from '@/lib/particles';
import { CombatManager } from '@/lib/combat';

/**
 * Game store state interface
 */
interface GameState {
  // Entities
  zombies: Zombie[];
  blockades: Blockade[];
  homeBase: HomeBase;
  particles: Particle[];
  
  // Combat manager
  combatManager: CombatManager;
  
  // Game loop state
  isGameLoopActive: boolean;
  lastUpdateTime: number;
  
  // Actions - Zombies
  addZombie: (zombie: Zombie) => void;
  removeZombie: (zombieId: string) => void;
  updateZombie: (zombieId: string, updates: Partial<Zombie>) => void;
  setZombies: (zombies: Zombie[]) => void;
  clearZombies: () => void;
  
  // Actions - Blockades
  setBlockades: (blockades: Blockade[]) => void;
  updateBlockade: (blockadeId: string, updates: Partial<Blockade>) => void;
  
  // Actions - Home Base
  setHomeBase: (homeBase: HomeBase) => void;
  
  // Actions - Particles
  addParticles: (particles: Particle[]) => void;
  setParticles: (particles: Particle[]) => void;
  clearParticles: () => void;
  
  // Actions - Game Loop
  setGameLoopActive: (active: boolean) => void;
  setLastUpdateTime: (time: number) => void;
  
  // Actions - Reset
  resetGameState: () => void;
}

/**
 * Initial home base state
 */
const initialHomeBase: HomeBase = {
  health: 0,
  maxHealth: 0,
  state: 'safe',
  position: { x: 0, y: 0, z: 0 },
};

/**
 * Create game store with Zustand
 * 
 * DevTools middleware enabled in development for debugging
 */
export const useGameStore = create<GameState>()(
  devtools(
    (set) => ({
      // Initial state
      zombies: [],
      blockades: [],
      homeBase: initialHomeBase,
      particles: [],
      combatManager: new CombatManager(),
      isGameLoopActive: false,
      lastUpdateTime: 0,

      // Zombie actions
      addZombie: (zombie) =>
        set((state) => ({
          zombies: [...state.zombies, zombie],
        }), false, 'addZombie'),

      removeZombie: (zombieId) =>
        set((state) => {
          // Clear attack state when removing zombie
          state.combatManager.clearAttackState(zombieId);
          return {
            zombies: state.zombies.filter((z) => z.id !== zombieId),
          };
        }, false, 'removeZombie'),

      updateZombie: (zombieId, updates) =>
        set((state) => ({
          zombies: state.zombies.map((z) =>
            z.id === zombieId ? { ...z, ...updates } : z
          ),
        }), false, 'updateZombie'),

      setZombies: (zombies) =>
        set({ zombies }, false, 'setZombies'),

      clearZombies: () =>
        set((state) => {
          // Clear all attack states
          state.zombies.forEach((z) => state.combatManager.clearAttackState(z.id));
          return { zombies: [] };
        }, false, 'clearZombies'),

      // Blockade actions
      setBlockades: (blockades) =>
        set({ blockades }, false, 'setBlockades'),

      updateBlockade: (blockadeId, updates) =>
        set((state) => ({
          blockades: state.blockades.map((b) =>
            b.id === blockadeId ? { ...b, ...updates } : b
          ),
        }), false, 'updateBlockade'),

      // Home base actions
      setHomeBase: (homeBase) =>
        set({ homeBase }, false, 'setHomeBase'),

      // Particle actions
      addParticles: (particles) =>
        set((state) => ({
          particles: [...state.particles, ...particles],
        }), false, 'addParticles'),

      setParticles: (particles) =>
        set({ particles }, false, 'setParticles'),

      clearParticles: () =>
        set({ particles: [] }, false, 'clearParticles'),

      // Game loop actions
      setGameLoopActive: (active) =>
        set({ isGameLoopActive: active }, false, 'setGameLoopActive'),

      setLastUpdateTime: (time) =>
        set({ lastUpdateTime: time }, false, 'setLastUpdateTime'),

      // Reset action
      resetGameState: () =>
        set((state) => {
          // Reset combat manager
          state.combatManager.reset();
          
          return {
            zombies: [],
            blockades: [],
            homeBase: initialHomeBase,
            particles: [],
            isGameLoopActive: false,
            lastUpdateTime: 0,
          };
        }, false, 'resetGameState'),
    }),
    {
      name: 'game-store',
      enabled: import.meta.env.DEV,
    }
  )
);

/**
 * Selectors for optimized component subscriptions
 * Use these to subscribe to specific parts of the state
 */

// Select only zombies
export const selectZombies = (state: GameState) => state.zombies;

// Select only blockades
export const selectBlockades = (state: GameState) => state.blockades;

// Select only home base
export const selectHomeBase = (state: GameState) => state.homeBase;

// Select only particles
export const selectParticles = (state: GameState) => state.particles;

// Select game loop state
export const selectGameLoopState = (state: GameState) => ({
  isActive: state.isGameLoopActive,
  lastUpdateTime: state.lastUpdateTime,
});

// Select combat manager
export const selectCombatManager = (state: GameState) => state.combatManager;

// Select zombie count
export const selectZombieCount = (state: GameState) => state.zombies.length;

// Select active zombies (moving or attacking)
export const selectActiveZombies = (state: GameState) =>
  state.zombies.filter((z) => z.state === 'moving' || z.state === 'attacking');

// Select defeated zombies
export const selectDefeatedZombies = (state: GameState) =>
  state.zombies.filter((z) => z.state === 'defeated');
