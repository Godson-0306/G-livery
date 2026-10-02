import { Brand, TAGLINE } from "@/components/brand";
import { Card } from "@/components/ui/card";

export function AuthShell({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-12">
      <Brand className="mb-1 text-2xl" variant="text" />
      <p className="mb-3 text-sm text-muted">{TAGLINE}</p>
      <div className="hairline mb-8 w-16" />
      <Card className="p-6 sm:p-8">
        {children}
        {footer ? <div className="mt-5 space-y-1.5 text-sm text-muted">{footer}</div> : null}
      </Card>
    </div>
  );
}
