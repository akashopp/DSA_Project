import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES Modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { problemName } = req.body;
    console.log("Problem name:", problemName);

    if (!problemName) {
      return res.status(400).json({ message: 'Problem name is required.' });
    }

    // Build the absolute path for the test cases directory
    const testCaseDirectory = path.join(__dirname, '../testcases', problemName);

    // Normalize the path for compatibility across OS
    const finalPath = path.resolve(testCaseDirectory);

    console.log("Resolved test case directory:", finalPath);

    // Check if the directory exists
    if (!fs.existsSync(finalPath)) {
      console.log("Directory does not exist:", finalPath);
      return res.status(404).json({ message: 'Test cases directory not found.' });
    }

    // Read all files in the directory
    const files = fs.readdirSync(finalPath);
    const testCaseNumbers = files
      .filter(file => file.startsWith('input') && file.endsWith('.txt'))
      .map(file => parseInt(file.replace('input', '').replace('.txt', ''), 10))
      .sort((a, b) => a - b);

    if (testCaseNumbers.length === 0) {
      return res.status(404).json({ message: 'No test cases found for this problem.' });
    }

    res.json({ tests: testCaseNumbers });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: 'Server error while fetching test cases.' });
  }
});

export default router;