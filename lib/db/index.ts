import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  // 避免 dev 热重载创建过多连接
  // eslint-disable-next-line no-var
  var _pgClient: ReturnType<typeof postgres> | undefined;
  // eslint-disable-next-line no-var
  var _drizzleDb: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

const connectionString = process.env.DATABASE_URL!;
const sslNoVerify =
  process.env.DB_SSL_NO_VERIFY === "1" || process.env.DB_SSL_NO_VERIFY?.toLowerCase() === "true";

const getClient = () => {
  if (global._pgClient) return global._pgClient;
  const client = postgres(connectionString, {
    prepare: false, // 兼容 serverless/多实例
    max: 10, // 限制池大小，防止占满连接槽位
    ssl: sslNoVerify ? { rejectUnauthorized: false } : undefined,
  });
  if (process.env.NODE_ENV !== "production") {
    global._pgClient = client;
  }
  return client;
};

const getDb = () => {
  if (global._drizzleDb) return global._drizzleDb;
  const dbInstance = drizzle(getClient(), { schema });
  if (process.env.NODE_ENV !== "production") {
    global._drizzleDb = dbInstance;
  }
  return dbInstance;
};

export const db = getDb();
