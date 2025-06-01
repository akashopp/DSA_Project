import mongoose from 'mongoose';

const TestCaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  tests: [
    {
      inputFileId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      outputFileId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    },
  ],
});

const testcase = mongoose.model('testcase', TestCaseSchema);
export default testcase;