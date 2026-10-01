import * as React from "react";

export function CheckCheckIcon({
  className = "size-4",
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2 13.5l4.5 4.5L16 7"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.5 13.5l3.5 3.5L22 7"
      />
    </svg>
  );
}
