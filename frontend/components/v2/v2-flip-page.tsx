"use client";

import {
  forwardRef,
  type CSSProperties,
  type ReactNode,
} from "react";

type V2FlipPageProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** StPageFlip hard cover / soft page */
  density?: "hard" | "soft";
};

/** StPageFlip requires each page to be a forwardRef element. */
export const V2FlipPage = forwardRef<HTMLDivElement, V2FlipPageProps>(
  function V2FlipPage(
    { children, className = "", style, density = "soft" },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={`v2-flip-page ${className}`.trim()}
        style={style}
        data-density={density}
      >
        <div className="v2-flip-page-inner">{children}</div>
      </div>
    );
  },
);
