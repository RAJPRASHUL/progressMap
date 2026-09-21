import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Task title cannot exceed 200 characters'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    date: {
      type: String, // ISO date string YYYY-MM-DD (local date)
      required: [true, 'Task date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'],
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);
taskSchema.index({ userId: 1, date: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
