"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboardNav } from "@/hooks/useDashboardNav";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  PieChart,
  Settings,
} from "lucide-react";

const navItems = [
  { path: "/overview", label: "Overview", icon: LayoutDashboard },
  { path: "/events", label: "Events", icon: CalendarDays },
  { path: "/followers", label: "Followers", icon: Users },
  { path: "/audience", label: "Audience", icon: PieChart },
  { path: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const nav = useDashboardNav();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border bg-card/95 backdrop-blur-sm">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href={nav.href("/overview")} className="flex items-center gap-2">
          <span className="text-xl font-bold text-foreground">RedefineMe</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const href = nav.href(item.path);
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={item.path}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
