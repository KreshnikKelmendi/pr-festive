'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import secondImage from "../../../../public/pdfFile.png"

export const AppCriteria = () => {
  const [isMuted, setIsMuted] = useState(true);

  const toggleSound = () => {
    setIsMuted(prev => !prev);
  };

  return (
    <div className='lg:px-32'>
      <div className="flex flex-col items-center bg-white rounded-lg relative">
        <video 
          src="/FINAL WIDE (1).mp4"
          playsInline
          autoPlay
          loop
          muted={isMuted}
          className="rounded-lg mb-4 w-full h-auto"
        >
          Your browser does not support the video tag.
        </video>

        {/* Sound Toggle Button */}
        <button 
          onClick={toggleSound} 
          className="absolute top-4 left-4 p-1 flex justify-center items-center rounded-full shadow-md focus:outline-none"
          aria-label="Toggle Sound"
        >
          {isMuted ? "🔇" : "🔊"}
        </button>
        
        <div className='py-8 text-center'>
          <p className="text-[32px] font-bold text-[#EF5B13]">Kriteret e Aplikimit</p>
          <p className="text-[#031603] lg:w-[381px] h-[26px] px-1 lg:px-0">
            Këtu mund të gjeni projekt dokumentin dhe kriteret kualifikuese për aplikim në shtëpizat Verë n&rsquo;Dimën&quot;
          </p>
          
          <div className='flex justify-center items-center'>
            <a 
              href="/Thirrja per aplikim per tregun e fundvitit.pdf" 
              download="Thirrja per aplikim per tregun e fundvitit" 
              className='mt-10 flex items-center bg-[#EF5B13] px-4 py-4 rounded-[5px] text-white hover:bg-[#031603] hover:duration-200 ease-in-out'
              target='_blank'
            >
              <Image 
                src={secondImage} 
                alt="Document Icon" 
                className="w-[27px] h-[23px] mr-2" 
              />
              Shkarko Dokumentin
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
