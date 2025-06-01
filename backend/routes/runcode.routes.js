import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // For converting URL to file path
import { dirname } from 'path'; // For getting directory name from a file path
import { exec, spawn } from 'child_process';
import util from 'util';

const execPromisified = util.promisify(exec);
const router = express.Router();

// Get the current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __codes = path.join(__dirname, '..', 'user_codes');
console.log(__codes);

// Log directory paths
console.log("Current directory:", __dirname);

router.post('/compile', async (req, res) => {
  console.log('user : ', req.session);
  console.log('sid : ', req.sessionID);
  if(req.session.user == undefined) {
    return res.status(401).send({ output: 'User not signed in.' });
  }
  const userId = req.session.user.id;
  let { language, code } = req.body;
  if (!language || !code) {
    return res.status(400).send({ output: 'Language and code are required.' });
  }

  const filename =
    language === 'cpp'
      ? `${userId}.cpp`
      : language === 'java'
      ? `_${userId}.java`
      : `${userId}.py`;
  const execFileName =
    language === 'cpp'
      ? `${userId}.exe`
      : language === 'java'
      ? `_${userId}.class`
      : `${userId}.py`;

  const filePath = path.join(__codes, filename);
  const compiledFilePath = path.join(__codes, execFileName);

  console.log("Writing code to file:", filePath);
  if (language === 'java') {
    code = code.replace(/public\s+class\s+Solution/, `public class _${userId}`);
  }
  fs.writeFileSync(filePath, code);

  let compileCmd;
  if (language === 'cpp') {
    compileCmd = `g++ -o "${compiledFilePath}" "${filePath}"`;
  } else if (language === 'java') {
    compileCmd = `javac "${filePath}"`;
  } else if (language === 'python') {
    compileCmd = 'python --version'; // Python doesn't require compilation
  }

  try {
    console.log("Compilation command:", compileCmd);
    if (language !== 'python') {
      const { stderr } = await execPromisified(compileCmd, { timeout: 5000 });
      if (stderr) {
        console.error("Compilation error:", stderr);
        return res.status(500).send({ output: `Compilation Error: ${stderr}` });
      }
    }
    res.status(200).send({ message: 'Compilation successful.' });
  } catch (err) {
    console.error("Compilation exception:", err.message);
    return res.status(500).send({ output: `Compilation Error: ${err.message}` });
  }
});

router.post('/run', (req, res) => {
  const userId = req.session.user.id;
  const { language, input } = req.body;
  const execFileName =
    language === 'cpp'
      ? `${userId}.exe`
      : language === 'java'
      ? `_${userId}.class`
      : `${userId}.py`;

  const compiledFilePath = path.normalize(path.join(__codes, execFileName));

  console.log("Compiled file path:", compiledFilePath);

  if (!fs.existsSync(compiledFilePath)) {
    console.error("Executable file not found.");
    return res.status(400).send({ output: 'Executable file not found. Please compile the code first.' });
  }

  let runCmd;
  let processArgs = [];
  if (language === 'cpp') {
    runCmd = compiledFilePath;
  } else if (language === 'java') {
    runCmd = 'java';
    processArgs = ['-cp', __codes, `_${userId}`];
  } else if (language === 'python') {
    runCmd = 'pypy3';
    processArgs = [compiledFilePath];
  }

  console.log("Run command:", runCmd, "with args:", processArgs);

  const runProcess = spawn(runCmd, processArgs, { stdio: ['pipe', 'pipe', 'pipe'] });

  const timer = setTimeout(() => {
    console.error("Killing process due to timeout.");
    runProcess.kill('SIGKILL');
  }, 1500);

  if (input) {
    console.log("Providing input to the process.");
    runProcess.stdin.write(input);
    runProcess.stdin.end();
  }

  let output = '';
  let errors = '';

  runProcess.stdout.on('data', (data) => {
    output += data;
    console.log("Process stdout:", data.toString());
  });

  runProcess.stderr.on('data', (data) => {
    errors += data;
    console.error("Process stderr:", data.toString());
  });

  runProcess.on('close', (code) => {
    clearTimeout(timer);
    if (code !== 0) {
      console.error("Process exited with non-zero code:", code);
      return res.status(500).send({
        output: `${errors || 'Unknown runtime error / Timeout (Execution > 7s)'}`,
      });
    }
    res.send({ output: output || 'No output generated' });
  });
});

