export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 px-6">
      <h1 className="text-2xl font-bold text-white">Access Denied</h1>
      <p className="text-zinc-400">
        You must be a superadmin to access this panel.
      </p>
      <a
        href="/login"
        className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
      >
        Try another account
      </a>
    </div>
  );
}
