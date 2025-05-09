import React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "glass-card flex flex-col items-center justify-between p-2 text-center rounded-lg w-full",
        className
      )}>
      <div className="flex flex-row flex-auto w-full justify-between">
        {icon && (
          <div className="mb-4 flex-2 text-muted-foreground">{icon}</div>
        )}
        <span>
          <h3 className="text-lg font-medium">{title}</h3>
        </span>
        {description && (
          <div>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              {description}
            </p>
          </div>
        )}
      </div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
