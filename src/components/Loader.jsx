"use client";
import "../app/preloader.css";
import { useRef, useState, useEffect } from "react";

import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

let isInitialLoad = true;
gsap.registerPlugin(CustomEase);
CustomEase.create("hop", "0.9, 0, 0.1, 1");

export default function Loader({ onComplete }) {
  const [showPreloader, setShowPreloader] = useState(isInitialLoad);
  const [loaderAnimating, setLoaderAnimating] = useState(false);

  useEffect(() => {
    return () => {
      isInitialLoad = false;
    };
  }, []);

  useEffect(() => {
    if (loaderAnimating) {
      // Block scroll during loader
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [loaderAnimating]);

  useGSAP(() => {
    const tl = gsap.timeline({
      delay: 0.3,
      defaults: {
        ease: "hop",
      },
    });

    if (showPreloader) {
      setLoaderAnimating(true);
      const counts = document.querySelectorAll(".count");

      counts.forEach((count, index) => {
        const digits = count.querySelectorAll(".digit h1");

        tl.to(
          digits,
          {
            y: "0%",
            duration: 1,
            stagger: 0.075,
          },
          index * 1
        );

        if (index < counts.length) {
          tl.to(
            digits,
            {
              y: "-100%",
              duration: 1,
              stagger: 0.075,
            },
            index * 1 + 1
          );
        }
      });

      tl.to(".spinner", {
        opacity: 0,
        duration: 0.3,
      });

      tl.to(
        ".word h1",
        {
          y: "0%",
          duration: 1,
        },
        "<"
      );

      tl.to(".divider", {
        scaleY: "100%",
        duration: 1,
        onComplete: () =>
          gsap.to(".divider", { opacity: 0, duration: 0.3, delay: 0.3 }),
      });

      tl.to("#word-1 h1", {
        y: "100%",
        duration: 1,
        delay: 0.3,
      });

      tl.to(
        "#word-2 h1",
        {
          y: "-100%",
          duration: 1,
        },
        "<"
      );

      tl.to(
        ".block",
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          duration: 1,
          stagger: 0.1,
          delay: 0.75,
          onComplete: () => {
            gsap.set(".loader", { pointerEvents: "none" });
            setLoaderAnimating(false);
            setShowPreloader(false);
            if (onComplete) onComplete();
          },
        },
        "<"
      );
    }
  }, [showPreloader]);

  if (!showPreloader) return null;

  return (
    <div className="loader">
      <div className="overlay">
        <div className="block"></div>
        <div className="block"></div>
      </div>
      <div className="intro-logo">
        <div className="word" id="word-1">
          <h1>
            <span>Nudge</span>
          </h1>
        </div>
        <div className="word" id="word-2">
          <h1></h1>
        </div>
      </div>
      <div className="divider"></div>
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
      <div className="counter">
        <div className="count">
          <div className="digit">
            <h1>0</h1>
          </div>
          <div className="digit">
            <h1>0</h1>
          </div>
        </div>
        <div className="count">
          <div className="digit">
            <h1>1</h1>
          </div>
          <div className="digit">
            <h1>0</h1>
          </div>
        </div>
        <div className="count">
          <div className="digit">
            <h1>0</h1>
          </div>
          <div className="digit">
            <h1>%</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
