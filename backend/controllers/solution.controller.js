import Solution from '../models/solution.model.js';

export const getSolution = async (req, res) => {
    try {
        const { id } = req.params;
        const solution = await Solution.findOne({ problemId: id });
        if(!solution) {
            return res.status(404).json({ message: "Solution for this problem not found "});
        }
        console.log('solution is : ', solution);
        res.status(200).json(solution);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
