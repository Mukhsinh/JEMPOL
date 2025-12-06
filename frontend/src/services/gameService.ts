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
  try {
    // Convert camelCase to snake_case for backend
    const payload = {
      player_name: data.playerName.trim(),
      score: data.score,
      mode: data.mode,
      level: data.level,
      duration: data.duration,
      device_type: data.deviceType,
    };
    
    console.log('Submitting game score:', payload);
    const response = await api.post<APIResponse>('/game/score', payload);
    console.log('Game score submitted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error submitting game score:', error);
    throw error;
  }
};

/**
 * Get leaderboard
 */
export const getLeaderboard = async (
  mode?: 'single' | 'multiplayer',
  limit?: number
): Promise<APIResponse<LeaderboardEntry[]>> => {
  try {
    const params: any = {};
    if (mode) params.mode = mode;
    if (limit) params.limit = limit;

    console.log('Fetching leaderboard:', params);
    const response = await api.get<APIResponse<LeaderboardEntry[]>>('/game/leaderboard', { params });
    console.log('Leaderboard fetched successfully');
    return response.data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
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
