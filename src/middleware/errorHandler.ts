import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const path = issue.path.join('.');
      errors[path] = errors[path] ?? [];
      errors[path].push(issue.message);
    }
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
    return;
  }

  if (err instanceof AppError) {
    if (!err.isOperational) logger.error(err);
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  logger.error('Unhandled error:', err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Internal server error',
  });
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Route not found' });
};
