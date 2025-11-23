"use client";

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function ThankYouMessage() {
    const headingRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const messageRef = useRef<HTMLParagraphElement>(null);
    const wordsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tl = gsap.timeline({ delay: 0.3 });
        
        if (headingRef.current) {
            tl.from(headingRef.current, {
                clipPath: 'inset(0 100% 0 0)',
                duration: 1,
                ease: 'power2.out'
            });
        }
        
        if (subtitleRef.current) {
            tl.from(subtitleRef.current, {
                clipPath: 'inset(0 100% 0 0)',
                duration: 0.8,
                ease: 'power2.out'
            }, '-=0.5');
        }
        
        if (messageRef.current) {
            tl.from(messageRef.current, {
                clipPath: 'inset(0 100% 0 0)',
                duration: 0.8,
                ease: 'power2.out'
            }, '-=0.4');
        }

        if (wordsRef.current) {
            const words = wordsRef.current.children;
            tl.from(words, {
                y: -30,
                opacity: 0,
                duration: 0.6,
                ease: 'power2.out',
                stagger: 0.15
            }, '-=0.2');
        }
    }, []);
    return (
        <div className="flex items-center justify-center min-h-screen px-4">
            <div className="w-full max-w-3xl text-center space-y-6">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <Image 
                        src="/assets/logo-2025.png" 
                        alt="Prishtina Festive Logo" 
                        width={180}
                        height={126}
                        className="w-40 h-40 object-contain"
                    />
                </div>

                {/* Main heading */}
                <h1 
                    ref={headingRef}
                    className="text-3xl sm:text-4xl lg:text-5xl text-[#367a3b] font-medium font-malkie-slab leading-tight"
                >
                    Faleminderit për interesimin e jashtëzakonshëm
                </h1>
                
                {/* Subtitle */}
                <p 
                    ref={subtitleRef}
                    className="text-lg sm:text-xl font-semibold text-[#031603] leading-relaxed"
                >
                    për aplikim për shtëpizë në <span className="font-bold text-[#367a3b] underline underline-offset-2">Verë n&apos;Dimën</span>
                </p>

                {/* Message */}
                <div className="space-y-4 max-w-2xl mx-auto">
                    <p ref={messageRef} className="text-base sm:text-lg text-[#031603] leading-relaxed">
                        Periudha e aplikimit ka mbaruar.
                    </p>
                    <p className="text-sm sm:text-base text-[#031603] opacity-80 leading-relaxed">
                        Për detaje dhe informata shtesë do të informoheni përmes rrjetave tona sociale.
                    </p>
                </div>

                {/* Bashkë në shesh - animated word by word */}
                <div ref={wordsRef} className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-8">
                    {['Bashkë', 'në', 'Shesh!'].map((word, index) => (
                        <span
                            key={index}
                            className="inline-block text-2xl sm:text-3xl lg:text-4xl text-[#EF5B13] font-malkie-slab"
                        >
                            {word}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
} 