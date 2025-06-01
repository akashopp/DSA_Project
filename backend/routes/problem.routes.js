import express from 'express';
import Problem from '../models/problem.model.js';  // Use default import
const router = express.Router();

// Get all problems
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find({});
    return res.status(200).json(problems);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving problems' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findOne({ _id: id });
    return res.status(200).json(problem);
  } catch (error) {
    return res.status(500).json({ message: 'Error getting problem' });
  }
});

export default router;