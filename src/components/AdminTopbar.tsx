export default function AdminTopbar({ name = "Admin User", role = "Admin" }: { name?: string; role?: string }) {
  return (
    <header className="flex items-center justify-between p-6 bg-white">
      <div>
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <p className="text-sm text-slate-500">Welcome back, {name}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-semibold">{name}</div>
          <div className="text-xs text-slate-400">{role}</div>
        </div>
        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">{name?.[0] ?? "A"}</div>
      </div>
    </header>
  );
}
