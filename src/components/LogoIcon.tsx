import React from 'react';

interface LogoIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export default function LogoIcon({ className = 'h-5 w-5', ...props }: LogoIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-label="InvestEase AI Logo"
      {...props}
    >
      {/* Upward trending bar chart bars (Invest) */}
      <rect x="2" y="20" width="6" height="10" rx="1.5" fill="#4ADE80" />
      <rect x="10" y="14" width="6" height="16" rx="1.5" fill="#22D3EE" />
      <rect x="18" y="8" width="6" height="22" rx="1.5" fill="#4ADE80" />
      {/* Smooth effortless glide wave (Ease) lifting investments with frictionless flow */}
      <path
        d="M 1.5 22 C 3.5 26.5, 9 27, 13.5 22 C 18 17, 22.5 10, 28 4"
        stroke="#22D3EE"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Rising arrow on top right (Growth Momentum) */}
      <polyline
        points="22,4 28,4 28,10"
        stroke="#22D3EE"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
