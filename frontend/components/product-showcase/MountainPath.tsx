"use client";

import { motion, useReducedMotion } from "framer-motion";

import styles from "./MountainPath.module.css";

type MountainPathProps = {
  activeCategoryId: string;
};

const pathShape = `
  M 150 75
  C 225 108, 118 143, 198 180
  C 286 218, 148 255, 247 294
  C 350 334, 190 374, 318 414
  C 430 449, 518 498, 590 574
`;

export function MountainPath({ activeCategoryId }: MountainPathProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={styles.root} aria-hidden="true">
      <svg viewBox="0 0 700 620" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="mountainPathGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="mountainPathMovingGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="14" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="pathGradient" x1="530" y1="50" x2="170" y2="590" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F8E6B8" stopOpacity="0.25" />
            <stop offset="30%" stopColor="#E1BC72" stopOpacity="0.75" />
            <stop offset="67%" stopColor="#F4D58B" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FFE8AE" />
          </linearGradient>
        </defs>

        <path d={pathShape} stroke="#DDAF58" strokeOpacity="0.16" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" filter="url(#mountainPathGlow)" vectorEffect="non-scaling-stroke" />
        <path d={pathShape} stroke="#E6BF72" strokeOpacity="0.27" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" filter="url(#mountainPathGlow)" vectorEffect="non-scaling-stroke" />
        <path d={pathShape} stroke="url(#pathGradient)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <path d={pathShape} stroke="#FFF0C3" strokeOpacity="0.74" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

        <motion.path
          key={activeCategoryId}
          d={pathShape}
          stroke="#FFF8DF"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#mountainPathMovingGlow)"
          initial={reduceMotion ? { opacity: 0 } : { pathLength: 0, opacity: 0 }}
          animate={reduceMotion ? { opacity: 0 } : { pathLength: [0, 0.35, 1], opacity: [0, 0.85, 0] }}
          transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1], times: [0, 0.45, 1] }}
        />

        <circle cx="150" cy="75" r="2.5" fill="#FFF1C7" opacity="0.45" />
        <circle cx="318" cy="414" r="2" fill="#F6D48E" opacity="0.55" />
        <circle cx="590" cy="574" r="3" fill="#FFE7A8" opacity="0.65" />
      </svg>
      <span className={styles.foregroundGlow} />
    </div>
  );
}
