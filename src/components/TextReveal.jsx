"use client";
import "./TextReveal.css";
import React, { useRef, useEffect } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

export default function TextReveal({ children, animateOnScroll = true, delay = 0 }) {
  const containerRef = useRef(null);
  const splitInstancesRef = useRef([]);
  const linesRef = useRef([]);

  const waitForFonts = async () => {
    try {
      await document.fonts.ready;

      const customFonts = ["Inter", "Tanker"];
      const fontCheckPromises = customFonts.map((fontFamily) => {
        return document.fonts.check(`16px ${fontFamily}`);
      });

      await Promise.all(fontCheckPromises);
      await new Promise((resolve) => setTimeout(resolve, 100));

      return true;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return true;
    }
  };

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const initializeSplitText = async () => {
        await waitForFonts();

        // Clean up previous instances
        splitInstancesRef.current.forEach(instance => {
          if (instance && instance.revert) {
            instance.revert();
          }
        });
        splitInstancesRef.current = [];
        linesRef.current = [];

        let elements = [];
        if (containerRef.current.hasAttribute("data-text-reveal-wrapper")) {
          elements = Array.from(containerRef.current.children);
        } else {
          elements = [containerRef.current];
        }

        elements.forEach((element) => {
          const splitInstance = new SplitType(element, {
            types: 'lines',
            lineClass: 'text-reveal-line'
          });

          splitInstancesRef.current.push(splitInstance);

          // Handle text-indent preservation like in Terrene's Copy.jsx
          const computedStyle = window.getComputedStyle(element);
          const textIndent = computedStyle.textIndent;

          if (textIndent && textIndent !== "0px") {
            if (splitInstance.lines.length > 0) {
              splitInstance.lines[0].style.paddingLeft = textIndent;
            }
            element.style.textIndent = "0";
          }

          linesRef.current.push(...splitInstance.lines);
        });

        // Set initial state
        gsap.set(linesRef.current, { y: "100%" });

        const animationProps = {
          y: "0%",
          duration: 1,
          stagger: 0.1,
          ease: "power4.out",
          delay: delay,
        };

        if (animateOnScroll) {
          gsap.to(linesRef.current, {
            ...animationProps,
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 90%",
              once: true,
            },
          });
        } else {
          gsap.to(linesRef.current, animationProps);
        }
      };

      initializeSplitText();

      return () => {
        splitInstancesRef.current.forEach(instance => {
          if (instance && instance.revert) {
            instance.revert();
          }
        });
      };
    },
    { scope: containerRef, dependencies: [animateOnScroll, delay] }
  );

  if (React.Children.count(children) === 1) {
    return React.cloneElement(children, { ref: containerRef });
  }

  return (
    <div ref={containerRef} data-text-reveal-wrapper="true">
      {children}
    </div>
  );
}
