// Visitor Types
export interface VisitorFormData {
  nama: string;
  instansi: string;
  jabatan: string;
  noHandphone: string;
}

export interface VisitorRecord extends VisitorFormData {
  _id: string;
  registeredAt: Date;
  ipAddress?: string;
}

// Innovation Types
export interface InnovationItem {
  _id: string;
  title: string;
  description: string;
  type: 'powerpoint' | 'video';
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: Date;
  views: number;
}

// Game Types
export interface GameConfig {
  mode: 'single' | 'multiplayer';
  difficulty?: 'easy' | 'medium' | 'hard';
  roomCode?: string;
}

export interface GameState {
  score: number;
  lives: number;
  level: number;
  isPlaying: boolean;
  isPaused: boolean;
}

export interface LeaderboardEntry {
  _id: string;
  playerName: string;
  score: number;
  playedAt: Date;
  mode: 'single' | 'multiplayer';
  level: number;
  duration: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}
