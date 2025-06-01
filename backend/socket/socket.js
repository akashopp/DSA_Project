import { Server } from 'socket.io';
import sharedSession from 'express-socket.io-session';

let io;
const onlineUsers = new Map(); // userId => Set of socketIds

export const initSocket = (httpServer, sessionMiddleware) => {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use(sharedSession(sessionMiddleware, {
    autoSave: true,
  }));

  io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId || socket.handshake.session?.user?.id;
    console.log(`User connected: ${userId}`);

    // Track user as online
    if (userId) {
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);
      emitOnlineUsers(); // Optionally notify all users
    }

    // Dynamic room subscriptions
    socket.on('subscribe', (channel) => {
      socket.join(channel);
      console.log(`User ${userId} joined ${channel}`);
    });

    socket.on('unsubscribe', (channel) => {
      socket.leave(channel);
      console.log(`User ${userId} left ${channel}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
      if (userId && onlineUsers.has(userId)) {
        const userSockets = onlineUsers.get(userId);
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
        }
        emitOnlineUsers();
      }
    });
  });

  return io;
};

// Utility to emit list of online users
const emitOnlineUsers = () => {
  const users = Array.from(onlineUsers.keys());
  io.emit('onlineUsers', users);
};

// Accessors
export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

export const getOnlineUsers = () => {
  return onlineUsers;
};