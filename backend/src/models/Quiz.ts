 import mongoose, { Document, Schema } from 'mongoose';

interface QuizItem {
  id: string;
  type: 'mcq' | 'short' | 'identify';
  question: string;
  options?: string[];
  correctAnswer: string;
  timestamp: number;
  explanation?: string;
}

export interface IQuiz extends Document {
  videoId: string;
  items: QuizItem[];
  generatedAt: Date;
}

const QuizItemSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'short', 'identify'], required: true },
  question: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  timestamp: { type: Number, required: true },
  explanation: { type: String }
});

const QuizSchema = new Schema<IQuiz>({
  videoId: { type: String, required: true },
  items: [QuizItemSchema],
  generatedAt: { type: Date, default: Date.now }
});

export const Quiz = mongoose.model<IQuiz>('Quiz', QuizSchema);