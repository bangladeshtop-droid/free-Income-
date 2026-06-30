import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  className?: string;
  decimals?: number;
}

export default function AnimatedCounter({ value, className = "", decimals = 0 }: AnimatedCounterProps) {
  const [pulse, setPulse] = useState(false);
  
  const spring = useSpring(value, {
    mass: 1,
    stiffness: 75,
    damping: 15
  });

  const display = useTransform(spring, (current) => 
    current.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  );

  useEffect(() => {
    spring.set(value);
    setPulse(true);
    const timeout = setTimeout(() => setPulse(false), 300);
    return () => clearTimeout(timeout);
  }, [value, spring]);

  return (
    <motion.span 
      className={`inline-block ${className}`}
      animate={{ scale: pulse ? 1.05 : 1, color: pulse ? "#FCD34D" : "inherit" }}
      transition={{ duration: 0.3 }}
    >
      <motion.span>{display}</motion.span>
    </motion.span>
  );
}
