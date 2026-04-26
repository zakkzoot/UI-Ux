import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthPayload } from '../types';
import { UnauthorizedError } from './errors';

export const signToken = (payload: Omit<AuthPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN } as jwt.SignOptions);
};

export const signRefreshToken = (payload: Omit<AuthPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): AuthPayload => {
  try {
    return jwt.verify(token, config.JWT_SECRET) as AuthPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
};

export const verifyRefreshToken = (token: string): AuthPayload => {
  try {
    return jwt.verify(token, config.JWT_REFRESH_SECRET) as AuthPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
};
