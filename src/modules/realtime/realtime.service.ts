import http from 'http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { JWT_ACCESS_TOKEN_SECRET, REDIS_URL } from '@/config';
import logger from '@/utils/logger';

let io: Server | undefined;

type RealtimeEvent = 'like:new' | 'match:created' | 'interest:accepted';

export const initRealtime = async (server: http.Server) => {
  io = new Server(server, {
    cors: { origin: '*' },
    path: '/ws',
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.toString().replace('Bearer ', '');
      if (!token) return next(new Error('Unauthorized'));
      const payload = jwt.verify(token, JWT_ACCESS_TOKEN_SECRET as string) as any;
      socket.data.accountId = payload.accountId;
      next();
    } catch (error) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const accountId = socket.data.accountId;
    if (accountId) socket.join(`account:${accountId}`);
  });

  if (REDIS_URL) {
    const pubClient = createClient({ url: REDIS_URL });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    logger.info('Socket.io Redis adapter connected');
  }

  logger.info('Realtime gateway initialized');
};

export const realtimeService = {
  emitToAccount(accountId: string, event: RealtimeEvent, payload: object) {
    io?.to(`account:${accountId}`).emit(event, payload);
  },
};
