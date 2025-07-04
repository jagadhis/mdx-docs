import { DocManager } from '@/components/admin/doc-manager'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen w-full bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full px-6 flex h-14 items-center">
          <h1 className="text-lg font-semibold">Documentation Admin</h1>
        </div>
      </header>
      <main className="w-full px-6 py-6">
        <DocManager />
      </main>
    </div>
  );
}
