import React from 'react';
import { Loader2, Inbox } from 'lucide-react';

/** Full-page centered loading spinner */
export function PageLoader({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
      {label && <p className="text-2xs text-muted-foreground font-semibold">{label}</p>}
    </div>
  );
}

/** Full-page centered empty state card */
export function PageEmpty({
  title = 'Belum ada data',
  description,
  icon: Icon = Inbox,
  action,
}: {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="bg-card border border-border rounded-2xl p-8 text-center max-w-sm">
        <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        {description && (
          <p className="text-2xs text-muted-foreground font-medium mt-1">{description}</p>
        )}
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}
