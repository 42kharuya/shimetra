/**
 * src/lib/env.ts
 *
 * 環境変数の一元管理・型安全アクセス
 *
 * - `env.XXX`          : process.env を毎回参照。未設定の必須変数は明確なエラーを throw。
 * - `validateAllEnv()` : 全必須変数を一括 Zod バリデーション（フェイルファスト）。
 *                        Next.js Middleware のモジュール初期化時に呼び出す。
 *
 * 設計方針:
 *  - process.env をキャッシュしない → テスト時の動的書き換えに対応
 *  - Zod は validateAllEnv() での一括検証にのみ使用（起動時の全欠損一覧出力）
 *  - 個別アクセスは getter + required() ヘルパーでシンプルに実装
 *
 * 使い方:
 *   import { env } from "@/lib/env";
 *   const url = env.DATABASE_URL;  // string（undefined なし、未設定は throw）
 *
 *   // 起動時バリデーション（middleware.ts 等）:
 *   import { validateAllEnv } from "@/lib/env";
 *   validateAllEnv();
 */

import { z } from "zod";

// ── Zod スキーマ（validateAllEnv 用） ─────────────────────────────────────────

export const envSchema = z
  .object({
    // === 必須 ===
    DATABASE_URL: z.string().min(1, "DATABASE_URL は必須です"),
    AUTH_SECRET: z.string().min(1, "AUTH_SECRET は必須です"),
    STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY は必須です"),
    STRIPE_PRICE_ID: z.string().min(1, "STRIPE_PRICE_ID は必須です"),
    STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET は必須です"),
    CRON_SECRET: z.string().min(1, "CRON_SECRET は必須です"),

    // === 任意（デフォルト値あり）===
    APP_URL: z.string().url("APP_URL は有効な URL でなければなりません").default("http://localhost:3000"),
    MAGIC_LINK_EXPIRY_MINUTES: z.coerce.number().int().positive().default(30),
    EMAIL_PROVIDER: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z.enum(["console", "resend"]).default("console"),
    ),
    ANALYTICS_PROVIDER: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z.enum(["console", "segment"]).default("console"),
    ),
    NODE_ENV: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z.enum(["development", "production", "test"]).default("development"),
    ),

    // === 条件付き必須（下記 superRefine で検証）===
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
    ANALYTICS_WRITE_KEY: z.string().optional(),
    SENTRY_DSN: z.string().optional(),

    // === レート制限（Upstash Redis、任意）===
    UPSTASH_REDIS_REST_URL: z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    RATE_LIMIT_MAGIC_LINK_MAX: z.coerce.number().int().positive().optional(),
    RATE_LIMIT_MAGIC_LINK_WINDOW_SEC: z.coerce.number().int().positive().optional(),
  })
  .superRefine((data, ctx) => {
    // EMAIL_PROVIDER=resend のとき RESEND_API_KEY / EMAIL_FROM が必須
    if (data.EMAIL_PROVIDER === "resend") {
      if (!data.RESEND_API_KEY) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["RESEND_API_KEY"],
          message: "EMAIL_PROVIDER=resend のとき RESEND_API_KEY は必須です",
        });
      }
      if (!data.EMAIL_FROM) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["EMAIL_FROM"],
          message: "EMAIL_PROVIDER=resend のとき EMAIL_FROM は必須です",
        });
      }
    }
    // ANALYTICS_PROVIDER=segment のとき ANALYTICS_WRITE_KEY が必須
    if (data.ANALYTICS_PROVIDER === "segment" && !data.ANALYTICS_WRITE_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ANALYTICS_WRITE_KEY"],
        message: "ANALYTICS_PROVIDER=segment のとき ANALYTICS_WRITE_KEY は必須です",
      });
    }
  });

// ── 一括バリデーション（起動時フェイルファスト） ──────────────────────────────

/**
 * 全必須環境変数を一括バリデーションする（フェイルファスト）。
 * 欠損がある場合は変数名一覧を含む Error を throw する。
 *
 * Next.js Middleware のモジュール初期化時に呼び出すことで、
 * 設定ミスを最初のリクエスト到達時に確実に検出できる。
 */
export function validateAllEnv(): void {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const messages = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `[env] 環境変数の検証に失敗しました。以下の変数を確認してください:\n${messages}`,
    );
  }
}

