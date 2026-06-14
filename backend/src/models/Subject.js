import mongoose from 'mongoose';

/**
 * Subject Schema
 * Stores GATE CSE subject information
 */
const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Subject', subjectSchema);
