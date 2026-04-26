import { app } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { db } from './db';

const shutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received, shutting down gracefully`);
  await db.$disconnect();
  process.exit(0);
};

const start = async (): Promise<void> => {
  await db.$connect();
  logger.info('Database connected');

  const server = app.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
  });

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection:', reason);
    server.close(() => process.exit(1));
  });
};

start().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
