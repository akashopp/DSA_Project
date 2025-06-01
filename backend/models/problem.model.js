import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  problemName: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

// Default export
const Problem = mongoose.model('Problem', problemSchema);
export default Problem;  // Use default export