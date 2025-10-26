# Database Setup Guide - Drizzle ORM + Neon

This project uses **Drizzle ORM** with **NeonDatabase** (PostgreSQL) for database management.

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Database connection configuration
│   ├── db/
│   │   ├── index.ts             # Database exports
│   │   └── schema.ts            # Centralized schema exports
│   └── modules/
│       └── user/
│           ├── user.schema.ts   # User module schemas
│           └── user.repository.ts # User database operations
├── drizzle/                     # Generated migrations (auto-created)
├── drizzle.config.ts           # Drizzle Kit configuration
└── .env.example                # Environment variables template
```

## 🚀 Getting Started

### 1. Set Up Environment Variables

Copy `.env.example` to `.env` and update the `DATABASE_URL`:

```bash
cp .env.example .env
```

Get your Neon database URL from [Neon Console](https://console.neon.tech/):

```
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

### 2. Generate and Run Migrations

```bash
# Generate migration files from your schema
pnpm db:generate

# Apply migrations to the database
pnpm db:push
```

### 3. Database Scripts

```bash
pnpm db:generate    # Generate migrations from schema changes
pnpm db:push        # Push schema changes to database (dev)
pnpm db:migrate     # Run pending migrations (production)
pnpm db:studio      # Open Drizzle Studio (database GUI)
pnpm db:drop        # Drop migrations
```

## 📝 Creating New Schemas

### Step 1: Create Module Schema

Create a new schema file in your module directory:

```typescript
// src/modules/client/client.schema.ts
import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from '../user/user.schema.js';

export const clients = pgTable('clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Step 2: Export Schema

Add the export to `src/db/schema.ts`:

```typescript
export * from '../modules/user/user.schema.js';
export * from '../modules/client/client.schema.js'; // Add this
```

### Step 3: Generate Migration

```bash
pnpm db:generate
pnpm db:push
```

## 🔧 Using the Database

### In Your Repository Files

```typescript
// src/modules/client/client.repository.ts
import { eq } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { clients } from './client.schema.js';

export class ClientRepository {
  async findAll(userId: string) {
    return await db.select().from(clients).where(eq(clients.userId, userId));
  }

  async create(data: typeof clients.$inferInsert) {
    const result = await db.insert(clients).values(data).returning();
    return result[0];
  }

  async update(id: string, data: Partial<typeof clients.$inferInsert>) {
    const result = await db
      .update(clients)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return result[0];
  }

  async delete(id: string) {
    await db.delete(clients).where(eq(clients.id, id));
  }
}
```

### In Your Service Files

```typescript
// src/modules/client/client.service.ts
import { ClientRepository } from './client.repository.js';

export class ClientService {
  private clientRepo = new ClientRepository();

  async getClientsByUser(userId: string) {
    return await this.clientRepo.findAll(userId);
  }

  async createClient(userId: string, clientData: any) {
    return await this.clientRepo.create({
      ...clientData,
      userId,
    });
  }
}
```

## 📚 Drizzle ORM Tips

### Query Examples

```typescript
// Select with where
const user = await db.select().from(users).where(eq(users.email, 'user@example.com')).limit(1);

// Join tables
const usersWithProfiles = await db
  .select()
  .from(users)
  .leftJoin(userProfiles, eq(users.id, userProfiles.userId));

// Multiple conditions
import { and, or, gt, lt } from 'drizzle-orm';

const activeUsers = await db
  .select()
  .from(users)
  .where(and(eq(users.isActive, true), eq(users.isEmailVerified, true)));

// Transactions
await db.transaction(async (tx) => {
  const user = await tx.insert(users).values(userData).returning();
  await tx.insert(userProfiles).values({ userId: user[0].id, ...profileData });
});
```

### Type Inference

```typescript
// Infer types from schema
type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;
```

## 🛠️ Development Workflow

1. **Make schema changes** in module schema files
2. **Export schemas** in `src/db/schema.ts`
3. **Generate migrations**: `pnpm db:generate`
4. **Apply changes**: `pnpm db:push`
5. **View in GUI**: `pnpm db:studio`

## 📖 Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Neon Docs](https://neon.tech/docs)
- [Drizzle with Neon Guide](https://orm.drizzle.team/docs/get-started-postgresql#neon)
