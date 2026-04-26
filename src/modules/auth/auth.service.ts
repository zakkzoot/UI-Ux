import bcrypt from 'bcryptjs';
import { db } from '../../db';
import { config } from '../../config';
import { signToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../utils/errors';
import { UserRole } from '../../types';
import { RegisterDto, LoginDto } from './auth.schema';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends TokenPair {
  user: { id: string; email: string; name: string; role: string };
}

const toPayload = (user: { id: string; email: string; role: string }) => ({
  sub: user.id,
  email: user.email,
  role: user.role as UserRole,
});

export const register = async (dto: RegisterDto): Promise<AuthResult> => {
  const existing = await db.user.findUnique({ where: { email: dto.email } });
  if (existing) throw new ConflictError('Email already in use');

  const passwordHash = await bcrypt.hash(dto.password, config.BCRYPT_ROUNDS);
  const user = await db.user.create({
    data: { name: dto.name, email: dto.email, passwordHash },
    select: { id: true, email: true, name: true, role: true },
  });

  const accessToken = signToken(toPayload(user));
  const refreshToken = signRefreshToken(toPayload(user));
  await db.user.update({ where: { id: user.id }, data: { refreshToken } });

  return { accessToken, refreshToken, user };
};

export const login = async (dto: LoginDto): Promise<AuthResult> => {
  const user = await db.user.findUnique({
    where: { email: dto.email },
    select: { id: true, email: true, name: true, role: true, passwordHash: true, deletedAt: true },
  });

  if (!user || user.deletedAt) throw new UnauthorizedError('Invalid credentials');

  const valid = await bcrypt.compare(dto.password, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Invalid credentials');

  const accessToken = signToken(toPayload(user));
  const refreshToken = signRefreshToken(toPayload(user));
  await db.user.update({ where: { id: user.id }, data: { refreshToken } });

  const { passwordHash: _, deletedAt: __, ...safeUser } = user;
  return { accessToken, refreshToken, user: safeUser };
};

export const refresh = async (token: string): Promise<TokenPair> => {
  const payload = verifyRefreshToken(token);
  const user = await db.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true, refreshToken: true, deletedAt: true },
  });

  if (!user || user.deletedAt || user.refreshToken !== token) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const accessToken = signToken(toPayload(user));
  const refreshToken = signRefreshToken(toPayload(user));
  await db.user.update({ where: { id: user.id }, data: { refreshToken } });

  return { accessToken, refreshToken };
};

export const logout = async (userId: string): Promise<void> => {
  await db.user.update({ where: { id: userId }, data: { refreshToken: null } });
};
