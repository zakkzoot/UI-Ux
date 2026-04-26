import { execSync } from 'child_process';

export default async function globalSetup(): Promise<void> {
  process.env.NODE_ENV = 'test';
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
}
