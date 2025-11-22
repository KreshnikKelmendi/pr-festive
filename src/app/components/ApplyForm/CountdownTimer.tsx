"use client";

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
    onDeadlineReached: () => void;
}

export default function CountdownTimer({ onDeadlineReached }: CountdownTimerProps) {
    const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0); // Set to next midnight (00:00:00)

            const difference = midnight.getTime() - now.getTime();

            if (difference <= 0) {
                setIsDeadlinePassed(true);
                setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
                onDeadlineReached();
                return;
            }

            const hours = Math.floor(difference / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeRemaining({ hours, minutes, seconds });
            setIsDeadlinePassed(false);
        };

        // Update immediately
        updateCountdown();

        // Update every second
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [onDeadlineReached]);

    if (isDeadlinePassed) {
        return (
            <div className="fixed top-3 right-3 z-50">
                <div className="text-right">
                    <p className="text-sm sm:text-base font-semibold text-[#367a3b]">
                        Faleminderit!
                    </p>
                    <p className="text-xs text-gray-600">
                        Aplikimet u mbyllën
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed top-3 right-3 z-50 text-right">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">
                Aplikimet mbyllen
            </p>
            <div className="flex items-center gap-1 sm:gap-2 justify-end">
                <span className="text-lg sm:text-xl font-bold text-[#367a3b] font-mono">
                    {String(timeRemaining.hours).padStart(2, '0')}
                </span>
                <span className="text-lg sm:text-xl font-bold text-[#367a3b]">:</span>
                <span className="text-lg sm:text-xl font-bold text-[#367a3b] font-mono">
                    {String(timeRemaining.minutes).padStart(2, '0')}
                </span>
                <span className="text-lg sm:text-xl font-bold text-[#367a3b]">:</span>
                <span className="text-lg sm:text-xl font-bold text-[#367a3b] font-mono">
                    {String(timeRemaining.seconds).padStart(2, '0')}
                </span>
            </div>
        </div>
    );
}

