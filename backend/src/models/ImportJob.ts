 import mongoose, { Document, Schema } from 'mongoose';

export interface IImportJob extends Document {
  queries: string[];
  filters: {
    publishedAfter?: Date;
    duration?: string;
    language?: string;
  };
  tags: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  counts: {
    total: number;
    processed: number;
    successful: number;
    failed: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ImportJobSchema = new Schema<IImportJob>({
  queries: [{ type: String, required: true }],
  filters: {
    publishedAfter: { type: Date },
    duration: { type: String },
    language: { type: String }
  },
  tags: [{ type: String }],
  status: { type: String, enum: ['pending', 'running', 'completed', 'failed'], default: 'pending' },
  counts: {
    total: { type: Number, default: 0 },
    processed: { type: Number, default: 0 },
    successful: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

export const ImportJob = mongoose.model<IImportJob>('ImportJob', ImportJobSchema);