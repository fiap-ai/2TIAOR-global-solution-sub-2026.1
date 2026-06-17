import { Info } from "lucide-react";
import type { ReactNode } from "react";

// A compact explanatory box: always shows a one-line gist, with an optional
// expandable "Learn more" section for the deeper theoretical detail. Used across
// pages to give context to the numbers without cluttering the UI.
interface InfoNoteProps {
  title: string;
  children: ReactNode; // the always-visible short text
  detail?: ReactNode; // optional expandable theory
}

export function InfoNote({ title, children, detail }: InfoNoteProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
      <div className="flex gap-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="space-y-1">
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-muted-foreground">{children}</p>
          {detail && (
            <details className="group mt-1">
              <summary className="cursor-pointer list-none text-xs font-medium text-primary hover:underline">
                Learn more
              </summary>
              <div className="mt-2 space-y-2 text-xs text-muted-foreground">
                {detail}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
