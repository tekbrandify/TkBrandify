import React from 'react';

interface TekBrandifyLogoProps {
  className?: string;
  id?: string;
}

export default function TekBrandifyLogo({ className = '', id }: TekBrandifyLogoProps) {
  return (
    <svg
      id={id}
      width="480"
      height="77"
      viewBox="0 0 480 77"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="TekBrandify®"
    >
      <text
        x="4"
        y="58"
        fontFamily="var(--font-host-grotesk), sans-serif"
        fontSize="58"
        fontWeight="700"
        letterSpacing="-1.5"
      >
        <tspan fill="#FFFFFF">TEK</tspan>
        <tspan fill="#AFAFAF">BRANDIFY</tspan>
        <tspan fill="#F16B0D" fontSize="28" dy="-24" dx="3">
          ®
        </tspan>
      </text>
    </svg>
  );
}
