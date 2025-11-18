/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
// src/lib/websocket.ts
import { Server as SocketIOServer } from 'socket.io';
import { Server as NetServer } from 'http';

let io: SocketIOServer | null = null;

export function initWebSocket(server: NetServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // عضویت در اتاق‌های مختلف
    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // ترک اتاق
    socket.on('leave-room', (roomId: string) => {
      socket.leave(roomId);
      console.log(`User ${socket.id} left room ${roomId}`);
    });

    // چت آنلاین
    socket.on('send-message', (data: { roomId: string; message: string; userId: string }) => {
      socket.to(data.roomId).emit('new-message', {
        message: data.message,
        userId: data.userId,
        timestamp: new Date().toISOString(),
      });
    });

    // به‌روزرسانی وضعیت نوبت
    socket.on('appointment-updated', (data: { appointmentId: string; status: string }) => {
      socket.broadcast.emit('appointment-status-changed', data);
    });

    // هشدار نوبت همزمان
    socket.on('appointment-booking', (data: { serviceId: string; date: string; userId: string }) => {
      socket.broadcast.emit('concurrent-booking-attempt', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}