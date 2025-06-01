import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import dotenv from 'dotenv';
import testcase from './models/testcase.model.js';
import pLimit from 'p-limit';

dotenv.config();

// Initialize variables
let gfsBucket;

// Function to connect to MongoDB and initialize GridFS
const initializeMongoDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected successfully.');

    const conn = mongoose.connection;
    gfsBucket = new GridFSBucket(conn.db, { bucketName: 'uploads' });

    console.log('GridFS initialized successfully.');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    throw err;  // Stop further execution if MongoDB connection fails
  }
};

// Function to upload a file to GridFS with a timeout and chunk size optimization
const uploadFileToGridFS = async (filePath) => {
  if (!gfsBucket) {
    throw new Error('GridFS is not initialized yet.');
  }

  console.log(`Preparing to upload file: ${filePath}`);
  if (!fs.existsSync(filePath)) {
    console.error(`File does not exist: ${filePath}`);
    throw new Error(`File not found: ${filePath}`);
  }

  const uploadStream = gfsBucket.openUploadStream(path.basename(filePath), { chunkSizeBytes: 1024 * 1024 }); // 1MB chunk size
  const fileStream = fs.createReadStream(filePath);

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      console.error('File upload timed out');
      reject(new Error('Upload timed out'));
    }, 5000);  // 5 seconds timeout for upload

    fileStream.pipe(uploadStream);

    uploadStream.on('finish', () => {
      clearTimeout(timer);
      console.log(`File uploaded successfully: ${filePath} (ID: ${uploadStream.id})`);
      resolve(uploadStream.id);
    });

    uploadStream.on('error', (err) => {
      clearTimeout(timer);
      console.error(`Error uploading file: ${filePath}`, err);
      reject(err);
    });
  });
};

// Function to check if a file exists in GridFS
const checkIfFileExistsInGridFS = async (fileId) => {
  try {
    const file = await gfsBucket.find({ _id: fileId }).toArray();
    if (file.length > 0) {
      console.log(`File with ID ${fileId} exists in GridFS.`);
    } else {
      console.error(`File with ID ${fileId} does not exist in GridFS.`);
    }
  } catch (err) {
    console.error('Error querying GridFS for file:', err);
  }
};

// Function to save test cases from directory
const saveTestCasesFromDirectory = async (problemName, directoryPath) => {
  try {
    const files = fs.readdirSync(directoryPath);
    const testCaseData = [];
    const limit = pLimit(5);  // Limit concurrency to 5 uploads at once

    // Map files to upload concurrently with the concurrency limit
    const uploadPromises = files.map((fileName, index) => {
      const filePath = path.join(directoryPath, fileName);
      
      return limit(async () => {
        console.log(`Processing file: ${fileName} at path ${filePath}`);

        if (fileName.startsWith('input') && fileName.endsWith('.txt')) {
          const outputFileName = `output${index + 1}.txt`;
          const outputFilePath = path.join(directoryPath, outputFileName);

          console.log(`Checking for output file: ${outputFilePath}`);
          if (!fs.existsSync(outputFilePath)) {
            console.error(`Output file not found: ${outputFilePath}`);
            return;
          }

          const inputFileId = await uploadFileToGridFS(filePath);
          await checkIfFileExistsInGridFS(inputFileId);

          const outputFileId = await uploadFileToGridFS(outputFilePath);
          await checkIfFileExistsInGridFS(outputFileId);

          console.log(`Input file ID: ${inputFileId}, Output file ID: ${outputFileId}`);
          testCaseData.push({ inputFileId, outputFileId });
        }
      });
    });

    // Wait for all file uploads to finish
    await Promise.all(uploadPromises);

    console.log('Test case data:', testCaseData);

    const testCases = new testcase({
      name: problemName,
      tests: testCaseData,
    });

    await testCases.save();
    console.log(`Test cases for "${problemName}" saved successfully!`);
  } catch (error) {
    console.error('Error saving test cases:', error);
  }
};

// Execute script
(async () => {
  try {
    await initializeMongoDB();  // Ensure MongoDB and GridFS are initialized

    const problemName = 'Two Sum';
    const directoryPath = path.resolve('Two Sum');

    // Create directory structure if necessary
    fs.mkdirSync(directoryPath, { recursive: true });

    console.log('Directory Path:', directoryPath);

    // Save test cases from the directory
    await saveTestCasesFromDirectory(problemName, directoryPath);
  } catch (error) {
    console.error('Unhandled error:', error);
  }
})();
