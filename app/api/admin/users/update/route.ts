import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";

import { auth, hashPassword } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { account, user } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

const updateUserSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  name: z.string().trim().min(1, "name is required").optional(),
  imageUrl: z.string().url().optional(),
  password: z.string().min(8, "password must be at least 8 characters").optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = updateUserSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { userId, name, imageUrl, password } = parsed.data;
    if (!name && !imageUrl && !password) {
      return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    const [existingUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();
    let updatedUser = existingUser;

    await db.transaction(async (tx) => {
      if (name !== undefined || imageUrl !== undefined) {
        const [u] = await tx
          .update(user)
          .set({
            name: name ?? existingUser.name,
            image: imageUrl ?? existingUser.image ?? null,
            updatedAt: now,
          })
          .where(eq(user.id, userId))
          .returning();
        updatedUser = u;
      }

      if (password !== undefined) {
        const hashedPassword = await hashPassword(password);
        const existingAccount = await tx
          .select()
          .from(account)
          .where(and(eq(account.userId, userId), eq(account.providerId, "email")))
          .limit(1);

        if (existingAccount[0]) {
          await tx
            .update(account)
            .set({
              password: hashedPassword,
              updatedAt: now,
            })
            .where(eq(account.id, existingAccount[0].id));
        } else {
          await tx.insert(account).values({
            id: randomUUID(),
            accountId: existingUser.email,
            providerId: "email",
            userId,
            password: hashedPassword,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
      },
    });
  } catch (error) {
    console.error("[admin/users/update] PATCH error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
