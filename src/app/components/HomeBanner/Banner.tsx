"use client";
import Image from "next/image";
import logo from "../../../../public/assets/logo-2025.png";
import { MdKeyboardDoubleArrowDown } from "react-icons/md";

export default function Banner(): JSX.Element {
  const handleViewPDF = () => {
    window.open('/assets/pdf-verendimen.pdf', '_blank');
  };

  const scrollToForm = () => {
    const formSection = document.getElementById('apply-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full bg-[#FFDB00]">
      <div className="flex flex-col items-center justify-center p-8">
        {/* Logo */}
        <div className="mb-14">
          <Image
            src={logo}
            alt="Prishtina Festive Logo"
            width={240}
            height={120}
            className="mx-auto"
            priority
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-7xl lg:text-5xl font-bold text-[#1D1D1B] mb-8 font-malkie-slab text-center leading-tight">
          Prishtina Festive
        </h1>
        
        {/* Subtitle */}
        <p className="text-3xl md:text-5xl text-[#367a3b] font-semibold  font-malkie-slab tracking-[1px] text-center leading-snug">
          A doni me nxe Dimnin?
        </p>

        {/* Description */}
        <p className="text-base md:text-xl text-[#1D1D1B] mb-14 font-aeonik-pro text-center max-w-3xl mx-auto leading-normal">
          Këtu mund të gjeni projekt dokumentin dhe kriteret kualifikuese për aplikim në shtëpizat &quot;Verë n&rsquo;Dimën&quot;.
        </p>

        {/* View Button */}
        <div className="mb-10">
          <button
            onClick={handleViewPDF}
            className="bg-[#367a3b] text-white px-8 py-3 font-bold text-base lg:text-xl hover:bg-[#87c260] transition-colors duration-300 font-aeonik-pro shadow-lg rounded-md flex items-center gap-2 mx-auto"
          >
            
            Shiko Dokumentin
          </button>
        </div>

        {/* Down Arrow Only */}
        <div className="text-center">
          <button
            onClick={scrollToForm}
            className="text-[#1D1D1B] hover:text-[#EF5B13] transition-colors duration-300"
          >
            <div className="flex flex-col items-center space-y-1">
              <MdKeyboardDoubleArrowDown color="#367a3b" className="w-10 h-10 animate-bounce" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

<style jsx global>{`
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(20px); }
}
.animate-bounce-slow {
  animation: bounce-slow 1.5s infinite;
}
.delay-300 {
  animation-delay: 0.3s;
}
`}</style>
