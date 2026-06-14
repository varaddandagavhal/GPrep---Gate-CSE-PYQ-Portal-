import mongoose from 'mongoose';

/**
 * TestAttempt Schema
 * Stores details of each test attempt including proctoring violations
 */
const testAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    questions: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
          required: true,
        },
        selectedOption: {
          type: Number,
          default: null,
        },
        isMarkedForReview: {
          type: Boolean,
          default: false,
        },
        timeSpent: {
          type: Number,
          default: 0,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
      },
    ],
    totalScore: {
      type: Number,
      default: 0,
    },
    maxScore: {
      type: Number,
      required: true,
    },
    violations: {
      type: Number,
      default: 0,
    },
    tabSwitchViolations: {
      type: Number,
      default: 0,
    },
    fullscreenExitViolations: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'aborted', 'zeroed_due_to_violation'],
      default: 'in-progress',
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    accuracy: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for user queries
testAttemptSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('TestAttempt', testAttemptSchema);
