import mongoose, { Document, Schema } from 'mongoose';

export interface IProblem extends Document {
  userId: mongoose.Types.ObjectId;
  leetcodeUrl: string;
  title: string;
  solutionCode: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  patterns: string[];
  confidenceScore: number;
  lastRevised: Date;
  revisionCount: number;
  githubFilePath: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProblemSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  leetcodeUrl: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  solutionCode: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  topics: [{
    type: String
  }],
  patterns: [{
    type: String
  }],
  confidenceScore: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  lastRevised: {
    type: Date,
    default: Date.now
  },
  revisionCount: {
    type: Number,
    default: 0
  },
  githubFilePath: {
    type: String,
    required: true
  },
  timeComplexity: {
    type: String
  },
  spaceComplexity: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
ProblemSchema.index({ userId: 1, lastRevised: 1 });
ProblemSchema.index({ userId: 1, difficulty: 1 });
ProblemSchema.index({ userId: 1, topics: 1 });
ProblemSchema.index({ userId: 1, confidenceScore: 1 });

export default mongoose.model<IProblem>('Problem', ProblemSchema);
