import mongoose, { Schema, Document } from 'mongoose';

export interface IGameScore extends Document {
  playerName: string;
  score: number;
  mode: 'single' | 'multiplayer';
  level: number;
  duration: number;
  playedAt: Date;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

const GameScoreSchema = new Schema<IGameScore>({
  playerName: {
    type: String,
    required: [true, 'Nama pemain harus diisi'],
    trim: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
  },
  mode: {
    type: String,
    enum: ['single', 'multiplayer'],
    required: true,
  },
  level: {
    type: Number,
    default: 1,
  },
  duration: {
    type: Number,
    required: true,
  },
  playedAt: {
    type: Date,
    default: Date.now,
  },
  deviceType: {
    type: String,
    enum: ['mobile', 'tablet', 'desktop'],
    required: true,
  },
});

// Index for leaderboard queries
GameScoreSchema.index({ score: -1, playedAt: -1 });
GameScoreSchema.index({ mode: 1, score: -1 });

export default mongoose.model<IGameScore>('GameScore', GameScoreSchema);
