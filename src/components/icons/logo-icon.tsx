import type { SVGProps } from 'react';

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
      <path d="m21 21-6-6" />
      <path d="M3.5 3.5 2 2" />
      <path d="M21.5 3.5 20 2" />
      <path d="M3.5 20.5 2 22" />
      <path d="M21.5 20.5 20 22" />
    </svg>
  );
}
