import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initiateSocketConnection = (userId: string, role: string) => {
  if (socket) return socket;

  socket = io('http://localhost:5000', {
    transports: ['websocket', 'polling'],
  });

  socket.emit('register', { userId, role });
  console.log('🔌 Socket connection registered for user:', userId, role);

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 Socket disconnected');
  }
};

export const getSocket = () => socket;
