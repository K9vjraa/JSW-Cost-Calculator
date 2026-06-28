import { useEffect, useState, useRef } from "react";

interface AnimatedNumberProps {
  value: number;
  formatter?: (v: number) => string;
}

export function AnimatedNumber({ value, formatter }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const startTimeRef = useRef<number | null>(null);
  const startValRef = useRef(value);
  const endValRef = useRef(value);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    startValRef.current = displayValue;
    endValRef.current = value;
    startTimeRef.current = null;

    const duration = 200; // 200ms duration

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);

      // Ease-out Quad curve for professional ERP feel
      const easedPercentage = percentage * (2 - percentage);
      const current = startValRef.current + (endValRef.current - startValRef.current) * easedPercentage;
      
      setDisplayValue(current);

      if (percentage < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value]);

  return <>{formatter ? formatter(displayValue) : displayValue.toFixed(2)}</>;
}
