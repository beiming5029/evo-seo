import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";

import { auth, hashPassword } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { account, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const createUserSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  email: z.string().trim().email("invalid email"),
  password: z.string().min(8, "password must be at least 8 characters"),
  imageUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = createUserSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, imageUrl } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();
    const now = new Date();

    const existingUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, normalizedEmail))
      .limit(1);

    if (existingUser[0]) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const newUserId = randomUUID();

    const createdUser = await db.transaction(async (tx) => {
      const [insertedUser] = await tx
        .insert(user)
        .values({
          id: newUserId,
          name,
          email: normalizedEmail,
          emailVerified: true,
          image: imageUrl || null,
          createdAt: now,
          updatedAt: now,
        })
        .returning({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        });

      await tx.insert(account).values({
        id: randomUUID(),
        accountId: normalizedEmail,
        providerId: "credential",
        userId: newUserId,
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
      });

      return insertedUser;
    });

    return NextResponse.json({ user: createdUser }, { status: 201 });
  } catch (error) {
    console.error("[admin/users/create] POST error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