router.delete('/delete-executable', (req, res) => {
  if(req.session.user == undefined) {
    return res.status(401).send({output : 'User not signed in.'})
  }
  const userId = req.session.user.id;
  const { language } = req.body;

  const compiledFilePath =
    language === 'cpp'
      ? path.join(__codes, `${userId}.exe`)
      : language === 'java'
      ? path.join(__codes, `_${userId}.class`)
      : null;

  console.log("Attempting to delete file:", compiledFilePath);

  if (compiledFilePath && fs.existsSync(compiledFilePath)) {
    fs.unlink(compiledFilePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err.message);
        return res.status(500).send({ output: `Error deleting executable: ${err.message}` });
      }
      console.log("Deleted file successfully.");
      res.status(200).send({ message: 'Compiled executable deleted successfully.' });
    });
  } else {
    console.warn("File not found for deletion:", compiledFilePath);
    res.status(200).send({ output: 'Compiled file not found.' });
  }
});

// Ensure normalized paths for all file-related operations
function normalizePath(filepath) {
  return path.normalize(filepath);
}

// Submit route unchanged but logs added
router.post('/submit', async (req, res) => {
  const userId = req.session.user.id;
  const { language, problemName, testNumber } = req.body;
  console.log("Submit request for:", problemName, "Test:", testNumber);
  if (!problemName || !testNumber) {
    return res.status(400).send({ output: 'Problem name and test number are required.' });
  }

  const testCaseDir = normalizePath(path.join(__dirname, '..', 'testcases', problemName));
  const inputFile = normalizePath(path.join(testCaseDir, `input${testNumber}.txt`));
  const expectedOutputFile = normalizePath(path.join(testCaseDir, `output${testNumber}.txt`));
  console.log("Input file:", inputFile, "Expected output file:", expectedOutputFile);

  const execFileName =
    language === 'cpp'
      ? `${userId}.exe`
      : language === 'java'
      ? `_${userId}.class`
      : `${userId}.py`;

  const compiledFilePath = path.normalize(path.join(__codes, execFileName));

  console.log("Compiled file path:", compiledFilePath);

  if (!fs.existsSync(compiledFilePath)) {
    console.error("Executable file not found.");
    return res.status(400).send({ output: 'Executable file not found. Please compile the code first.' });
  }

  const inputStream = fs.createReadStream(inputFile);
  
  const child = spawn(
    language === 'cpp' ? compiledFilePath : language === 'java' ? 'java' : 'pypy3',
    language === 'java' ? ['-cp', __codes, `_${userId}`] : [compiledFilePath],
    { stdio: ['pipe', 'pipe', 'pipe'] }
  );

  // pipe input.txt into child stdin
  inputStream.pipe(child.stdin);

  const startTime = process.hrtime();

  const timer = setTimeout(() => {
    console.error("Killing process due to timeout.");
    child.kill('SIGKILL');
  }, 2000);

  let output = '';
  let errors = '';

  child.stdout.on('data', (data) => {
    output += data;
    console.log("Child stdout:", data.toString());
  });

  child.stderr.on('data', (data) => {
    errors += data;
    console.error("Child stderr:", data.toString());
  });

  child.on('close', (code) => {
    clearTimeout(timer);

    const runtime = code === 0 ? `${process.hrtime(startTime)[1] / 1e6}ms` : 'na';

    if (code !== 0) {
      console.error("Child process exited with non-zero code:", code);
      return res.status(500).send({ output: `Runtime Error: ${errors || 'Time Limit Exceeded'}`, runtime });
    }

    const expectedOutput = fs.readFileSync(expectedOutputFile, 'utf8');
    const isPass = output.trim() === expectedOutput.trim();
    const status = isPass ? 'Passed' : 'Failed';
    const message = isPass
      ? 'Test passed successfully'
      : `Expected: ${expectedOutput.trim()}, but got: ${output.trim()}`;
    console.log('Output:', output.trim());
    console.log('Expected:', expectedOutput.trim());
    console.log('Status:', status);
    console.log('Runtime:', runtime);
    res.send({ output: output.trim(), status, message, runtime });
  });
});

export default router;
