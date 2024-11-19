import Image from "next/image";
import React from "react";
import pattern from "../../../../public/pattern.png";

const Closed = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#031603] px-6 lg:px-32 py-12">
      <div className="w-full bg-white rounded-lg shadow-lg p-8 space-y-8 text-center">
        {/* Logo */}
        <div>
          <Image
            src={pattern}
            alt="Logo"
            className="object-contain mx-auto h-24"
          />
        </div>

        {/* Main Message */}
        <h1 className="text-3xl lg:text-4xl font-bold text-[#031603]">
          Aplikimet për shtëpizat për tregun e fundvitit **VERE N'DIMEN** janë mbyllur.
        </h1>

        {/* Thank You */}
        <p className="text-gray-700 text-lg lg:text-xl font-medium">
          Faleminderit për interesimin e jashtëzakonshëm që keni treguar për të qenë pjesë e festës sonë të përbashkët.
        </p>

        {/* Additional Information */}
        <p className="text-gray-700 text-lg">
          Për më shumë informacione dhe detaje të tjera, ju ftojmë të ndiqni njoftimet tona përmes kanaleve tona zyrtare.
        </p>
      </div>
    </div>
  );
};

export default Closed;
