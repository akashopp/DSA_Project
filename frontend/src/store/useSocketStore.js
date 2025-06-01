import { create } from 'zustand';
import { io } from 'socket.io-client';

export const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  subscriptions: new Set(),

  connectSocket: (userId) => {
    if (get().socket) return;

    const socket = io('http://localhost:5000', {
      auth: { userId },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      set({ isConnected: false, subscriptions: new Set() });
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, subscriptions: new Set() });
    }
  },

  subscribeTo: (channel) => {
    const { socket, subscriptions } = get();
    if (!socket || subscriptions.has(channel)) return;
    // console.log('channel is : ', channel);
    socket.emit('subscribe', channel);
    subscriptions.add(channel);
    set({ subscriptions: new Set(subscriptions) }); // trigger reactivity
  },

  unsubscribeFrom: (channel) => {
    const { socket, subscriptions } = get();
    if (!socket || !subscriptions.has(channel)) return;

    socket.emit('unsubscribe', channel);
    subscriptions.delete(channel);
    set({ subscriptions: new Set(subscriptions) });
  },

  // Useful when switching between discussions
  switchDiscussionRoom: (newId) => {
    const { unsubscribeFrom, subscribeTo, subscriptions } = get();
    for (const sub of subscriptions) {
      if (sub.startsWith('discussion:')) unsubscribeFrom(sub);
    }
    if(newId !== null) subscribeTo(`discussion:${newId}`);
  },
}));