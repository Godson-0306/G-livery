import { ThemeToggle } from "@/components/theme-toggle";

export function SiteFooter({ light = false }: { light?: boolean }) {
  return (
    <footer
      className={
        light
          ? "border-t border-white/10 px-4 py-4 text-center text-xs text-emerald-100"
          : "mt-auto border-t border-line px-4 py-4 text-center text-xs text-muted"
      }
    >
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-3">
        <ThemeToggle inverted={light} className="h-8 w-8" />
        <span>Powered By G-Tech Industries</span>
      </div>
    </footer>
  );
}
