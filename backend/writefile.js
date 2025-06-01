import mongoose from 'mongoose';
import fs from 'fs';
import { GridFSBucket } from 'mongodb';  // Correct import for GridFSBucket
import dotenv from 'dotenv';

// MongoDB connection URI
dotenv.config();

mongoose.connect(process.env.URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected successfully.");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Wait until MongoDB connection is open
const conn = mongoose.connection;
let gfs;

// Once MongoDB connection is established, initialize GridFSBucket
conn.once('open', () => {
  console.log("MongoDB connection established. Initializing GridFS...");
  gfs = new GridFSBucket(conn.db, { bucketName: 'fs' }); // Initialize GridFSBucket
  console.log("GridFS initialized successfully.");

  // Proceed with file upload after GridFS initialization
  uploadFile('Two Sum/input1.txt');  // Provide the file path to upload
});

// Function to upload a file to GridFS
const uploadFile = (filePath) => {
  if (!gfs) {
    console.error("GridFS is not initialized.");
    return;
  }

  const fileStream = fs.createReadStream(filePath); // Create a read stream from the file

  // Open an upload stream to GridFS with the file name
  const uploadStream = gfs.openUploadStream(filePath);
  fileStream.pipe(uploadStream); // Pipe the file stream into the GridFS upload stream

  uploadStream.on('finish', () => {
    console.log(`File uploaded successfully: ${filePath}`);
  });

  uploadStream.on('error', (error) => {
    console.error("Error uploading file:", error);
  });
};