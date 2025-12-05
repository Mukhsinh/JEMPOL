import mongoose, { Schema, Document } from 'mongoose';

export interface IInnovation extends Document {
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

const InnovationSchema = new Schema<IInnovation>({
  title: {
    type: String,
    required: [true, 'Judul harus diisi'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Deskripsi harus diisi'],
  },
  type: {
    type: String,
    enum: ['powerpoint', 'video'],
    required: [true, 'Tipe file harus diisi'],
  },
  fileUrl: {
    type: String,
    required: [true, 'URL file harus diisi'],
  },
  fileName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
  },
  uploadedBy: {
    type: String,
    default: 'admin',
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  views: {
    type: Number,
    default: 0,
  },
});

// Index for faster queries
InnovationSchema.index({ uploadedAt: -1 });
InnovationSchema.index({ type: 1 });

export default mongoose.model<IInnovation>('Innovation', InnovationSchema);
