// Utility functions for the game

import { PlayerPrivileges, BalloonType, Balloon } from './types';

export function detectPrivileges(username: string): Pick<PlayerPrivileges, 'networkPrivilege' | 'opportunityPrivilege'> {
  // Network privilege: username contains letter 'm' or 'M'
  const networkPrivilege = username.toLowerCase().includes('m');

  // Opportunity privilege: username contains letter 'h' or 'H'
  const opportunityPrivilege = username.toLowerCase().includes('h');

  return {
    networkPrivilege,
    opportunityPrivilege,
  };
}

export function getBalloonColor(type: BalloonType): string {
  const colors = {
    white: '#FFFFFF',      // Killer balloon - lose a life
    yellow: '#FFD700',     // 100 points
    blue: '#4169E1',       // Lose 100 points
    pink: '#FF69B4',       // 10 points
    green: '#32CD32',      // 10 points
    purple: '#9370DB',     // 10 points
    orange: '#FF8C00',     // 10 points
    teal: '#20B2AA',       // 10 points
  };
  return colors[type];
}

export function getBalloonPoints(type: BalloonType): number {
  const points = {
    white: 0,        // Killer balloon - lose a life
    yellow: 100,     // 100 points
    blue: -100,      // Lose 100 points
    pink: 10,        // 10 points
    green: 10,       // 10 points
    purple: 10,      // 10 points
    orange: 10,      // 10 points
    teal: 10,        // 10 points
  };
  return points[type];
}

function getRandomBalloonType(difficulty: number, round: number = 1): BalloonType {
  const rand = Math.random();
  
  // White balloon chance increases with rounds: 10% -> 20% -> 30%
  const whiteChance = 0.05 + (round * 0.05); // Round 1: 10%, Round 2: 15%, Round 3: 20%
  if (rand < whiteChance) return 'white';
  
  // 15% chance for yellow (100 points)
  if (rand < whiteChance + 0.15) return 'yellow';
  
  // 15% chance for blue (lose 50 points)
  if (rand < whiteChance + 0.30) return 'blue';
  
  // Remaining chance for regular 10-point balloons
  const regularColors: BalloonType[] = ['pink', 'green', 'purple', 'orange', 'teal'];
  return regularColors[Math.floor(Math.random() * regularColors.length)];
}

export function createBalloon(canvasWidth: number, difficulty: number, round: number = 1): Balloon {
  const type = getRandomBalloonType(difficulty, round);
  // Speed increases by 20% each round (round 1 = 1x, round 2 = 1.2x, round 3 = 1.4x, etc.)
  const roundSpeedMultiplier = 1 + ((round - 1) * 0.2);
  return {
    id: Math.random().toString(36).substr(2, 9),
    x: Math.random() * (canvasWidth - 100) + 50,
    y: window.innerHeight + 50,
    speed: (0.25 + difficulty * 0.02 + Math.random() * 0.12) * roundSpeedMultiplier, // Faster: 0.25-0.37 base (was 0.15-0.23)
    type,
    radius: 50,
  };
}

// Create a white balloon near a high-value balloon to catch people out
export function createTrapBalloon(targetBalloon: Balloon, canvasWidth: number, round: number = 1): Balloon {
  const roundSpeedMultiplier = 1 + ((round - 1) * 0.2);
  // Spawn near the target balloon (within 80-150 pixels)
  const distance = 80 + Math.random() * 70;
  const angle = Math.random() * Math.PI * 2;
  const x = Math.max(50, Math.min(canvasWidth - 50, targetBalloon.x + Math.cos(angle) * distance));
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    x,
    y: targetBalloon.y + Math.sin(angle) * distance,
    speed: targetBalloon.speed * (0.9 + Math.random() * 0.2), // Similar speed to target
    type: 'white',
    radius: 50,
  };
}


export function checkCollision(
  x: number,
  y: number,
  balloon: Balloon
): boolean {
  const distance = Math.sqrt(
    Math.pow(x - balloon.x, 2) + Math.pow(y - balloon.y, 2)
  );
  // Slightly forgiving hit area - 1.3x balloon radius for easier clicking without double-popping
  return distance < balloon.radius * 1.3;
}

export function getSpawnRate(difficulty: number): number {
  return Math.max(900 - difficulty * 40, 500); // Well-spaced for mobile: 900ms down to 500ms (was 800-400)
}

export function shouldUnlockSuperSkills(totalScore: number): boolean {
  return totalScore >= 500; // Threshold for Round 2 super skills
}

export function shouldUnlockSlowButton(totalScore: number): boolean {
  return totalScore >= 1500; // Threshold for Round 3 slow button
}
