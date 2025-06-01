import express from 'express';
import {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  replyToQuestion,
  markAsAnswer,
  getMentionSuggestions
} from '../controllers/discuss.controller.js';

const router = express.Router();

// Create a new question
router.post('/create', (req, res) => {
  console.log('req in router: ', req.session);
  createQuestion(req, res);
});

// Get all questions (sorted ascending)
router.get('/', getAllQuestions);

// Mention suggestion endpoint
router.get('/mention-suggestions', getMentionSuggestions);

// Get specific question by ID (including its replies)
router.get('/:id', getQuestionById);

// Reply to a question
router.post('/:id/reply', replyToQuestion);

// Mark a reply as the accepted answer
router.patch('/:questionId/resolve/:replyId', markAsAnswer);

export default router;
