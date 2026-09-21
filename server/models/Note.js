import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String, // ISO date string YYYY-MM-DD
      required: [true, 'Note date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'],
      index: true,
    },
    text: {
      type: String,
      default: '',
      trim: true,
      maxlength: [5000, 'Note cannot exceed 5000 characters'],
    },
  },
  {
    timestamps: true,
  }
);
noteSchema.index({ userId: 1, date: 1 }, { unique: true });

const Note = mongoose.model('Note', noteSchema);

export default Note;
