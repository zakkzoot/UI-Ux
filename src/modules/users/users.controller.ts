import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { sendSuccess, sendNoContent, sendPaginated } from '../../utils/response';
import * as usersService from './users.service';

export const getAll = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await usersService.findAll(page, limit);
    sendPaginated(res, result);
  } catch (err) {
    next(err);
  }
};

export const getById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await usersService.findById(req.params.id);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};

export const updateById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await usersService.updateById(
      req.params.id,
      req.user.sub,
      req.user.role,
      req.body,
    );
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};

export const deleteById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await usersService.deleteById(req.params.id);
    sendNoContent(res);
  } catch (err) {
    next(err);
  }
};
