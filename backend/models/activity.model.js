import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  activityType: {
    type: String,
    required: true,
    enum: [
      'solved',
      'wrong_answer',
      'compilation_error',
      'replied',
      'asked_question',
      'mentioned',
      'time_limit_exceeded',
    ],
  },
  activityDescription: {
    type: String,
    required: true,
  },
  link: {
    type: String,
  }
}, {
  timestamps: true,
});

export default mongoose.model('Activity', activitySchema);