import { DocManager } from '@/components/admin/doc-manager'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <h1 className="text-lg font-semibold">Documentation Admin</h1>
        </div>
      </header>
      <main className="container py-6">
        <DocManager />
      </main>
    </div>
  );
}
