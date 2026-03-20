/**
 * src/lib/__tests__/env.test.ts
 *
 * env.ts ユニットテスト
 * 実行: npm run test:env
 *
 * テスト戦略:
 *  - validateAllEnv(): 必須変数の欠損・条件付き必須・全設定時の挙動
 *  - env.XXX getter: 必須変数の未設定 throw / デフォルト値の確認
 */

import assert from "node:assert/strict";
import { validateAllEnv, env } from "../env";

// ── テスト用 process.env ヘルパー ─────────────────────────────────────────

/** 最小の全必須変数セット */
const REQUIRED_ENV: Record<string, string> = {
  DATABASE_URL: "postgresql://localhost/test",
  AUTH_SECRET: "test-secret-at-least-32-bytes-long!!",
  STRIPE_SECRET_KEY: "sk_test_mock",
  STRIPE_PRICE_ID: "price_mock",
  STRIPE_WEBHOOK_SECRET: "whsec_mock",
  CRON_SECRET: "cron-secret-mock",
};

function withEnv(
  overrides: Record<string, string | undefined>,
  fn: () => void,
): void {
  const saved: Record<string, string | undefined> = {};
  // 新規セット
  for (const [k, v] of Object.entries(overrides)) {
    saved[k] = process.env[k];
    if (v === undefined) {
      delete process.env[k];
    } else {
      process.env[k] = v;
    }
  }
  try {
    fn();
  } finally {
    // 復元
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) {
        delete process.env[k];
      } else {
        process.env[k] = v;
      }
    }
  }
}

// ── テスト本体 ─────────────────────────────────────────────────────────────

async function runAll() {
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => void | Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error("   ", err instanceof Error ? err.message : err);
      failed++;
    }
  }

  console.log("\nenv バリデーション テスト\n");

  // ── validateAllEnv ──────────────────────────────────────────────────────

  await test("validateAllEnv: 全必須変数が揃っていれば throw しない", () => {
    withEnv(REQUIRED_ENV, () => {
      assert.doesNotThrow(() => validateAllEnv());
    });
  });

  await test("validateAllEnv: DATABASE_URL 未設定は Error を throw する", () => {
    withEnv({ ...REQUIRED_ENV, DATABASE_URL: undefined }, () => {
      assert.throws(
        () => validateAllEnv(),
        (err: unknown) => {
          assert.ok(err instanceof Error);
          assert.ok(
            err.message.includes("DATABASE_URL"),
            `メッセージに DATABASE_URL が含まれていない: ${err.message}`,
          );
          return true;
        },
      );
    });
  });

  await test("validateAllEnv: 複数変数欠損時に一覧を含む Error を throw する", () => {
    withEnv(
      { ...REQUIRED_ENV, AUTH_SECRET: undefined, STRIPE_SECRET_KEY: undefined },
      () => {
        assert.throws(
          () => validateAllEnv(),
          (err: unknown) => {
            assert.ok(err instanceof Error);
            assert.ok(
              err.message.includes("AUTH_SECRET"),
              `メッセージに AUTH_SECRET が含まれていない: ${err.message}`,
            );
            assert.ok(
              err.message.includes("STRIPE_SECRET_KEY"),
              `メッセージに STRIPE_SECRET_KEY が含まれていない: ${err.message}`,
            );
            return true;
          },
        );
      },
    );
  });

  await test(
    "validateAllEnv: EMAIL_PROVIDER=resend で RESEND_API_KEY 未設定は throw する",
    () => {
      withEnv(
        {
          ...REQUIRED_ENV,
          EMAIL_PROVIDER: "resend",
          RESEND_API_KEY: undefined,
          EMAIL_FROM: "noreply@example.com",
        },
        () => {
          assert.throws(
            () => validateAllEnv(),
            (err: unknown) => {
              assert.ok(err instanceof Error);
              assert.ok(
                err.message.includes("RESEND_API_KEY"),
                `メッセージに RESEND_API_KEY が含まれていない: ${err.message}`,
              );
              return true;
            },
          );
        },
      );
    },
  );

  // ── env getter ────────────────────────────────────────────────────────

  await test("env.DATABASE_URL: 設定済みの場合は値を返す", () => {
    withEnv({ DATABASE_URL: "postgresql://localhost/test" }, () => {
      assert.equal(env.DATABASE_URL, "postgresql://localhost/test");
    });
  });

  await test("env.DATABASE_URL: 未設定の場合は Error を throw する", () => {
    withEnv({ DATABASE_URL: undefined }, () => {
      assert.throws(
        () => env.DATABASE_URL,
        (err: unknown) => {
          assert.ok(err instanceof Error);
          assert.ok(
            err.message.includes("DATABASE_URL"),
            `メッセージに DATABASE_URL が含まれていない: ${err.message}`,
          );
          return true;
        },
      );
    });
  });

  await test("env.APP_URL: 未設定時はデフォルト値を返す", () => {
    withEnv({ APP_URL: undefined }, () => {
      assert.equal(env.APP_URL, "http://localhost:3000");
    });
  });

  await test("env.APP_URL: 設定済みの場合は設定値を返す", () => {
    withEnv({ APP_URL: "https://app.example.com" }, () => {
      assert.equal(env.APP_URL, "https://app.example.com");
    });
  });

  await test("env.MAGIC_LINK_EXPIRY_MINUTES: 未設定時はデフォルト 30 を返す", () => {
    withEnv({ MAGIC_LINK_EXPIRY_MINUTES: undefined }, () => {
      assert.equal(env.MAGIC_LINK_EXPIRY_MINUTES, 30);
    });
  });

  await test("env.EMAIL_PROVIDER: 未設定時は 'console' を返す", () => {
    withEnv({ EMAIL_PROVIDER: undefined }, () => {
      assert.equal(env.EMAIL_PROVIDER, "console");
    });
  });

  await test("env.EMAIL_PROVIDER: 'resend' 設定時は 'resend' を返す", () => {
    withEnv({ EMAIL_PROVIDER: "resend" }, () => {
      assert.equal(env.EMAIL_PROVIDER, "resend");
    });
  });

  await test("env.AUTH_SECRET: 未設定の場合は Error を throw する", () => {
    withEnv({ AUTH_SECRET: undefined }, () => {
      assert.throws(
        () => env.AUTH_SECRET,
        (err: unknown) => {
          assert.ok(err instanceof Error);
          assert.ok(err.message.includes("AUTH_SECRET"));
          return true;
        },
      );
    });
  });

  console.log(`\n${passed} passed / ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

runAll().catch((err) => {
  console.error("テスト実行エラー:", err);
  process.exit(1);
});
