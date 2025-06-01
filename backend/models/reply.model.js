import { Schema, model } from 'mongoose';

const replySchema = new Schema({
  questionId: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
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
  parentReplyId: {
    type: Schema.Types.ObjectId,
    ref: 'Reply',
    default: null,
  },
  mentions: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  isAnswer: {
    type: Boolean,
    default: false,
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

export default model('Reply', replySchema);
