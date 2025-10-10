import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { db } from "./db";
import { refundCredits } from "./credits";

const defaultTrustedOrigins = ["http://localhost:3000"];

const trustedOrigins = process.env.BETTER_AUTH_TRUSTED_ORIGINS
  ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : defaultTrustedOrigins;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    },
  },

  trustedOrigins,

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // 监听用户注册事件（包括邮箱注册和 OAuth 注册）
      if (ctx.path.startsWith("/sign-up")) {
        const newSession = ctx.context.newSession;
        if (newSession) {
          try {
            // 赠送 300 积分新人礼包
            await refundCredits(
              newSession.user.id,
              300,
              "registration_bonus"
            );
            console.log(`新用户注册成功，已赠送 300 积分: ${newSession.user.email}`);
          } catch (error) {
            console.error("赠送新人积分失败:", error);
          }
        }
      }
    }),
  },
});

export { hashPassword } from "better-auth/crypto";
