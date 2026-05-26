"use client";

import { useEffect, useRef, useState } from "react";

type AnimationType = "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "zoom-in" | "zoom-out" | "rotate" | "flip" | "none";

type ScrollRevealOptions = {
  animation?: AnimationType;
  duration?: number;
  delay?: number;
  threshold?: number;
  stagger?: boolean;
  staggerDelay?: number;
};

const animationStyles: Record<AnimationType, Record<string, string>> = {
  fade: { opacity: "0" },
  "slide-up": { opacity: "0", transform: "translateY(40px)" },
  "slide-down": { opacity: "0", transform: "translateY(-40px)" },
  "slide-left": { opacity: "0", transform: "translateX(40px)" },
  "slide-right": { opacity: "0", transform: "translateX(-40px)" },
  "zoom-in": { opacity: "0", transform: "scale(0.8)" },
  "zoom-out": { opacity: "0", transform: "scale(1.2)" },
  rotate: { opacity: "0", transform: "rotate(-10deg) scale(0.9)" },
  flip: { opacity: "0", transform: "rotateY(90deg)" },
  none: {},
};

const finalStyles: Record<AnimationType, Record<string, string>> = {
  fade: { opacity: "1" },
  "slide-up": { opacity: "1", transform: "translateY(0)" },
  "slide-down": { opacity: "1", transform: "translateY(0)" },
  "slide-left": { opacity: "1", transform: "translateX(0)" },
  "slide-right": { opacity: "1", transform: "translateX(0)" },
  "zoom-in": { opacity: "1", transform: "scale(1)" },
  "zoom-out": { opacity: "1", transform: "scale(1)" },
  rotate: { opacity: "1", transform: "rotate(0deg) scale(1)" },
  flip: { opacity: "1", transform: "rotateY(0deg)" },
  none: {},
};

export function useScrollReveal<T extends HTMLElement>(options: ScrollRevealOptions = {}) {
  const {
    animation = "fade",
    duration = 0.6,
    delay = 0,
    threshold = 0.1,
    stagger = false,
    staggerDelay = 0.1,
  } = options;

  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const initial = animationStyles[animation];
    Object.assign(el.style, initial, {
      transition: `all ${duration}s ease-out ${delay}s`,
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const final = finalStyles[animation];
          Object.assign(el.style, final);
          setRevealed(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animation, duration, delay, threshold]);

  return { ref, revealed };
}

export function useStaggerReveal<T extends HTMLElement>(count: number, options: ScrollRevealOptions = {}) {
  const {
    animation = "slide-up",
    duration = 0.5,
    delay = 0,
    threshold = 0.1,
    staggerDelay = 0.08,
  } = options;

  const containerRef = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const children = Array.from(container.children) as HTMLElement[];
    const initial = animationStyles[animation];
    const final = finalStyles[animation];

    children.forEach((child) => {
      Object.assign(child.style, initial, {
        transition: `all ${duration}s ease-out`,
      });
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach((child, i) => {
            setTimeout(() => {
              Object.assign(child.style, final);
            }, (delay + i * staggerDelay) * 1000);
          });
          setRevealed(true);
          observer.unobserve(container);
        }
      },
      { threshold }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [animation, duration, delay, threshold, staggerDelay, count]);

  return { containerRef, revealed };
}

export function useParallax<T extends HTMLElement>(speed: number = 0.15) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || speed === 0) return;

    const handler = () => {
      const rect = el.getBoundingClientRect();
      const scrolled = window.innerHeight - rect.top;
      const offset = scrolled * speed;
      el.style.transform = `translateY(${Math.min(Math.max(offset, -100), 100)}px)`;
    };

    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [speed]);

  return ref;
}
