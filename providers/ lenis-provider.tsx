"use client";

import { useVariablesStore } from "@/stores/variables";
import Lenis from "lenis";
import {
  ReactNode,
  useContext,
  useEffect,
  useState,
  createContext,
} from "react";

type SmoothScrollerContextType = {
  lenis: Lenis | null;
};

const SmoothScrollerContext = createContext<SmoothScrollerContextType | null>(
  null,
);

export const useSmoothScroller = () => {
  const context = useContext(SmoothScrollerContext);
  if (!context) {
    throw new Error(
      "useSmoothScroller must be used inside SmoothScrollingProvider",
    );
  }
  return context;
};

export default function SmoothScrollingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const { contactUs } = useVariablesStore();

  useEffect(() => {
    const scroller = new Lenis({
      smoothWheel: true,
    });

    let rafId: number;
    const raf = (time: number) => {
      scroller.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);
    setLenis(scroller);
    return () => {
      cancelAnimationFrame(rafId);
      scroller.destroy();
    };
  }, []);

  useEffect(() => {
    if (lenis && contactUs) {
      lenis.stop();
    } else {
      lenis?.start();
    }
  }, [contactUs]);

  return (
    <SmoothScrollerContext.Provider value={{ lenis }}>
      {children}
    </SmoothScrollerContext.Provider>
  );
}
