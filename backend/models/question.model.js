import { Schema, model } from 'mongoose';

const questionSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  answers: [{
    type: Schema.Types.ObjectId,
    ref: 'Reply',
  }],
  isResolved: {
    type: Boolean,
    default: false,
  },
  resolvedAnswerId: {
    type: Schema.Types.ObjectId,
    ref: 'Reply',
    default: null,
  },
  views: {
    type: Number,
    default: 0,
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
  },
}, {
  timestamps: true,
});

export default model('Question', questionSchema);
