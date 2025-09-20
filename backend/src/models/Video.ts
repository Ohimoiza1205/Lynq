import mongoose, { Document, Schema } from 'mongoose';

export interface IVideo extends Document {
  ownerId: string;
  source: 'upload' | 'youtube';
  videoId?: string;
  title: string;
  description?: string;
  watchUrl?: string;
  track: string;
  status: 'uploaded' | 'indexing' | 'ready' | 'failed';
  tlVideoId?: string;
  durationSec?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema = new Schema<IVideo>({
  ownerId: { type: String, required: true },
  source: { type: String, enum: ['upload', 'youtube'], required: true },
  videoId: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  watchUrl: { type: String },
  track: { type: String, default: 'healthcare' },
  status: { type: String, enum: ['uploaded', 'indexing', 'ready', 'failed'], default: 'uploaded' },
  tlVideoId: { type: String },
  durationSec: { type: Number },
  tags: [{ type: String }]
}, {
  timestamps: true
});

export const Video = mongoose.model<IVideo>('Video', VideoSchema);