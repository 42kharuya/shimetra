-- マジックリンク認証トークンテーブル
-- Issue #3: メールマジックリンク認証

CREATE TABLE "magic_link_tokens" (
    "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
    "email"      TEXT        NOT NULL,
    "token"      TEXT        NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "used_at"    TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "magic_link_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "magic_link_tokens_token_key" ON "magic_link_tokens"("token");
CREATE INDEX "magic_link_tokens_email_idx" ON "magic_link_tokens"("email");
