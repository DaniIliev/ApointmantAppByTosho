"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ... (логиката на IntersectionObserver остава същата)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("animate-in");
            }, delay);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`opacity-0 transition-all duration-700 fade-in ${className}`}
    >
            {children}   {" "}
    </div>
  );
}
// export function ScrollReveal({
//   children,
//   className = "",
//   delay = 0,
// }: ScrollRevealProps) {
//   const ref = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             setTimeout(() => {
//               entry.target.classList.add("animate-in");
//             }, delay);
//           }
//         });
//       },
//       { threshold: 0.1 }
//     );

//     if (ref.current) {
//       observer.observe(ref.current);
//     }

//     return () => {
//       if (ref.current) {
//         observer.unobserve(ref.current);
//       }
//     };
//   }, [delay]);

//   return (
//     <div
//       ref={ref}
//       className={`opacity-0 transition-all duration-700 ${className}`}
//     >
//       {children}
//     </div>
//   );
// }
