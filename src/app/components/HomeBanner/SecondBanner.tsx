import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';


const SecondBanner = () => {
  const titleRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    // Set up the Intersection Observer
    const titleNode = titleRef.current;
    const videoNode = videoRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // When element is in view, trigger GSAP animation
            if (entry.target === titleNode) {
              gsap.to(titleNode, {
                opacity: 1,
                x: 0,
                duration: 0.8,
                ease: 'power2.out',
              });
            }
            if (entry.target === videoNode) {
              gsap.to(videoNode, {
                opacity: 1,
                duration: 0.8,
                ease: 'power2.out',
              });
            }
          } else {
            // Reset animations when out of view
            if (entry.target === titleNode) {
              gsap.to(titleNode, {
                opacity: 0,
                x: -100,
                duration: 0.8,
              });
            }
            if (entry.target === videoNode) {
              gsap.to(videoNode, {
                opacity: 0,
                duration: 0.8,
              });
            }
          }
        });
      },
      {
        threshold: 0.3, // Trigger animation when 30% of the element is in view
      }
    );

    // Observe the title and video elements
    if (titleNode) observer.observe(titleNode);
    if (videoNode) observer.observe(videoNode);

    // Clean up observer on component unmount
    return () => {
      if (titleNode) observer.unobserve(titleNode);
      if (videoNode) observer.unobserve(videoNode);
    };
  }, []);

  return (
    <div className="w-full flex lg:justify-center items-center px-5 lg:px-16 py-12 lg:py-20">
      <div className="w-full flex flex-col lg:flex-row items-center justify-between space-y-12 lg:space-y-0 lg:space-x-12">
        {/* Left Section: Title, Description, and Button */}
        <div
          ref={titleRef}
          className="lg:w-1/2 flex flex-col lg:items-start text-left opacity-0 transform -translate-x-12"
        >
          <p className="text-4xl sm:text-4xl lg:text-6xl font-bold text-[#031603] mb-6 font-custom1">
            PRISHTINA FESTIVE
          </p>
          <p className="text-base sm:text-lg lg:text-xl text-[#031603] mb-8 leading-[22px] font-custom">
            This is a description of the content. It provides an overview and encourages users to engage with the video or explore further.
            This is a description of the content. It provides an overview and encourages users to engage with the video or explore further.
          </p>
          <button className="px-8 py-3 w-full lg:w-[250px] bg-[#EF5B13] text-white rounded-[5px] hover:bg-[#031603] transition font-custom">
            Learn More
          </button>
        </div>

        {/* Right Section: Video with SVG Mask */}
        <div
          ref={videoRef}
          className="flex-1 w-full relative opacity-0"
        >
          <video
            autoPlay
            loop
            muted
            className="w-full h-[40vh] lg:h-[95vh] 2xl:h-[80vh] object-cover rounded-tl-[65%] rounded-br-[60%] rounded-tr-[30%] rounded-bl-[35%] border-none"
          >
            <source src="/video-7.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        
        </div>
      </div>
    </div>
  );
};

export default SecondBanner;
