"use client";

import { useState, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';
import pattern from "../../../../public/Vijat-01.png";

export default function ContactForm() {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [companyEmail, setCompanyEmail] = useState('');
    const [businessCertificate, setBusinessCertificate] = useState<File | null>(null);
    const [personalDocument, setPersonalDocument] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tooManyRequests, setTooManyRequests] = useState(false);
    const [showFileErrorModal, setShowFileErrorModal] = useState(false);
    const [selectedSpace, setSelectedSpace] = useState<string>('');
    const [submittedName, setSubmittedName] = useState('');
    const [submittedSurname, setSubmittedSurname] = useState('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!businessCertificate) {
            setFileError("Ju lutem ngarkoni certifikatën e biznesit të regjistruar në ARBK.");
            return;
        }

        if (!personalDocument) {
            setFileError("Ju lutem ngarkoni dokumentin personal të identifikimit.");
            return;
        }

        if (!selectedSpace) {
            setFileError("Ju lutem zgjidhni një hapësirë.");
            return;
        }

        setLoading(true);

        // Convert files to base64
        const convertFileToBase64 = (file: File): Promise<string> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
            });
        };

        try {
            const [base64BusinessCert, base64PersonalDoc] = await Promise.all([
                convertFileToBase64(businessCertificate),
                convertFileToBase64(personalDocument)
            ]);

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
                    businessCertificate: base64BusinessCert,
                    businessCertificateName: businessCertificate.name,
                    personalDocument: base64PersonalDoc,
                    personalDocumentName: personalDocument.name,
                    phoneNumber,
                    selectedSpace
                }),
            });

            const result = await response.json();
            setLoading(false);

            if (response.ok) {
                // Store the submitted names for the thank you message
                setSubmittedName(name);
                setSubmittedSurname(surname);
                setShowModal(true);
                // Clear form fields
                setName('');
                setSurname('');
                setCompanyName('');
                setCompanyEmail('');
                setBusinessCertificate(null);
                setPersonalDocument(null);
                setPhoneNumber('');
                setSelectedSpace('');
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

    const handleBusinessCertificateChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFile = e.target.files[0];
    
            const allowedTypes = [
                'application/pdf',
                'image/jpeg',
                'image/jpg',
                'image/png',
            ];
    
            if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
                setFileError('Lloji i skedarit nuk është i vlefshëm. Ju lutem ngarkoni një PDF, JPG, ose PNG.');
                setBusinessCertificate(null);
                setShowFileErrorModal(true);
            } else if (selectedFile.size > 2 * 1024 * 1024) {
                setFileError("Përmbajtja e ngarkuar është më e madhe se 2MB, ju lutem kompresoni përmbajtjen dhe provoni përsëri.");
                setBusinessCertificate(null);
                setShowFileErrorModal(true);
            } else {
                setFileError('');
                setBusinessCertificate(selectedFile);
            }
        }
    };

    const handlePersonalDocumentChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFile = e.target.files[0];
    
            const allowedTypes = [
                'application/pdf',
                'image/jpeg',
                'image/jpg',
                'image/png',
            ];
    
            if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
                setFileError('Lloji i skedarit nuk është i vlefshëm. Ju lutem ngarkoni një PDF, JPG, ose PNG.');
                setPersonalDocument(null);
                setShowFileErrorModal(true);
            } else if (selectedFile.size > 2 * 1024 * 1024) {
                setFileError("Përmbajtja e ngarkuar është më e madhe se 2MB, ju lutem kompresoni përmbajtjen dhe provoni përsëri.");
                setPersonalDocument(null);
                setShowFileErrorModal(true);
            } else {
                setFileError('');
                setPersonalDocument(selectedFile);
            }
        }
    };
    
    const closeModal = () => {
        setShowModal(false);
    };

    const closeTooManyRequestsAlert = () => {
        setTooManyRequests(false);
    };

    const closeFileErrorModal = () => {
        setShowFileErrorModal(false);
    };

    return (
        <div className="flex justify-center">
            <form onSubmit={handleSubmit} className="w-full bg-[#FFDB00] space-y-4 p-8">
                <Image src={pattern} alt="Logo" className="object-contain mx-auto" />
                <div className='lg:w-[409px] mx-auto'>
                    <p className="text-[32px] text-center font-extrabold text-[#EF5B13]">Apliko këtu!</p>
                    <p className="text-center">Plotëso të dhënat në hapësirat e mëposhtme për të aplikuar për shtëpizë në <b>&quot;Akull n&rsquo;Verë&quot;.</b></p>
                </div>

                {/* SEKSIONI 1: INFORMATA PERSONALE */}
                <div className="space-y-4">
                    <h3 className="text-[#EF5B13] font-bold text-lg text-center">INFORMATA PERSONALE</h3>
                    
                    <div className="flex flex-col lg:flex-row justify-center items-center space-x-0 lg:space-x-4 space-y-4 lg:space-y-0">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Emri"
                            required
                            className="block w-full lg:w-[244px] text-white px-4 py-3 border bg-[#031603] border-[#1D1D1B] rounded-[5px] focus:outline-none focus:ring focus:border-blue-500"
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
                </div>

                {/* SEKSIONI 2: DOKUMENTET PËR NGARKIM */}
                <div className="space-y-4">
                    <h3 className="text-[#EF5B13] font-bold text-lg text-center">DOKUMENTET PËR NGARKIM</h3>
                    
                    <input
                        type="file"
                        onChange={handleBusinessCertificateChange}
                        required
                        accept=".pdf, .jpg, .jpeg, .png"
                        className="lg:mt-1 block w-full lg:w-[503px] mx-auto px-4 py-3 bg-[#031603] rounded-md text-white shadow-sm focus:outline-none focus:ring focus:border-blue-500"
                    />
                    <div className="text-center text-black text-xs italic">
                        Ngarkoni certifikatën e biznesit të regjistruar në ARBK (PDF, JPG, PNG)
                    </div>
                    {businessCertificate && (
                        <div className="text-center text-green-600 text-sm font-medium">
                            ✓ {businessCertificate.name}
                        </div>
                    )}

                    <input
                        type="file"
                        onChange={handlePersonalDocumentChange}
                        required
                        accept=".pdf, .jpg, .jpeg, .png"
                        className="lg:mt-1 block w-full lg:w-[503px] mx-auto px-4 py-3 bg-[#031603] rounded-md text-black shadow-sm focus:outline-none focus:ring focus:border-blue-500"
                    />
                    <div className="text-center text-black text-xs mt-1 italic">
                        Ngarkoni dokumentin personal të identifikimit (PDF, JPG, PNG)
                    </div>
                    {personalDocument && (
                        <div className="text-center text-green-600 text-sm font-medium">
                            ✓ {personalDocument.name}
                        </div>
                    )}

                    <div className='flex items-center justify-start lg:w-[503px] mx-auto'>
                        <p className="lg:text-center mt-[-5px] lg:w-[503px] font-bold text-[12px] text-red-500 italic">
                             * Ju lutem mos ngarkoni përmbajtje më të madhe se 2MB për dokumentet tuaja.
                        </p>
                    </div>
                    {/* <div className="underline uppercase text-[#031603] mt-2 lg:text-center text-sm font-bold">
                        Ju lutem mos ngarkoni përmbajtje më të madhe se 2MB për skedar
                    </div> */}
                </div>

                {/* SEKSIONI 3: TË TJERA */}
                <div className="space-y-4">
                    <h3 className="text-[#EF5B13] font-bold text-lg text-center">ZGJIDHNI HAPËSIRËN</h3>
                    
                    <div className="space-y-3 lg:w-[503px] mx-auto">
                        <div className="flex items-center justify-start w-full px-4 py-3 bg-[#031603] rounded-md">
                            <input
                                type="radio"
                                name="space"
                                value="Skënderbeu"
                                checked={selectedSpace === 'Skënderbeu'}
                                onChange={(e) => setSelectedSpace(e.target.value)}
                                className="mr-3 h-5 w-5 accent-[#EF5B13]" 
                            />
                            <label className="text-[#EF5B13] text-sm font-medium">
                                <b className='uppercase'>Hapësira 1: Sheshi "Skënderbeu"</b> 
                                <span className='text-[10px] lg:text-[12px] italic text-white block'>Çmimi: 2,600.00€ + Tvsh</span>
                            </label>
                        </div>

                        <div className="flex items-center justify-start w-full px-4 py-3 bg-[#031603] rounded-md">
                            <input
                                type="radio"
                                name="space"
                                value="Zahir Pajaziti"
                                checked={selectedSpace === 'Zahir Pajaziti'}
                                onChange={(e) => setSelectedSpace(e.target.value)}
                                className="mr-3 h-5 w-5 accent-[#EF5B13]" 
                            />
                            <label className="text-[#EF5B13] text-sm font-medium">
                                <b className='uppercase'>Hapësira 2: Sheshi "Zahir Pajaziti"</b> 
                                <span className='text-[10px] lg:text-[12px] italic text-white block'>Çmimi: 2,400.00€ + Tvsh</span>
                            </label>
                        </div>

                        <div className="flex items-center justify-start w-full px-4 py-3 bg-[#031603] rounded-md">
                            <input
                                type="radio"
                                name="space"
                                value="Nëna Terezë"
                                checked={selectedSpace === 'Nëna Terezë'}
                                onChange={(e) => setSelectedSpace(e.target.value)}
                                className="mr-3 h-5 w-5 accent-[#EF5B13]" 
                            />
                            <label className="text-[#EF5B13] text-sm font-medium">
                                <b className='uppercase'>Hapësira 3: Sheshi "Nëna Terezë"</b> 
                                <span className='text-[10px] lg:text-[12px] italic text-white block'>Çmimi: 900.00€ + Tvsh</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center items-center">
                    <button
                        type="submit"
                        className="w-full lg:w-[200px]  bg-[#EF5B13] hover:bg-[#031603] hover:duration-200 ease-in-out text-white font-semibold py-2 rounded-[5px] transition duration-200 shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                    >
                        Dërgo
                    </button>
                </div>

                <p className="text-center text-[#031603] text-[12px] font-malkieslab">© 2025 Prishtina Festive</p>
                <Image src={pattern} alt="Logo" className="object-contain mx-auto" />
            </form>

            {loading && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                    <div className="w-16 h-16 border-t-4 border-b-4 border-[#031603] border-solid rounded-full animate-spin"></div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex lg:justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-md shadow-lg">
                        <p className="text-center font-bold uppercase text-2xl text-[#EF5B13]">Faleminderit për aplikimin!</p>
                        <p className="text-center font-medium text-lg mt-2">
                            I nderuar <span className="font-bold text-[#031603]">{submittedName} {submittedSurname}</span>,
                        </p>
                        <p className="text-center font-medium text-base mt-2">
                            Aplikimi juaj u dërgua me sukses. Për detaje tjera do të njoftoheni me kohë.
                        </p>
                        <button onClick={closeModal} className="mt-6 bg-[#EF5B13] hover:bg-[#031603] w-full text-white font-semibold py-3 px-4 rounded-md focus:outline-none transition duration-200">
                            Mbyll
                        </button>
                    </div>
                </div>
            )}

            {tooManyRequests && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-md shadow-lg">
                        <p className="text-center font-bold">Requests too quickly. Please try again later.</p>
                        <button onClick={closeTooManyRequestsAlert} className="mt-4 bg-[#031603] text-white font-semibold py-2 px-4 rounded-md focus:outline-none">
                            Close
                        </button>
                    </div>
                </div>
            )}

            {showFileErrorModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-md shadow-lg py-12">
                        <p className="text-center font-bold">{fileError}</p>
                        <button onClick={closeFileErrorModal} className="mt-4 w-full bg-[#EF5B13] hover:bg-[#031603] text-white font-semibold py-2 px-4 rounded-md focus:outline-none">
                            Mbyll
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
