#!/usr/bin/env bash
# =============================================================================
# smoke-test.sh  クリティカル導線 スモークテスト
# =============================================================================
# 用途 : ローンチ前・デプロイ後の最低限の疎通確認（手動実行）
# 前提 : dev サーバーが localhost:8787 で起動していること
#         (NODE_ENV=development  → magic-link の URL がターミナルに表示される)
# 実行 : bash scripts/smoke-test.sh
# =============================================================================

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8787}"
PASS=0
FAIL=0
SKIP=0

# ── ヘルパー ────────────────────────────────────────────────────────────────

green()  { printf "\033[32m  ✓ %s\033[0m\n" "$*"; }
red()    { printf "\033[31m  ✗ %s\033[0m\n" "$*"; }
yellow() { printf "\033[33m  - %s\033[0m\n" "$*"; }
header() { printf "\n\033[1m%s\033[0m\n" "$*"; }

# HTTP ステータスコードを検証する
check_status() {
  local name="$1"
  local expected="$2"
  local actual="$3"
  if [[ "$actual" == "$expected" ]]; then
    green "$name → HTTP $actual"
    ((PASS++)) || true
  else
    red "$name → 期待: $expected  実際: $actual"
    ((FAIL++)) || true
  fi
}

# JSON レスポンスにキーが含まれるか確認
check_body() {
  local name="$1"
  local pattern="$2"
  local body="$3"
  if echo "$body" | grep -q "$pattern"; then
    green "$name (body に '$pattern' を確認)"
    ((PASS++)) || true
  else
    red "$name (body に '$pattern' が見つからない)  body=$body"
    ((FAIL++)) || true
  fi
}

# =============================================================================
# 1. 認証 (Auth)
# =============================================================================
header "1. 認証 (Magic Link)"

# 1-1. 正常系: 有効なメールアドレス → 200 ok:true
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/auth/magic-link" \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke-test@example.com"}')
check_status "POST /api/auth/magic-link (valid email)" "200" "$STATUS"

# 1-2. バリデーションエラー: 不正メール → 400
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/auth/magic-link" \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email"}')
check_status "POST /api/auth/magic-link (invalid email → 400)" "400" "$STATUS"

# 1-3. バリデーションエラー: bodyなし → 400
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/auth/magic-link" \
  -H "Content-Type: application/json" \
  -d '{}')
check_status "POST /api/auth/magic-link (empty body → 400)" "400" "$STATUS"

# 1-4. verify: 不正トークン → /login へリダイレクト
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/auth/verify?token=invalid-token-value")
# リダイレクト先が /login であれば 302 または 307
if [[ "$STATUS" == "302" || "$STATUS" == "307" ]]; then
  green "GET /api/auth/verify?token=invalid → リダイレクト ($STATUS)"
  ((PASS++)) || true
else
  red "GET /api/auth/verify?token=invalid → 期待: 302/307  実際: $STATUS"
  ((FAIL++)) || true
fi

# =============================================================================
# 2. データ保存 (Deadlines API)
# =============================================================================
header "2. データ保存 (Deadlines)"

# 2-1. 未認証 → 401
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/deadlines" \
  -H "Content-Type: application/json" \
  -d '{"company":"Test","deadline_at":"2026-04-01T00:00:00Z","type":"ES"}')
check_status "POST /api/deadlines (未認証 → 401)" "401" "$STATUS"

# 2-2. 未認証 GET → 401
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/deadlines")
check_status "GET /api/deadlines (未認証 → 401)" "401" "$STATUS"

# 2-3. 認証済みテスト（セッションCookieが必要 → 手動スキップ）
yellow "POST /api/deadlines (認証済み) → 手動確認が必要 (docs/QA_CRITICAL_PATH.md #2-3)"
((SKIP++)) || true

# =============================================================================
# 3. 課金 (Stripe Checkout)
# =============================================================================
header "3. 課金 (Stripe Checkout)"

# 3-1. 未認証 → 401
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/stripe/checkout")
check_status "POST /api/stripe/checkout (未認証 → 401)" "401" "$STATUS"

# 3-2. GET は 405
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/stripe/checkout")
check_status "GET /api/stripe/checkout (→ 405)" "405" "$STATUS"

# 3-3. Customer Portal 未認証 → 401
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/stripe/portal")
check_status "POST /api/stripe/portal (未認証 → 401)" "401" "$STATUS"

# 3-4. Stripe Webhook: シークレット欠落 → 400
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/stripe/webhook" \
  -H "Content-Type: application/json" \
  -d '{}')
check_status "POST /api/stripe/webhook (署名なし → 400)" "400" "$STATUS"

# =============================================================================
# 4. 通知 Cron
# =============================================================================
header "4. 通知 Cron"

# 4-1. シークレット欠落 → 401
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/cron/notify")
check_status "POST /api/cron/notify (未認証 → 401)" "401" "$STATUS"

# 4-2. 不正シークレット → 401
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/cron/notify" \
  -H "Authorization: Bearer wrong-secret")
check_status "POST /api/cron/notify (不正シークレット → 401)" "401" "$STATUS"

# =============================================================================
# 5. ページ疎通確認
# =============================================================================
header "5. ページ疎通 (HTML 返却確認)"

for path in "/" "/login" "/dashboard" "/billing"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path")
  if [[ "$STATUS" == "200" || "$STATUS" == "307" || "$STATUS" == "302" ]]; then
    green "GET $path → $STATUS"
    ((PASS++)) || true
  else
    red "GET $path → 期待: 200/302/307  実際: $STATUS"
    ((FAIL++)) || true
  fi
done

# =============================================================================
# 結果サマリー
# =============================================================================
printf "\n\033[1m結果: %d passed / %d failed / %d skipped\033[0m\n\n" "$PASS" "$FAIL" "$SKIP"

if ((FAIL > 0)); then
  printf "\033[31m一部のチェックが失敗しました。docs/QA_CRITICAL_PATH.md を確認してください。\033[0m\n\n"
  exit 1
else
  printf "\033[32mすべての自動チェックが通過しました。\033[0m\n"
  printf "手動確認が必要な項目は docs/QA_CRITICAL_PATH.md を参照してください。\n\n"
fi
