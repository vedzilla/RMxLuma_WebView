import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer";

const variants = {
  primary: "bg-text text-surface hover:bg-subtle",
  outline: "border border-border bg-transparent text-text hover:bg-bg",
  ghost: "bg-transparent text-text hover:bg-bg",
} as const;

type Variant = keyof typeof variants;

interface PublicButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  asChild?: boolean;
}

export function PublicButton({
  variant = "primary",
  asChild = false,
  className,
  ...props
}: PublicButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(base, variants[variant], className)}
      {...props}
    />
  );
}
