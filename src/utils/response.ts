import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse, PaginatedResult } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = StatusCodes.OK,
  message?: string,
): void => {
  const response: ApiResponse<T> = { success: true, data, message };
  res.status(statusCode).json(response);
};

export const sendCreated = <T>(res: Response, data: T, message?: string): void => {
  sendSuccess(res, data, StatusCodes.CREATED, message);
};

export const sendNoContent = (res: Response): void => {
  res.status(StatusCodes.NO_CONTENT).send();
};

export const sendPaginated = <T>(res: Response, result: PaginatedResult<T>): void => {
  res.status(StatusCodes.OK).json({ success: true, ...result });
};

export const sendError = (res: Response, message: string, statusCode: number): void => {
  const response: ApiResponse = { success: false, message };
  res.status(statusCode).json(response);
};
