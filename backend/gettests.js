import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';  // Import GridFSBucket to fetch the file data
import dotenv from 'dotenv';
import testcase from './models/testcase.model.js'; // Assuming TestCase model is defined

dotenv.config();

// MongoDB connection
mongoose.connect(process.env.URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    serverSelectionTimeoutMS: 5000, 
    socketTimeoutMS: 5000
}).then(() => {
    console.log("MongoDB connected successfully");
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});

// Create GridFS bucket after connecting to MongoDB
const conn = mongoose.connection;
let gfs;
conn.once('open', () => {
    gfs = new GridFSBucket(conn.db, { bucketName: 'uploads' });
    console.log("GridFS initialized successfully.");
});

// Function to check if a file exists in GridFS by metadata
const fileExists = async (fileId) => {
    if (!gfs) {
        console.error('GridFSBucket is not initialized yet.');
        return false;
    }

    try {
        // Check if file exists by querying GridFS metadata
        const files = await gfs.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
        return files.length > 0;
    } catch (error) {
        console.error("Error checking if file exists:", error);
        return false;
    }
};

// Function to retrieve file stream
const getFileStream = (fileId) => {
    try {
        return gfs.openDownloadStream(new mongoose.Types.ObjectId(fileId));
    } catch (error) {
        console.error(`Error retrieving file stream for fileId ${fileId}:`, error);
        return null;
    }
};

// Debugging the test case file existence
export const getTestCases = async (problemName) => {
    try {
        const testCases = await testcase.find({ name: problemName });
        console.log('Test cases:', testCases);

        if (testCases.length === 0) {
            console.log('No test cases found for the given problem name.');
            return { error: 'No test cases found for the given problem name.' };
        }

        const testCaseResults = [];

        // Process all test cases in parallel
        await Promise.all(testCases.map(async (testCase) => {
            const tests = testCase.tests;

            await Promise.all(tests.map(async (test) => {
                const { inputFileId, outputFileId } = test;

                console.log('Test inputFileId:', inputFileId, 'outputFileId:', outputFileId);

                if (!inputFileId || !outputFileId ||
                    !mongoose.Types.ObjectId.isValid(inputFileId) ||
                    !mongoose.Types.ObjectId.isValid(outputFileId)) {
                    console.log('Invalid file IDs:', inputFileId, outputFileId);
                    return;
                }

                // Check if the files exist in parallel
                const [inputFileExists, outputFileExists] = await Promise.all([
                    fileExists(inputFileId),
                    fileExists(outputFileId),
                ]);

                if (!inputFileExists || !outputFileExists) {
                    console.log(`File not found for inputFileId: ${inputFileId} or outputFileId: ${outputFileId}`);
                    return;
                }

                // Retrieve file streams in parallel
                const [inputStream, outputStream] = await Promise.all([
                    getFileStream(inputFileId),
                    getFileStream(outputFileId),
                ]);

                if (!inputStream || !outputStream) {
                    console.log(`Error retrieving file streams for inputFileId: ${inputFileId} or outputFileId: ${outputFileId}`);
                    return;
                }

                // Read file data asynchronously
                const inputData = await streamToString(inputStream);
                const outputData = await streamToString(outputStream);

                testCaseResults.push({
                    name: testCase.name,
                    input: inputData,
                    output: outputData,
                });
            }));
        }));

        return { testCases: testCaseResults };
    } catch (error) {
        console.error("Error retrieving test cases:", error);
        return { error: 'Error retrieving test cases.' };
    }
};

// Utility function to convert a stream to a string (async/await)
const streamToString = (stream) => {
    return new Promise((resolve, reject) => {
        let data = '';
        stream.on('data', chunk => data += chunk.toString());
        stream.on('end', () => resolve(data));
        stream.on('error', reject);
    });
};
