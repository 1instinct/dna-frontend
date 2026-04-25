"use client";

export const LoadingIcon = ({ className }: { className?: string }) => (
  <i className={className} />
);

export const Loading = () => {
  return (
    <div className="flex h-[80vh] w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-brand" />
    </div>
  );
};
