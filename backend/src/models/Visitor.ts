import mongoose, { Schema, Document } from 'mongoose';

export interface IVisitor extends Document {
  nama: string;
  instansi: string;
  jabatan: string;
  noHandphone: string;
  registeredAt: Date;
  ipAddress?: string;
}

const VisitorSchema = new Schema<IVisitor>({
  nama: {
    type: String,
    required: [true, 'Nama harus diisi'],
    trim: true,
    minlength: [2, 'Nama minimal 2 karakter'],
  },
  instansi: {
    type: String,
    required: [true, 'Instansi harus diisi'],
    trim: true,
  },
  jabatan: {
    type: String,
    required: [true, 'Jabatan harus diisi'],
    trim: true,
  },
  noHandphone: {
    type: String,
    required: [true, 'Nomor handphone harus diisi'],
    validate: {
      validator: function(v: string) {
        return /^(\+62|62|0)[0-9]{9,12}$/.test(v);
      },
      message: 'Format nomor handphone tidak valid',
    },
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
  ipAddress: {
    type: String,
  },
});

// Index for faster queries
VisitorSchema.index({ registeredAt: -1 });
VisitorSchema.index({ nama: 'text', instansi: 'text' });

export default mongoose.model<IVisitor>('Visitor', VisitorSchema);
