import { db } from '../src/db';

afterEach(async () => {
  await db.user.deleteMany();
});

afterAll(async () => {
  await db.$disconnect();
});
