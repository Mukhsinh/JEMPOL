import api from './api';
import { LeaderboardEntry, APIResponse } from '../types';

/**
 * Submit game score
 */
export const submitGameScore = async (data: {
  playerName: string;
  score: number;
  mode: 'single' | 'multiplayer';
  level: number;
  duration: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}): Promise<APIResponse> => {
  // Convert camelCase to snake_case for backend
  const payload = {
    player_name: data.playerName,
    score: data.score,
    mode: data.mode,
    level: data.level,
    duration: data.duration,
    device_type: data.deviceType,
  };
  
  const response = await api.post<APIResponse>('/game/score', payload);
  return response.data;
};

/**
 * Get leaderboard
 */
export const getLeaderboard = async (
  mode?: 'single' | 'multiplayer',
  limit?: number
): Promise<APIResponse<LeaderboardEntry[]>> => {
  const params: any = {};
  if (mode) params.mode = mode;
  if (limit) params.limit = limit;

  const response = await api.get<APIResponse<LeaderboardEntry[]>>('/game/leaderboard', { params });
  return response.data;
};

/**
 * Detect device type
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};
