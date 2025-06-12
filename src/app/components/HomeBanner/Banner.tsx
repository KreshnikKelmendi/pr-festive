"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import mainBannerDesktop from "../../../../public/mainbanner-desktop.png";
import mainBannerPhone from "../../../../public/mainbanner-phone.png";

export default function Banner(): JSX.Element {
  const textRef = useRef<HTMLDivElement>(null);
  const yellowBgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background animation with a nice reveal
      gsap.fromTo(
        yellowBgRef.current,
        {
          scaleX: 0,
          opacity: 0,
        },
        {
          scaleX: 1,
          opacity: 1,
          duration: 1.2,
          ease: "power3.inOut",
        }
      );

      // Create an impactful intro sequence for words
      const words = textRef.current?.querySelectorAll('.animate-word');
      if (words) {
        // Initial state
        gsap.set(words, {
          opacity: 0,
          scale: 0.8,
          y: 50,
          rotation: -15,
        });

        // Create a timeline for the sequence
        const tl = gsap.timeline({
          delay: 0.3,
        });

        // Animate each word with rotation and movement
        words.forEach((word, index) => {
          tl.to(word, {
            opacity: 1,
            scale: 1,
            y: 0,
            rotation: 0,
            duration: 1,
            ease: "power2.out",
            delay: index * 0.2,
          });
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative w-full mx-auto lg:h-screen bg-[#FFDB00]">
      <div className="relative h-screen lg:h-screen flex items-center overflow-hidden">
        {/* Desktop Image */}
        <div className="hidden lg:block absolute inset-0 w-full h-full">
          <Image
            src={mainBannerDesktop}
            alt="Prishtina Festive Desktop Banner"
            fill
            priority
            className=""
          />
        </div>
        {/* Mobile Image */}
        <div className="lg:hidden absolute inset-0 w-full h-full">
          <Image
            src={mainBannerPhone}
            alt="Prishtina Festive Mobile Banner"
            fill
            priority
            className=""
          />
        </div>
        {/* Text Container with Yellow Background */}
        <div className="relative z-10 lg:ml-[5%] flex items-center">
          <div 
            ref={yellowBgRef}
            className="absolute inset-0 transform origin-left"
            style={{ width: '120%', height: '120%' }}
          />
          <div 
            ref={textRef}
            className="relative px-8 py-6 lg:px-12 lg:py-8"
          >
            <h1 className="text-5xl md:text-4xl lg:text-9xl text-[#1D1D1B]">
              <span className="animate-word flex h-full justify-center items-center bg-[#FFDB00] w-fit p-4 font-malkieslab transform-gpu">A doni</span>
              <span className="animate-word flex h-full justify-center items-center bg-[#FFDB00] w-fit p-4 mt-1 font-malkieslab transform-gpu">me mërdhi</span>
              <span className="animate-word flex h-full justify-center items-center bg-[#FFDB00] w-fit p-4 mt-1 font-malkieslab transform-gpu">Verën?</span>
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
