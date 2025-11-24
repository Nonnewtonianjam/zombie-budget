/**
 * Game Components
 * 
 * Exports all game-related components for the isometric zombie visualization.
 */

export { GameCanvas } from './GameCanvas';
export { 
  renderZombie, 
  useZombieSprites, 
  getZombieSpriteFrames,
  updateZombieFrame,
  updateZombiePosition,
  defeatZombie,
  isZombieDefeatComplete,
} from './Zombie';
