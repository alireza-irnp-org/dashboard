import { z } from "zod/v3";

export const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    emailVerified: z.boolean(),
    image: z.string().nullable().optional(),
    createdAt: z.union([z.string(), z.date()]),
    updatedAt: z.union([z.string(), z.date()]),
});

export const SessionSchema = z.object({
    id: z.string(),
    token: z.string(),
    expiresAt: z.union([z.string(), z.date()]),
    createdAt: z.union([z.string(), z.date()]),
    updatedAt: z.union([z.string(), z.date()]),
    ipAddress: z.string().nullable().optional(),
    userAgent: z.string().nullable().optional(),
    userId: z.string(),
});

export const SessionWithUserSchema = z.object({
    session: SessionSchema,
    user: UserSchema,
});
