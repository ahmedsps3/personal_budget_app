import { eq, and, gte, lte, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, transactions, budgets, recurringTransactions, categories, appSettings, Transaction, Budget, RecurringTransaction, Category, AppSettings } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Transaction queries
export async function createTransaction(userId: number, data: Omit<typeof transactions.$inferInsert, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(transactions).values({
    ...data,
    userId,
  });
  return result;
}

export async function updateTransaction(transactionId: number, userId: number, data: Partial<Omit<typeof transactions.$inferInsert, 'userId' | 'id'>>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(transactions)
    .set(data)
    .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)));
}

export async function deleteTransaction(transactionId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(transactions)
    .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)));
}

export async function getTransactionsByMonth(userId: number, year: number, month: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  return await db.select()
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      gte(transactions.transactionDate, startDate),
      lte(transactions.transactionDate, endDate)
    ))
    .orderBy(desc(transactions.transactionDate));
}

export async function getTransactionsByDateRange(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select()
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      gte(transactions.transactionDate, startDate),
      lte(transactions.transactionDate, endDate)
    ))
    .orderBy(desc(transactions.transactionDate));
}

export async function getTransactionsByCategory(userId: number, category: string, year?: number, month?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let conditions = [
    eq(transactions.userId, userId),
    eq(transactions.category, category)
  ];
  
  if (year && month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    conditions.push(gte(transactions.transactionDate, startDate));
    conditions.push(lte(transactions.transactionDate, endDate));
  }
  
  return await db.select()
    .from(transactions)
    .where(and(...conditions))
    .orderBy(desc(transactions.transactionDate));
}

export async function getAllTransactions(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.transactionDate));
}

// Budget queries
export async function getBudget(userId: number, month: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select()
    .from(budgets)
    .where(and(eq(budgets.userId, userId), eq(budgets.month, month)))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function setBudget(userId: number, month: string, amount: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getBudget(userId, month);
  
  if (existing) {
    return await db.update(budgets)
      .set({ amount })
      .where(eq(budgets.id, existing.id));
  } else {
    return await db.insert(budgets).values({
      userId,
      month,
      amount,
    });
  }
}

// Category queries
export async function getCategories(userId: number, type: 'income' | 'expense') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select()
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.type, type)))
    .orderBy(asc(categories.name));
}

export async function createCategory(userId: number, data: Omit<typeof categories.$inferInsert, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(categories).values({
    ...data,
    userId,
  });
}

// Recurring transactions queries
export async function getRecurringTransactions(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select()
    .from(recurringTransactions)
    .where(and(eq(recurringTransactions.userId, userId), eq(recurringTransactions.isActive, true)))
    .orderBy(asc(recurringTransactions.category));
}

export async function createRecurringTransaction(userId: number, data: Omit<typeof recurringTransactions.$inferInsert, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(recurringTransactions).values({
    ...data,
    userId,
  });
}

export async function updateRecurringTransaction(transactionId: number, userId: number, data: Partial<Omit<typeof recurringTransactions.$inferInsert, 'userId' | 'id'>>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(recurringTransactions)
    .set(data)
    .where(and(eq(recurringTransactions.id, transactionId), eq(recurringTransactions.userId, userId)));
}

// App settings queries
export async function getAppSettings(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select()
    .from(appSettings)
    .where(eq(appSettings.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function createOrUpdateAppSettings(userId: number, data: Partial<Omit<typeof appSettings.$inferInsert, 'userId' | 'id'>>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getAppSettings(userId);
  
  if (existing) {
    return await db.update(appSettings)
      .set(data)
      .where(eq(appSettings.id, existing.id));
  } else {
    return await db.insert(appSettings).values({
      ...data,
      userId,
    } as any);
  }
}
