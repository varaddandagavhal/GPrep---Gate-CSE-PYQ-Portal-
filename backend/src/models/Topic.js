import mongoose from 'mongoose';

/**
 * Topic Schema
 * Stores topics under each subject
 */
const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Topic name is required'],
      trim: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required'],
    },
  },
  { timestamps: true }
);

// Compound index for unique topic per subject
topicSchema.index({ name: 1, subjectId: 1 }, { unique: true });

export default mongoose.model('Topic', topicSchema);
