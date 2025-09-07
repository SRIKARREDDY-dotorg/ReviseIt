import mongoose, { Document, Schema } from 'mongoose';

export interface IRevisionSession extends Document {
  problemId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  performanceScore: number;
  timeTaken: number;
  notes: string;
  wasCorrect: boolean;
  difficultyRating: number;
  createdAt: Date;
}

const RevisionSessionSchema: Schema = new Schema({
  problemId: {
    type: Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  performanceScore: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  timeTaken: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  wasCorrect: {
    type: Boolean,
    required: true
  },
  difficultyRating: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
RevisionSessionSchema.index({ userId: 1, date: -1 });
RevisionSessionSchema.index({ problemId: 1, date: -1 });

export default mongoose.model<IRevisionSession>('RevisionSession', RevisionSessionSchema);
