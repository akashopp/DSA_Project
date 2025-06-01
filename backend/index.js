import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';
import { initSocket } from './socket/socket.js'; // 👈 WebSocket logic

// Routes
import testCaseRoutes from './routes/testcases.routes.js';
import userRoutes from './routes/user.routes.js';
import problemRoutes from './routes/problem.routes.js';
import runcodeRoutes from './routes/runcode.routes.js';
import discussRoutes from './routes/discuss.routes.js';
import solutionRoutes from './routes/solution.routes.js';

dotenv.config();
const app = express();
const server = http.createServer(app); // 👈 Create raw HTTP server for WebSocket
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.URI,
    collectionName: 'sessions',
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
  },
});

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));
app.use(bodyParser.json());
app.use(sessionMiddleware); // 👈 Register session middleware before routes

// MongoDB connection
mongoose.connect(process.env.URI).then(() => {
  console.log("Connected to MongoDB");

  // WebSocket initialization
  initSocket(server, sessionMiddleware); // 👈 Attach socket server to http server

  // Routes
  app.use('/testcases', testCaseRoutes);
  app.use('/user', userRoutes);
  app.use('/problems', problemRoutes);
  app.use('/runcode', runcodeRoutes);
  app.use('/discuss', discussRoutes);
  app.use('/solution', solutionRoutes);

  app.use((req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    next();
  });

  app.get('/', (req, res) => {
    req.session.visited = true;
    res.status(201).send({ msg: "hello", sessionId: req.session.id });
  });

  // Start server
  server.listen(process.env.PORT || 5000, () => {
    console.log(`Server running at http://localhost:${process.env.PORT || 5000}`);
  });
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});
