import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "ログイン | 就活締切トラッカー",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          ログイン / サインアップ
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          メールアドレスを入力するとログインリンクを送ります。
        </p>
        {/* useSearchParams を使う LoginForm は Suspense で囲む */}
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
