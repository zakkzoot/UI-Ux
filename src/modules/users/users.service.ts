import { db } from '../../db';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { buildPaginatedResult, getPrismaSkipTake } from '../../utils/pagination';
import { PaginatedResult } from '../../types';
import { UpdateUserDto } from './users.schema';

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type SafeUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

export const findAll = async (
  page: number,
  limit: number,
): Promise<PaginatedResult<SafeUser>> => {
  const { skip, take } = getPrismaSkipTake(page, limit);
  const [data, total] = await Promise.all([
    db.user.findMany({ where: { deletedAt: null }, select: userSelect, skip, take }),
    db.user.count({ where: { deletedAt: null } }),
  ]);
  return buildPaginatedResult(data, total, page, limit);
};

export const findById = async (id: string): Promise<SafeUser> => {
  const user = await db.user.findFirst({
    where: { id, deletedAt: null },
    select: userSelect,
  });
  if (!user) throw new NotFoundError('User');
  return user;
};

export const updateById = async (
  id: string,
  requesterId: string,
  requesterRole: string,
  dto: UpdateUserDto,
): Promise<SafeUser> => {
  const user = await db.user.findFirst({ where: { id, deletedAt: null } });
  if (!user) throw new NotFoundError('User');
  if (requesterRole !== 'ADMIN' && requesterId !== id) throw new ForbiddenError();

  return db.user.update({ where: { id }, data: dto, select: userSelect });
};

export const deleteById = async (id: string): Promise<void> => {
  const user = await db.user.findFirst({ where: { id, deletedAt: null } });
  if (!user) throw new NotFoundError('User');
  await db.user.update({ where: { id }, data: { deletedAt: new Date(), refreshToken: null } });
};
