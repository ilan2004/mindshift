"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function AnimatedCard({ 
  children, 
  delay = 0, 
  animateOnScroll = true,
  className = "",
  ...props 
}) {
  const cardRef = useRef(null);

  useGSAP(() => {
    if (!cardRef.current) return;

    gsap.set(cardRef.current, { 
      opacity: 0, 
      y: 40,
      scale: 0.95
    });

    const animationProps = {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: "power3.out",
      delay: delay,
    };

    if (animateOnScroll) {
      gsap.to(cardRef.current, {
        ...animationProps,
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 85%",
          once: true,
        },
      });
    } else {
      gsap.to(cardRef.current, animationProps);
    }
  }, [delay, animateOnScroll]);

  return (
    <div ref={cardRef} className={className} {...props}>
      {children}
    </div>
  );
}
