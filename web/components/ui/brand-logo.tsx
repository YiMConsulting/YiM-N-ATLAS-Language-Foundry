import type { SVGProps } from "react";

export function BrandLogo({
  size = 28,
  className = "",
  ...props
}: {
  size?: number;
  className?: string;
} & SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      className={`shrink-0 ${className}`}
      aria-label="N-ATLaS Logo"
      {...props}
    >
      <rect width="32" height="32" rx="8" fill="#047857" />
      <path
        d="M9 23V9h3.6l7.4 9.5V9H23v14h-3.6L12 13.5V23H9z"
        fill="#FFFFFF"
      />
    </svg>
  );
}
