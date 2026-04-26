import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const requestId = (_req: Request, res: Response, next: NextFunction): void => {
  res.locals.requestId = uuidv4();
  res.setHeader('X-Request-Id', res.locals.requestId as string);
  next();
};
