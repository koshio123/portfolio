import Link from "next/link";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary";
};

const styles = {
  primary: "bg-primary-bg text-primary-ink hover:text-primary-ink hover:opacity-90",
  secondary: "border border-line-strong text-ink hover:text-ink hover:bg-surface",
};

/** 主ボタン・副ボタン。遷移なので <a>(Link) で描く */
export function ButtonLink({ variant = "primary", className = "", ...props }: Props) {
  return (
    <Link
      className={`inline-flex min-h-11 items-center gap-2 rounded-md px-6 text-sm font-bold no-underline transition-opacity ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
