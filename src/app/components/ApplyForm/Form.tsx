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
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tooManyRequests, setTooManyRequests] = useState(false);
    const [showFileErrorModal, setShowFileErrorModal] = useState(false); // New state for file error modal

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!file) {
            setFileError("Please upload a file.");
            return;
        }

        setLoading(true);

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const base64File = reader.result as string;

            try {
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
                setLoading(false);

                if (response.ok) {
                    setShowModal(true);
                    // Clear form fields
                    setName('');
                    setSurname('');
                    setCompanyName('');
                    setCompanyEmail('');
                    setFile(null);
                    setPhoneNumber('');
                } else if (response.status === 429) {
                    setTooManyRequests(true);
                } else {
                    setFileError(`Error: ${result.error}`);
                }
            } catch {
                setLoading(false);
                setFileError("There was an error with the request.");
            }
        };
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFile = e.target.files[0];

            const allowedTypes = [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'image/jpeg',
                'image/jpg',
            ];

            if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
                setFileError('Invalid file type. Please upload a PDF, DOCX, or JPG file.');
                setFile(null);
                setShowFileErrorModal(true); // Show error modal
            } else if (selectedFile.size > 1024 * 1024) { // Check for file size > 1MB
                setFileError("Përmbajtja e ngarkuar është më e madhe se 1MB, ju lutem kompresoni përmbajtjen dhe provoni përsëri.");
                setFile(null);
                setShowFileErrorModal(true); // Show error modal
            } else {
                setFileError('');
                setFile(selectedFile);
            }
        }
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const closeTooManyRequestsAlert = () => {
        setTooManyRequests(false);
    };

    const closeFileErrorModal = () => { // Function to close file error modal
        setShowFileErrorModal(false);
    };

    return (
        <div className="flex justify-center lg:px-32 py-8 bg-[#031603]">
            <form onSubmit={handleSubmit} className="w-full bg-white rounded-[5px] space-y-4 p-8">
                <Image src={pattern} alt="Logo" className="object-contain mx-auto" />
                <div className='lg:w-[409px] mx-auto'>
                    <p className="text-[32px] text-center font-extrabold text-[#EF5B13]">Apliko këtu!</p>
                    <p className="text-center">Plotëso të dhënat në hapësirat e mëposhtme për të aplikuar për shtëpizë në <b>&quot;Verë n&rsquo;Dimën&quot;.</b></p>
                </div>
                <div className="flex flex-col lg:flex-row justify-center items-center space-x-0 lg:space-x-4 space-y-4 lg:space-y-0">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Emri"
                        required
                        className="block w-full lg:w-[244px] text-white px-4 py-3 border bg-[#031603] border-gray-300 rounded-[5px] focus:outline-none focus:ring focus:border-blue-500"
                    />

                    <input
                        type="text"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        placeholder="Mbiemri"
                        required
                        className="lg:mt-1 block w-full lg:w-[244px] px-4 py-3 bg-[#031603] text-white rounded-[5px] focus:outline-none focus:ring focus:border-blue-500"
                    />
                </div>

                <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Emri i Kompanisë"
                    required
                    className="lg:mt-1 block w-full lg:w-[503px] mx-auto px-4 py-3 bg-[#031603] text-white border-gray-300 rounded-[5px] focus:outline-none focus:ring focus:border-blue-500"
                />

                <div className="lg:flex lg:justify-center lg:space-x-4 flex-col lg:flex-row space-y-4 lg:space-y-0">
                    <input
                        type="email"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        placeholder="Email i Kompanisë"
                        required
                        className="block w-full lg:w-[244px] px-4 py-3 bg-[#031603] rounded-md text-white shadow-sm focus:outline-none focus:ring focus:border-blue-500"
                    />

                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Nr.Tel"
                        required
                        className="lg:mt-1 block w-full lg:w-[244px] px-4 py-3 bg-[#031603] rounded-[5px] text-white focus:outline-none focus:ring focus:border-blue-500"
                    />
                </div>

                <div>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        required
                        accept=".pdf, .docx, .jpg, .jpeg"
                        className="lg:mt-1 block w-full lg:w-[503px] mx-auto px-4 py-3 bg-[#031603] rounded-md text-white shadow-sm focus:outline-none focus:ring focus:border-blue-500"
                    />
                    <p className="text-center pt-2 font-bold text-sm text-[#EF5B13]">
                        * Bashkangjit certifikatën e biznesit dhe <br />
                        dokumentin personal të identifikimit (të skanuar në të njëjtin dokument)
                    </p>
                    <div className="underline uppercase text-[#031603] mt-2 text-center text-sm font-bold">
                        Ju lutem mos ngarkoni përmbajtje më të madhe se 1MB
                    </div>
                </div>

                <div className="flex justify-center items-center">
                    <button
                        type="submit"
                        className="w-[200px] bg-[#EF5B13] hover:bg-[#031603] hover:duration-200 ease-in-out text-white font-semibold py-2 rounded-[5px] transition duration-200 shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                    >
                        Dërgo
                    </button>
                </div>

                <p className="text-center text-[#031603] text-[12px]">© 2024 Prishtina Festive</p>
                <Image src={pattern} alt="Logo" className="object-contain mx-auto" />
            </form>

            {loading && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                    <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 border-solid rounded-full animate-spin"></div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-8 rounded-lg text-center">
                        <h2 className="text-xl font-bold text-[#031603]">Faleminderit!</h2>
                        <p className="mt-2 text-[#031603]">Aplikimi juaj është dërguar me sukses. Për detaje tjera do të njoftoheni me kohë!</p>
                        <button
                            onClick={closeModal}
                            className="mt-4 bg-[#031603] text-white font-semibold py-2 px-4 rounded-md"
                        >
                            Mbyll
                        </button>
                    </div>
                </div>
            )}

            {tooManyRequests && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-8 rounded-lg text-center">
                        <h2 className="text-xl font-semibold text-[#031603]">Përgjigje e ngadaltë</h2>
                        <p className="mt-2 text-[#031603]">Kemi shumë kërkesa. Ju lutem provoni më vonë.</p>
                        <button
                            onClick={closeTooManyRequestsAlert}
                            className="mt-4 bg-[#031603] text-white font-semibold py-2 px-4 rounded-md"
                        >
                            Mbyll
                        </button>
                    </div>
                </div>
            )}

            {showFileErrorModal && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-8 rounded-lg text-center">
                        <h2 className="text-xl font-semibold text-[#031603]">Gabim në ngarkim</h2>
                        <p className="mt-2 text-[#031603]">{fileError}</p>
                        <button
                            onClick={closeFileErrorModal}
                            className="mt-4 bg-[#031603] text-white font-semibold py-2 px-4 rounded-md"
                        >
                            Mbyll
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
