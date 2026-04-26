import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as authService from './auth.service';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/response';
import { AuthenticatedRequest } from '../../types';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.register(req.body);
    sendCreated(res, result, 'Registration successful');
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, result, StatusCodes.OK, 'Login successful');
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tokens = await authService.refresh(req.body.refreshToken);
    sendSuccess(res, tokens);
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await authService.logout(req.user.sub);
    sendNoContent(res);
  } catch (err) {
    next(err);
  }
};

export const me = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    sendSuccess(res, req.user);
  } catch (err) {
    next(err);
  }
};
