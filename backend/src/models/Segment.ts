 import mongoose, { Document, Schema } from 'mongoose';

export interface ISegment extends Document {
  videoId: string;
  startSec: number;
  endSec: number;
  captions: string[];
  vector: number[];
  labels: string[];
  confidence: number;
  createdAt: Date;
}

const SegmentSchema = new Schema<ISegment>({
  videoId: { type: String, required: true },
  startSec: { type: Number, required: true },
  endSec: { type: Number, required: true },
  captions: [{ type: String }],
  vector: [{ type: Number }],
  labels: [{ type: String }],
  confidence: { type: Number, default: 0 }
}, {
  timestamps: true
});

SegmentSchema.index({ videoId: 1, startSec: 1 });

export const Segment = mongoose.model<ISegment>('Segment', SegmentSchema);