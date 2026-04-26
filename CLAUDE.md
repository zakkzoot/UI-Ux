# Senior Backend Template

## Stack
- **Runtime**: Node.js 20 + TypeScript 5
- **Framework**: Express 4
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: JWT (access + refresh tokens), bcrypt
- **Validation**: Zod schemas
- **Logging**: Winston
- **Testing**: Jest + Supertest

## Project structure

```
src/
├── config/         # Env validation (Zod)
├── db/             # Prisma client singleton
├── middleware/     # authenticate, validate, errorHandler, requestId
├── modules/
│   ├── auth/       # register, login, refresh, logout, me
│   └── users/      # CRUD with pagination & soft-delete
├── routes/         # Central router aggregation
├── types/          # Shared TS types & enums
└── utils/          # logger, errors, response helpers, jwt, pagination
tests/
├── helpers/        # createTestUser factory
├── auth.test.ts
├── users.test.ts
├── setup.ts        # afterEach / afterAll hooks
├── globalSetup.ts  # prisma migrate deploy
└── globalTeardown.ts
```

## Common commands

```bash
# Development
npm run dev

# Database
npm run db:migrate     # create + apply migration (dev)
npm run db:generate    # regenerate Prisma client
npm run db:seed        # seed admin user

# Quality
npm run lint
npm run format
npx tsc --noEmit

# Test (needs postgres on 5433 via docker-compose.test.yml)
docker compose -f docker-compose.test.yml up -d
npm test
```

## Adding a new module

1. Create `src/modules/<name>/`:
   - `<name>.schema.ts` — Zod DTOs
   - `<name>.service.ts` — business logic, DB calls
   - `<name>.controller.ts` — thin HTTP layer, delegates to service
   - `<name>.routes.ts` — Express Router
2. Register router in `src/routes/index.ts`
3. Add corresponding test file in `tests/<name>.test.ts`

## Environment variables

Copy `.env.example` → `.env` and fill in the secrets. All vars are
validated at startup via Zod; missing or invalid values cause an immediate exit.
