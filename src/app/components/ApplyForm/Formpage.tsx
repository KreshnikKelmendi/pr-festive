"use client"

import React from 'react';
// import Image from 'next/image';
// import logo from "../../../../public/GREEN.png"
// import { AppCriteria } from './AppCriteria';
// import Header from '../Header';
import Banner from '../HomeBanner/Banner';
import ThankYouMessage from './ThankYouMessage';

// import SecondBanner from '../HomeBanner/SecondBanner';

export const Formpage = () => {
  return (
    <>
    <div className="relative">
    {/* <Header /> */}
      <Banner />
      {/* <SecondBanner /> */}
      {/* <AppCriteria /> */}
      {/* <ContactForm /> */}
      <ThankYouMessage />
    </div>
    </>
  );  
};
