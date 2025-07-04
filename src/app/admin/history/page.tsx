import { Suspense } from 'react';
import { VersionHistoryContent } from '@/components/admin/version-history-content';

export default function VersionHistoryPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading version history...</p>
        </div>
      </div>
    }>
      <VersionHistoryContent />
    </Suspense>
  );
}
