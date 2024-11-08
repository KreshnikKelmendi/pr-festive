import React from 'react';
import Image from 'next/image';
import logo from "../../../../public/verendimen-logo.png"
import { AppCriteria } from './AppCriteria';

export const Formpage = () => {
  return (
    <>
    <div className="bg-[#031603] w-full rounded-[5px] mt-[20px] items-center justify-center">
        <div className='justify-center flex py-[67px]'>
         <Image
                src={logo}
                alt="Logo"
                className='w-[200px] h-[200px] object-contain'
            />
            </div>
      {/* <div className="text-center pt-[80px]">
        <p className="text-[64px] text-[#FFBD02] font-bold ">Verë n'dimën!</p>
        <p className="text-[#FEEBDB] text-[24px]">Krejt bashkë n'shesh!</p>
      </div> */}

      <div className=''>
        <AppCriteria />
      </div>
    </div>
    </>
  );
};
