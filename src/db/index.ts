import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { logger } from '../utils/logger';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      config.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
          ]
        : [{ emit: 'event', level: 'error' }],
  });

if (config.NODE_ENV === 'development') {
  (db as PrismaClient & { $on: Function }).$on('query', (e: { query: string; duration: number }) => {
    logger.debug(`Query: ${e.query} (${e.duration}ms)`);
  });
  globalForPrisma.prisma = db;
}
