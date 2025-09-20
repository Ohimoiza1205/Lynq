 import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  videoId: string;
  type: 'phase' | 'anomaly' | 'topic';
  startSec: number;
  endSec: number;
  score: number;
  notes: string;
  createdAt: Date;
}

const EventSchema = new Schema<IEvent>({
  videoId: { type: String, required: true },
  type: { type: String, enum: ['phase', 'anomaly', 'topic'], required: true },
  startSec: { type: Number, required: true },
  endSec: { type: Number, required: true },
  score: { type: Number, default: 0 },
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

EventSchema.index({ videoId: 1, type: 1 });

export const Event = mongoose.model<IEvent>('Event', EventSchema);