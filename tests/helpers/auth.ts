import bcrypt from 'bcryptjs';
import { db } from '../../src/db';
import { signToken } from '../../src/utils/jwt';
import { UserRole } from '../../src/types';

export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: string;
  token: string;
}

export const createTestUser = async (
  overrides: Partial<{ email: string; name: string; role: 'USER' | 'ADMIN' }> = {},
): Promise<TestUser> => {
  const email = overrides.email ?? `user-${Date.now()}@test.com`;
  const name = overrides.name ?? 'Test User';
  const role = overrides.role ?? 'USER';

  const user = await db.user.create({
    data: {
      email,
      name,
      role,
      passwordHash: await bcrypt.hash('Test@1234!', 10),
    },
    select: { id: true, email: true, name: true, role: true },
  });

  const token = signToken({ sub: user.id, email: user.email, role: user.role as UserRole });

  return { ...user, token };
};