// ── 型安全アクセサ ──────────────────────────────────────────────────────────

/** 未設定の必須変数へのアクセスで明確なエラーを throw する内部ヘルパー */
function required(key: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `[env] ${key} が設定されていません。.env または環境変数を確認してください。`,
    );
  }
  return value;
}

/**
 * 型安全な環境変数アクセスオブジェクト。
 * `process.env` を毎回参照するため、テスト時の動的変更に対応している。
 *
 * @example
 *   import { env } from "@/lib/env";
 *   const db = env.DATABASE_URL;  // string（undefined なし）
 */
export const env = {
  // ── 必須（未設定は throw） ──────────────────────────────────────────────

  /** Prisma / Neon 接続 URL */
  get DATABASE_URL(): string {
    return required("DATABASE_URL", process.env.DATABASE_URL);
  },

  /** JWT セッション署名キー */
  get AUTH_SECRET(): string {
    return required("AUTH_SECRET", process.env.AUTH_SECRET);
  },

  /** Stripe シークレットキー */
  get STRIPE_SECRET_KEY(): string {
    return required("STRIPE_SECRET_KEY", process.env.STRIPE_SECRET_KEY);
  },

  /** Stripe Pro プランの Price ID */
  get STRIPE_PRICE_ID(): string {
    return required("STRIPE_PRICE_ID", process.env.STRIPE_PRICE_ID);
  },

  /** Stripe Webhook 署名シークレット */
  get STRIPE_WEBHOOK_SECRET(): string {
    return required("STRIPE_WEBHOOK_SECRET", process.env.STRIPE_WEBHOOK_SECRET);
  },

  /** Cron 呼び出し認証シークレット */
  get CRON_SECRET(): string {
    return required("CRON_SECRET", process.env.CRON_SECRET);
  },

  // ── 任意（デフォルト値あり） ────────────────────────────────────────────

  /** アプリ公開 URL（デフォルト: http://localhost:3000） */
  get APP_URL(): string {
    return process.env.APP_URL || "http://localhost:3000";
  },

  /** マジックリンク有効期限（分、デフォルト: 30） */
  get MAGIC_LINK_EXPIRY_MINUTES(): number {
    return parseInt(process.env.MAGIC_LINK_EXPIRY_MINUTES ?? "30", 10);
  },

  /** メールプロバイダ（デフォルト: "console"） */
  get EMAIL_PROVIDER(): "console" | "resend" {
    return process.env.EMAIL_PROVIDER === "resend" ? "resend" : "console";
  },

  /** 計測プロバイダ（デフォルト: "console"） */
  get ANALYTICS_PROVIDER(): "console" | "segment" {
    return process.env.ANALYTICS_PROVIDER === "segment" ? "segment" : "console";
  },

  /** Node 環境（デフォルト: "development"） */
  get NODE_ENV(): "development" | "production" | "test" {
    const v = process.env.NODE_ENV;
    return v === "production" ? "production" : v === "test" ? "test" : "development";
  },

  // ── 条件付き（undefined の可能性あり） ─────────────────────────────────

  /** Resend API キー（EMAIL_PROVIDER=resend 時に必須） */
  get RESEND_API_KEY(): string | undefined {
    return process.env.RESEND_API_KEY;
  },

  /** 送信元メールアドレス（EMAIL_PROVIDER=resend 時に必須） */
  get EMAIL_FROM(): string | undefined {
    return process.env.EMAIL_FROM;
  },

  /** Segment Write Key（ANALYTICS_PROVIDER=segment 時に必須） */
  get ANALYTICS_WRITE_KEY(): string | undefined {
    return process.env.ANALYTICS_WRITE_KEY;
  },

  /** Sentry DSN（任意） */
  get SENTRY_DSN(): string | undefined {
    return process.env.SENTRY_DSN;
  },

  // ── レート制限（Upstash Redis、任意） ─────────────────────────────────

  /** Upstash Redis REST URL（レート制限に使用） */
  get UPSTASH_REDIS_REST_URL(): string | undefined {
    return process.env.UPSTASH_REDIS_REST_URL;
  },

  /** Upstash Redis REST トークン（レート制限に使用） */
  get UPSTASH_REDIS_REST_TOKEN(): string | undefined {
    return process.env.UPSTASH_REDIS_REST_TOKEN;
  },
} as const;
