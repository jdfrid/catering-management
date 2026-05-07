import Link from "next/link";
import { mainNav } from "@/lib/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#f7f2ea]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <Link
            href="/"
            className="text-lg font-bold text-slate-900 underline-offset-4 hover:underline"
          >
            CateringOS
          </Link>
          <nav
            className="flex flex-wrap items-center justify-start gap-2 lg:justify-end"
            aria-label="ניווט ראשי"
          >
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-amber-100 hover:ring-amber-300"
              >
                {item.short}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
