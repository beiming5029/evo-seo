import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Override default better-auth get-session to return only non-sensitive fields.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  const userId = session?.session?.userId || session?.user?.id;

  if (!userId) {
    return NextResponse.json({ user: null, session: null }, { status: 200 });
  }

  const safeUser = {
    id: userId,
    name: session?.user?.name ?? null,
    email: session?.user?.email ?? null,
    image: session?.user?.image ?? null,
    role: (session as any)?.user?.role ?? null,
    emailVerified: (session as any)?.user?.emailVerified ?? null,
  };

  const safeSession = {
    userId,
    expiresAt: session?.session?.expiresAt ?? null,
  };

  return NextResponse.json(
    {
      user: safeUser,
      session: safeSession,
    },
    {
      status: 200,
      headers: {
        // Prevent intermediaries from caching sensitive-but-trimmed responses.
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    }
  );
}
