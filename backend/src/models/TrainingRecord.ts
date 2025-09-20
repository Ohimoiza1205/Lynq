import mongoose, { Document, Schema } from 'mongoose';

export interface ITrainingRecord extends Document {
  userId: string;
  videoId: string;
  status: 'started' | 'in_progress' | 'completed';
  watchTime: number;
  completionPercentage: number;
  quizAttempts: number;
  bestQuizScore: number;
  notes: string[];
  highlights: Array<{
    timestamp: number;
    text: string;
    createdAt: Date;
  }>;
  startedAt: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
}

const TrainingRecordSchema = new Schema<ITrainingRecord>({
  userId: { type: String, required: true },
  videoId: { type: String, required: true },
  status: { type: String, enum: ['started', 'in_progress', 'completed'], default: 'started' },
  watchTime: { type: Number, default: 0 },
  completionPercentage: { type: Number, default: 0 },
  quizAttempts: { type: Number, default: 0 },
  bestQuizScore: { type: Number, default: 0 },
  notes: [{ type: String }],
  highlights: [{
    timestamp: { type: Number, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  lastAccessedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

TrainingRecordSchema.index({ userId: 1, videoId: 1 }, { unique: true });

export const TrainingRecord = mongoose.model<ITrainingRecord>('TrainingRecord', TrainingRecordSchema);