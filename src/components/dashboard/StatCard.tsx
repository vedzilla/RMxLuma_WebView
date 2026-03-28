import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  loading?: boolean;
}

export function StatCard({ title, value, change, icon: Icon, loading }: StatCardProps) {
  const trendIcon =
    change === undefined ? null : change > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : change < 0 ? (
      <TrendingDown className="h-4 w-4 text-destructive" />
    ) : (
      <Minus className="h-4 w-4 text-muted-foreground" />
    );

  return (
    <Card className="transition-all duration-[120ms] hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-8 w-16 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-2 flex items-end gap-2">
              <p className="text-3xl font-bold">{value.toLocaleString()}</p>
              {change !== undefined && (
                <div className="mb-1 flex items-center gap-1">
                  {trendIcon}
                  <span
                    className={cn(
                      "text-sm font-medium",
                      change > 0
                        ? "text-green-600"
                        : change < 0
                        ? "text-destructive"
                        : "text-muted-foreground"
                    )}
                  >
                    {change > 0 ? "+" : ""}
                    {change}%
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
