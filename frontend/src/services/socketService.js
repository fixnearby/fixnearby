// frontend/src/services/socketService.js
import { io } from 'socket.io-client';
const BACKEND_URL =  `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}`;

let socket = null;
export const connectSocket = () => {
  if (socket && socket.connected) {
    
    return socket;
  }
  
  socket = io(BACKEND_URL, {
    withCredentials: true,
  });
  socket.on('connect', () => {
   
  });

  socket.on('disconnect', (reason) => {
    
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error.message);
  });
  socket.on('chatError', (errorMessage) => {
    console.error('Chat Error from server:', errorMessage);
 
  });
  socket.on('chatEnded', (message) => {
    console.warn('Chat ended by server:', message);
  });

  return socket;
};
export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  
  }
  socket = null; 
};

export const getSocket = () => {
  if (!socket) {
    console.warn('Socket not connected. Call connectSocket() first.');
    return null;
  }
  return socket;
};

export const joinChatRoom = (conversationId) => {
  if (socket && socket.connected) {
    socket.emit('joinRoom', conversationId);
    
  } else {
    console.warn('Cannot join room: Socket not connected.');
  }
};
export const sendMessage = (messageData) => {
  if (socket && socket.connected) {
    socket.emit('sendMessage', messageData);
  } else {
    console.warn('Cannot send message: Socket not connected.');
  }
};

export const onEvent = (event, callback) => {
  if (socket) {
    socket.on(event, callback);
  } else {
    console.warn(`Socket not connected, cannot listen to event: ${event}`);
  }
};

export const offEvent = (event, callback) => {
  if (socket) {
    socket.off(event, callback);
  }
};
