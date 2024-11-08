import React from 'react';
import Image from 'next/image';
import logo from '../../../public/logo-prishtinafestive.png';

export const Header = () => {
    return (
        <div className='w-full justify-center items-center flex mt-[20px]'>
            <Image
                src={logo}
                alt="Logo"
                className='w-[139px] h-[58px] object-contain'
            />
        </div>
    );
};
