"use client";

import { useState, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';
import pattern from "../../../../public/pattern.png";

export default function ContactForm() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [errorMessage, setErrorMessage] = useState<string>(''); // Error message state
  const [loading, setLoading] = useState(false); // Loading state

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      setErrorMessage("Please upload a file.");
      return;
    }

    setLoading(true); // Start loading spinner

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64File = reader.result as string;

      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          surname,
          companyName,
          companyEmail,
          file: base64File,
          phoneNumber,
        }),
      });

      const result = await response.json();
      setLoading(false); // Stop loading spinner

      if (response.ok) {
        setShowModal(true); // Show modal after successful submission
      } else {
        setErrorMessage(`Error: ${result.error}`);
      }
    };
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];

      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg'];

      if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
        setFileError('Invalid file type. Please upload a PDF, DOCX, or JPG file.');
        setFile(null);
      } else {
        setFileError('');
        setFile(selectedFile);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false); // Close modal when the user clicks close
  };

  return (
    <div className="flex justify-center lg:px-32 py-8 bg-[#031603]">
      <form onSubmit={handleSubmit} className="w-full bg-white rounded-[5px] space-y-6 p-8">
        <Image
          src={pattern}
          alt="Logo"
          className='object-contain mx-auto'
        />
        <p className="text-[32px] text-center text-[#EF5B13]">Formulari për Aplikim</p>
        <p className='text-center'>Plotëso formularin për të aplikuar për shtëpizë në &quot;Verë n&rsquo;Dimën&quot;.</p>

        <div className="flex flex-col lg:flex-row justify-center items-center space-x-0 lg:space-x-4 space-y-4 lg:space-y-0">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Emri"
            required
            className="mt-1 block w-full lg:w-[244px] text-white px-4 py-3 border bg-[#031603] border-gray-300 rounded-[5px] focus:outline-none focus:ring focus:border-blue-500"
          />

          <input
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            placeholder="Mbiemri"
            required
            className="mt-1 block w-full lg:w-[244px] px-4 py-3 bg-[#031603] text-white rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-500"
          />
        </div>

        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Emri i Kompanisë"
          required
          className="mt-1 block w-full lg:w-[503px] mx-auto px-4 py-3 bg-[#031603] text-white border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-500"
        />

        <div className="lg:flex lg:justify-center lg:space-x-4 flex-col lg:flex-row space-y-4 lg:space-y-0">
          <input
            type="email"
            value={companyEmail}
            onChange={(e) => setCompanyEmail(e.target.value)}
            placeholder="Email i Kompanisë"
            required
            className="mt-1 block w-full lg:w-[244px] px-4 py-3 bg-[#031603] rounded-md text-white shadow-sm focus:outline-none focus:ring focus:border-blue-500"
          />

          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Phone Number"
            required
            className="mt-1 block w-full lg:w-[244px] px-4 py-3 bg-[#031603] rounded-md text-white shadow-sm focus:outline-none focus:ring focus:border-blue-500"
          />
        </div>

        <div>
          <input
            type="file"
            onChange={handleFileChange}
            required
            accept=".pdf, .docx, .jpg, .jpeg"
            className="mt-1 block w-full lg:w-[503px] mx-auto px-4 py-3 bg-[#031603] rounded-md text-white shadow-sm focus:outline-none focus:ring focus:border-blue-500"
          />
          <p className='text-center pt-2 font-bold text-sm text-[#EF5B13]'>* Bashkangjit certifikatën e biznesit dhe <br />dokumentin personal të identifikimit (të skanuar në të njëjtin dokument)</p>
          {fileError && <p className="text-red-500 text-sm mt-2">{fileError}</p>}
        </div>

        <div className="flex justify-center items-center">
          <button
            type="submit"
            className="w-[200px] bg-[#EF5B13] hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition duration-200 shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
          >
            Send
          </button>
         
        </div>
        <p className='text-center'>© 2024 Prishtina Festive</p>
        <Image
          src={pattern}
          alt="Logo"
          className='object-contain mx-auto'
        />
      </form>

      {/* Loading Spinner */}
      {loading && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      )}

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-80 text-center">
            <p className="text-xl text-[#EF5B13]">Faleminderit {name} {surname}</p>
            <p className="mt-2">Për detaje tjera do të njoftoheni me kohë.</p>
            <button
              onClick={closeModal}
              className="mt-4 w-full bg-[#EF5B13] hover:bg-blue-600 text-white font-semibold py-2 rounded-md"
            >
              MBYLL
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white py-2 px-4 rounded-md">
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
