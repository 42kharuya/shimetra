-- ADR 0002: MVPのデータモデル（最小スキーマ）に準拠
-- 4テーブル + enum + インデックス / 一意制約

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "DeadlineKind" AS ENUM ('es', 'briefing', 'interview', 'other');

-- CreateEnum
CREATE TYPE "DeadlineStatus" AS ENUM ('todo', 'submitted', 'done', 'canceled');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('free', 'pro');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('scheduled', 'sent', 'failed');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deadline_items" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "company_name" TEXT NOT NULL,
    "kind" "DeadlineKind" NOT NULL,
    "deadline_at" TIMESTAMPTZ NOT NULL,
    "status" "DeadlineStatus" NOT NULL DEFAULT 'todo',
    "link" TEXT,
    "memo" TEXT,
    "status_changed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deadline_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "stripe_customer_id" TEXT NOT NULL,
    "stripe_subscription_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'free',
    "current_period_end" TIMESTAMPTZ,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_deliveries" (
    "id" UUID NOT NULL,
    "deadline_item_id" UUID NOT NULL,
    "offset_minutes" INTEGER NOT NULL,
    "scheduled_for" TIMESTAMPTZ NOT NULL,
    "sent_at" TIMESTAMPTZ,
    "provider_message_id" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT 'scheduled',
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: users.email 一意制約
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex: deadline_items(user_id, deadline_at) 複合インデックス（AC）
CREATE INDEX "idx_deadline_items_user_id_deadline_at" ON "deadline_items"("user_id", "deadline_at");

-- CreateIndex: subscriptions.user_id 一意制約
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");

-- CreateIndex: subscriptions.stripe_customer_id 一意制約
CREATE UNIQUE INDEX "subscriptions_stripe_customer_id_key" ON "subscriptions"("stripe_customer_id");

-- CreateIndex: subscriptions.stripe_subscription_id 一意制約
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "subscriptions"("stripe_subscription_id");

-- CreateIndex: notification_deliveries(deadline_item_id, offset_minutes) 一意制約（重複送信防止 AC）
CREATE UNIQUE INDEX "uq_notification_deliveries_item_offset" ON "notification_deliveries"("deadline_item_id", "offset_minutes");

-- AddForeignKey
ALTER TABLE "deadline_items" ADD CONSTRAINT "deadline_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_deadline_item_id_fkey" FOREIGN KEY ("deadline_item_id") REFERENCES "deadline_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
