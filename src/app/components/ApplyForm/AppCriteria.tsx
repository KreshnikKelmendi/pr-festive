import React from 'react'
import Image from 'next/image'
import sampleImage from '../../../../public/image1.png' // Adjust the path as needed
import secondImage from "../../../../public/pdfFile.png"

export const AppCriteria = () => {
  return (
    <div className='lg:px-32'>
      <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md">
        <Image 
          src={sampleImage} 
          alt="Sample" 
          className="rounded-lg mb-4" 
        />
        <div className='py-8 text-center'>
          <p className="text-[32px] font-bold text-[#EF5B13]">Kriteret e Aplikimit</p>
          <p className="text-[#031603] w-[381px] h-[26px]">
            Këtu mund të gjeni projekt dokumentin dhe kriteret kualifikuese për aplikim në shtëpizat "Verë n'Dimën".
          </p>
          
          <div className='flex justify-center items-center'>
            <a 
              href="/Thirrja per aplikim per tregun e fundvitit.pdf" 
              download="Thirrja per aplikim per tregun e fundvitit" 
              className='mt-10 flex items-center bg-[#EF5B13] px-4 py-4 rounded-[5px] text-white'
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
