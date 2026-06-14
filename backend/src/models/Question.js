import mongoose from 'mongoose';

/**
 * Question Schema
 * Stores GATE CSE questions with complete details
 */
const questionSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Topic is required'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 2000,
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
    },
    options: {
      type: [String],
      required: [true, 'Options are required'],
      validate: {
        validator: (v) => v.length === 4,
        message: 'Exactly 4 options are required',
      },
    },
    correctOption: {
      type: Number,
      required: [true, 'Correct option index is required'],
      enum: [0, 1, 2, 3],
    },
    explanation: {
      type: String,
      required: [true, 'Explanation is required'],
    },
    marks: {
      type: Number,
      default: 1,
      enum: [1, 2],
    },
    negativeMarks: {
      type: Number,
      default: 0.33,
    },
  },
  { timestamps: true }
);

// Index for faster queries
questionSchema.index({ subjectId: 1, topicId: 1, year: 1 });

export default mongoose.model('Question', questionSchema);
