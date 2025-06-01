import mongoose from 'mongoose';

const solutionSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Types.ObjectId,
        ref: 'Problem'
    },
    cppSolution: {
        type: String,
        default: '',
    },
    javaSolution: {
        type: String,
        default: '',
    },
    pythonSolution: {
        type: String,
        default: '',
    }
});

export default mongoose.model('Solution', solutionSchema);