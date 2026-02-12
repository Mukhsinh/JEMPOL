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
  _id?: string;
  id?: string;
  title: string;
  description: string;
  type: 'powerpoint' | 'pdf' | 'video' | 'photo';
  category?: 'innovation' | 'video' | 'photo';
  fileUrl?: string;
  file_url?: string;
  fileName?: string;
  file_name?: string;
  fileSize?: number;
  file_size?: number;
  mimeType?: string;
  mime_type?: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
  uploadedBy?: string;
  uploaded_by?: string;
  uploadedAt?: Date | string;
  uploaded_at?: Date | string;
  views?: number;
  created_at?: string;
  updated_at?: string;
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
  code?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}
