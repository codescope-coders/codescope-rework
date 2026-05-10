// hooks/useCountUp.ts
import { useEffect, useRef } from "react";

function countUp(el: HTMLElement, target: number, duration = 1100) {
  const start = performance.now();
  const tick = (now: number) => {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = String(Math.round((1 - Math.pow(1 - p, 3)) * target));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function useCountUp() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            const target = parseInt(el.dataset.count ?? "0", 10);
            countUp(el, target);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 },
    );

    document.querySelectorAll("[data-count]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}