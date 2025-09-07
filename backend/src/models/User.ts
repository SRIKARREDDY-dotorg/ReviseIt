import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  githubId: string;
  username: string;
  email: string;
  avatarUrl: string;
  accessToken: string;
  repositories: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  githubId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  avatarUrl: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  repositories: [{
    type: String
  }]
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
