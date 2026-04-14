# Aiza Backend

## Setup

1. Install dependencies

   ```bash
   cd backend
   npm install
   ```

2. Copy environment file

   ```bash
   cp .env.example .env
   ```

3. Generate Prisma client

   ```bash
   npm run prisma:generate
   ```

4. Apply database migrations

   ```bash
   npx prisma migrate dev --name init
   ```

5. Seed the database with an admin user and sample product

   ```bash
   npm run prisma:seed
   ```

6. Start in development mode
   ```bash
   npm run start:dev
   ```

## Docker

```bash
docker compose up --build
```

## Notes

- The backend listens on `http://localhost:3000`
- Use `DATABASE_URL` and `REDIS_URL` from `.env`
- Product data is seeded through Prisma model definitions
