import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByMonth,
  getTransactionsByDateRange,
  getTransactionsByCategory,
  getAllTransactions,
  getBudget,
  setBudget,
  getCategories,
  createCategory,
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  getAppSettings,
  createOrUpdateAppSettings,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Transactions Router
  transactions: router({
    // Create a new transaction
    create: protectedProcedure
      .input(
        z.object({
          type: z.enum(["income", "expense"]),
          category: z.string(),
          amount: z.number().positive(),
          description: z.string().optional(),
          person: z.string().optional(),
          transactionDate: z.date(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await createTransaction(ctx.user.id, {
          type: input.type,
          category: input.category,
          amount: Math.round(input.amount * 100), // Convert to cents
          description: input.description,
          person: input.person,
          transactionDate: input.transactionDate,
        });
      }),

    // Update a transaction
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          type: z.enum(["income", "expense"]).optional(),
          category: z.string().optional(),
          amount: z.number().positive().optional(),
          description: z.string().optional(),
          person: z.string().optional(),
          transactionDate: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const updateData: any = {};

        if (data.type) updateData.type = data.type;
        if (data.category) updateData.category = data.category;
        if (data.amount) updateData.amount = Math.round(data.amount * 100);
        if (data.description !== undefined) updateData.description = data.description;
        if (data.person !== undefined) updateData.person = data.person;
        if (data.transactionDate) updateData.transactionDate = data.transactionDate;

        return await updateTransaction(id, ctx.user.id, updateData);
      }),

    // Delete a transaction
    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        return await deleteTransaction(input, ctx.user.id);
      }),

    // Get transactions by month
    getByMonth: protectedProcedure
      .input(
        z.object({
          year: z.number(),
          month: z.number().min(1).max(12),
        })
      )
      .query(async ({ ctx, input }) => {
        const transactions = await getTransactionsByMonth(ctx.user.id, input.year, input.month);
        return transactions.map((t) => ({
          ...t,
          amount: t.amount / 100, // Convert from cents
        }));
      }),

    // Get transactions by date range
    getByDateRange: protectedProcedure
      .input(
        z.object({
          startDate: z.date(),
          endDate: z.date(),
        })
      )
      .query(async ({ ctx, input }) => {
        const transactions = await getTransactionsByDateRange(ctx.user.id, input.startDate, input.endDate);
        return transactions.map((t) => ({
          ...t,
          amount: t.amount / 100,
        }));
      }),

    // Get transactions by category
    getByCategory: protectedProcedure
      .input(
        z.object({
          category: z.string(),
          year: z.number().optional(),
          month: z.number().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        const transactions = await getTransactionsByCategory(ctx.user.id, input.category, input.year, input.month);
        return transactions.map((t) => ({
          ...t,
          amount: t.amount / 100,
        }));
      }),

    // Get all transactions
    getAll: protectedProcedure.query(async ({ ctx }) => {
      const transactions = await getAllTransactions(ctx.user.id);
      return transactions.map((t) => ({
        ...t,
        amount: t.amount / 100,
      }));
    }),
  }),

  // Budget Router
  budget: router({
    // Get budget for a month
    get: protectedProcedure
      .input(z.string()) // month in format YYYY-MM
      .query(async ({ ctx, input }) => {
        const budget = await getBudget(ctx.user.id, input);
        return budget ? { ...budget, amount: budget.amount / 100 } : null;
      }),

    // Set budget for a month
    set: protectedProcedure
      .input(
        z.object({
          month: z.string(),
          amount: z.number().positive(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await setBudget(ctx.user.id, input.month, Math.round(input.amount * 100));
      }),
  }),

  // Categories Router
  categories: router({
    // Get categories by type
    getByType: protectedProcedure
      .input(z.enum(["income", "expense"]))
      .query(async ({ ctx, input }) => {
        return await getCategories(ctx.user.id, input);
      }),

    // Create a custom category
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          type: z.enum(["income", "expense"]),
          icon: z.string().optional(),
          color: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await createCategory(ctx.user.id, input);
      }),
  }),

  // Recurring Transactions Router
  recurringTransactions: router({
    // Get all recurring transactions
    getAll: protectedProcedure.query(async ({ ctx }) => {
      const transactions = await getRecurringTransactions(ctx.user.id);
      return transactions.map((t) => ({
        ...t,
        amount: t.amount / 100,
      }));
    }),

    // Create a recurring transaction
    create: protectedProcedure
      .input(
        z.object({
          type: z.enum(["income", "expense"]),
          category: z.string(),
          amount: z.number().positive(),
          description: z.string().optional(),
          person: z.string().optional(),
          frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
          dayOfMonth: z.number().optional(),
          dayOfWeek: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await createRecurringTransaction(ctx.user.id, {
          type: input.type,
          category: input.category,
          amount: Math.round(input.amount * 100),
          description: input.description,
          person: input.person,
          frequency: input.frequency,
          dayOfMonth: input.dayOfMonth,
          dayOfWeek: input.dayOfWeek,
          isActive: true,
        });
      }),

    // Update a recurring transaction
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          isActive: z.boolean().optional(),
          amount: z.number().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const updateData: any = {};

        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        if (data.amount) updateData.amount = Math.round(data.amount * 100);
        if (data.description !== undefined) updateData.description = data.description;

        return await updateRecurringTransaction(id, ctx.user.id, updateData);
      }),
  }),

  // App Settings Router
  appSettings: router({
    // Get app settings
    get: protectedProcedure.query(async ({ ctx }) => {
      return await getAppSettings(ctx.user.id);
    }),

    // Update Google Drive token
    updateGoogleDrive: protectedProcedure
      .input(
        z.object({
          token: z.string(),
          folderId: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await createOrUpdateAppSettings(ctx.user.id, {
          googleDriveToken: input.token,
          googleDriveFolderId: input.folderId,
          lastSyncDate: new Date(),
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
