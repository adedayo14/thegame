// Game types and interfaces

export type BalloonType = 'white' | 'yellow' | 'blue' | 'pink' | 'green' | 'purple' | 'orange' | 'teal';

export interface Balloon {
  id: string;
  x: number;
  y: number;
  speed: number;
  type: BalloonType;
  radius: number;
}

export interface GameState {
  balloons: Balloon[];
  score: number;
  lives: number;
  round: number;
  gameOver: boolean;
  isPaused: boolean;
  totalScore: number;
  difficulty: number;
}

export interface PlayerPrivileges {
  networkPrivilege: boolean; // 'm' in username - knows about special balloons
  opportunityPrivilege: boolean; // 'h' in username - gets practice round
  hasPracticed: boolean;
  superSkills: boolean; // Round 2+ if score > threshold
  hasSlowButton: boolean; // Round 3+ if score > higher threshold
  slowButtonUsed: boolean;
}

export interface PlayerData {
  username: string;
  videoGameFrequency: 'often' | 'sometimes' | 'rarely';
  privileges: PlayerPrivileges;
  scores: number[];
}
