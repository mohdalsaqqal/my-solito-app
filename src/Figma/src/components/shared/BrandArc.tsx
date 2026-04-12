import { useEffect, useRef } from 'react';
import { cn } from '../../lib/cn';

interface BrandArcProps {
  width?: number;
  animated?: boolean;
  className?: string;
  delay?: number; // ms delay before animation starts
}

export function BrandArc({ width = 100, animated = false, className, delay = 0 }: BrandArcProps) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!animated || !pathRef.current) return;
    const path = pathRef.current;
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    path.style.transition = 'none';

    const timer = setTimeout(() => {
      path.style.transition = `stroke-dashoffset 0.5s ease-out`;
      path.style.strokeDashoffset = '0';
    }, delay);

    return () => clearTimeout(timer);
  }, [animated, delay]);

  const height = Math.max(10, width * 0.12);
  const cp = height * 0.3;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('block', className)}
      aria-hidden
    >
      <path
        ref={pathRef}
        d={`M2,${height - 2} Q${width / 2},${cp} ${width - 2},${height - 2}`}
        stroke="rgb(var(--color-brand))"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
