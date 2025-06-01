import mongoose from 'mongoose';
import fs from 'fs';
import { GridFSBucket } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

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
  gfs = new GridFSBucket(conn.db, { bucketName: 'fs' });
  console.log("GridFS initialized successfully.");

  // After initialization, call readFile to fetch a file from GridFS
  readFile('Two Sum/input1.txt');  // Replace with your GridFS file name
});

// Function to read a file from GridFS
const readFile = (fileName) => {
  if (!gfs) {
    console.error("GridFS is not initialized.");
    return;
  }

  // Create a download stream for the file from GridFS by its filename
  const downloadStream = gfs.openDownloadStreamByName(fileName);

  // Ensure the directory exists before attempting to write the file
  const dir = path.dirname(`./downloaded_${fileName}`);  // Get the directory name from the file path

  // Create the directory if it doesn't exist
  fs.mkdirSync(dir, { recursive: true });

  // Pipe the GridFS stream to a local file
  const writeStream = fs.createWriteStream(`./downloaded_${fileName}`); // Path where the file will be saved
  downloadStream.pipe(writeStream);

  downloadStream.on('end', () => {
    console.log(`File downloaded successfully: ${fileName}`);
  });

  downloadStream.on('error', (err) => {
    console.error("Error downloading file:", err);
  });
};
