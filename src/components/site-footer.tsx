import { auth } from "@/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export async function SiteFooter({ light = false }: { light?: boolean }) {
  const session = await auth();

  // Logged-in chrome already has a header toggle and a fixed tab bar.
  if (session) return null;

  return (
    <footer
      className={
        light
          ? "border-t border-white/10 px-4 py-4 text-center text-xs text-[#f3eee4]/70"
          : cn("mt-auto border-t border-amber/20 px-4 py-4 text-center text-xs text-muted")
      }
    >
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-3">
        <ThemeToggle inverted={light} className="h-8 w-8" />
        <span>Powered By G-Tech Industries</span>
      </div>
    </footer>
  );
}
