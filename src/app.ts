import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { requestId } from './middleware/requestId';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { router } from './routes';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGINS === '*' ? '*' : config.CORS_ORIGINS.split(','),
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
    skip: () => config.NODE_ENV === 'test',
  }),
);

app.use(requestId);

app.use(
  '/api',
  rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  }),
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', environment: config.NODE_ENV, timestamp: new Date().toISOString() });
});

app.use('/api/v1', router);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
