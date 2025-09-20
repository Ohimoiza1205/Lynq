 import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  auth0Id: string;
  email: string;
  role: 'uploader' | 'reviewer' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  auth0Id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['uploader', 'reviewer', 'admin'], default: 'reviewer' },
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', UserSchema);