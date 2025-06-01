import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { GridFSBucket } from 'mongodb';
import express from 'express';
import dotenv from 'dotenv'

dotenv.config();

// Initialize express app
const app = express();

// MongoDB connection using Mongoose
mongoose.connect(process.env.URI)
  .then(() => {
    console.log('Connected successfully to MongoDB');

    // Start the Express server
    app.listen(process.env.PORT || 8000, (error) => {
      if (error) console.log(error);
      console.log('Running Successfully at : ' + (process.env.PORT || 8000));
    });

    // Proceed with storing the test cases after MongoDB is connected
    storeTestCases();
  })
  .catch((error) => {
    console.log('Error occurred during MongoDB connection: ', error);
  });

// Local directory where your problem test cases are stored
const localDirectory = './Two Sum'; // Replace with your actual directory path

async function storeTestCases() {
  try {
    const db = mongoose.connection.db; // Get the raw MongoDB database object
    const bucket = new GridFSBucket(db, { bucketName: 'test_case_files' });

    // Read all files in the "Two Sum" directory
    const files = fs.readdirSync(localDirectory);
    const inputFiles = files.filter(file => file.startsWith('input') && file.endsWith('.txt'));
    const outputFiles = files.filter(file => file.startsWith('output') && file.endsWith('.txt'));

    // Sort the files to ensure proper matching of input-output pairs
    inputFiles.sort();
    outputFiles.sort();

    if (inputFiles.length !== outputFiles.length) {
      console.error('Mismatch between input and output files!');
      return;
    }

    // Store input-output pairs in MongoDB
    for (let i = 0; i < inputFiles.length; i++) {
      const inputFilePath = path.join(localDirectory, inputFiles[i]);
      const outputFilePath = path.join(localDirectory, outputFiles[i]);

      const inputFileContent = fs.readFileSync(inputFilePath, 'utf8');
      const outputFileContent = fs.readFileSync(outputFilePath, 'utf8');

      // Store input as a file in GridFS
      const inputFile = bucket.openUploadStream(`${inputFiles[i]}`, { metadata: { type: 'input' } });
      inputFile.write(inputFileContent);
      inputFile.end();
      console.log(`Stored ${inputFiles[i]} in GridFS`);

      // Store output as a file in GridFS
      const outputFile = bucket.openUploadStream(`${outputFiles[i]}`, { metadata: { type: 'output' } });
      outputFile.write(outputFileContent);
      outputFile.end();
      console.log(`Stored ${outputFiles[i]} in GridFS`);
    }

    console.log('Test cases successfully stored in MongoDB GridFS');
  } catch (error) {
    console.error('Error storing test cases:', error);
  }
}
