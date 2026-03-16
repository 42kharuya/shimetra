import DeadlineForm from "./DeadlineForm";

export default function NewDeadlinePage() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-xl font-semibold">締切の新規作成</h1>
      <p className="mt-1 text-sm text-slate-500">
        <span className="text-red-500">*</span> は必須項目です
      </p>
      <DeadlineForm />
    </main>
  );
}
