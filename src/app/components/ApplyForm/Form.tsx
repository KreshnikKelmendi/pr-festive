"use client";

import { useState, ChangeEvent, FormEvent, useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { HiOutlineChevronDoubleDown } from 'react-icons/hi';
import pattern from "../../../../public/assets/pattern.png";
import image1 from "../../../../public/assets/zahiri.png";
import image2 from "../../../../public/assets/skenderbeu.png";
import image3 from "../../../../public/assets/wonderland.png";
import CountdownTimer from './CountdownTimer';

export default function ContactForm() {
    const prishtinaRef = useRef<HTMLHeadingElement>(null);
    const bashkeRef = useRef<HTMLHeadingElement>(null);
    const arrowRef = useRef<HTMLDivElement>(null);
    const [fullName, setFullName] = useState('');
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
    const [submittedFullName, setSubmittedFullName] = useState('');
    const [submittedSelectedSpace, setSubmittedSelectedSpace] = useState('');
    const [showSpaceErrorModal, setShowSpaceErrorModal] = useState(false);
    const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);

    // GSAP animations for headings
    useEffect(() => {
        if (prishtinaRef.current && bashkeRef.current) {
            const tl = gsap.timeline();
            
            // Animate "Prishtina Festive" - fade in and slide up
            tl.from(prishtinaRef.current, {
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: "power3.out"
            })
            // Animate "Bashkë në shesh!" - fade in and slide up with slight delay
            .from(bashkeRef.current, {
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: "power3.out",
                scale: 0.9
            }, "-=0.4");
        }
    }, []);

    // GSAP bounce animation for arrow
    useEffect(() => {
        if (arrowRef.current) {
            gsap.to(arrowRef.current, {
                y: 10,
                duration: 0.8,
                ease: "power2.inOut",
                repeat: -1,
                yoyo: true
            });
        }
    }, []);

    // Handle deadline reached
    const handleDeadlineReached = () => {
        setIsDeadlinePassed(true);
    };

    // Function to split full name into name and surname
    const splitFullName = (fullName: string) => {
        const trimmed = fullName.trim();
        if (!trimmed) return { name: '', surname: '' };
        
        const parts = trimmed.split(/\s+/);
        if (parts.length === 1) {
            return { name: parts[0], surname: '' };
        }
        
        const name = parts[0];
        const surname = parts.slice(1).join(' ');
        return { name, surname };
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isDeadlinePassed) {
            return;
        }

        if (!businessCertificate) {
            setFileError("Ju lutem ngarkoni certifikatën e biznesit të regjistruar në ARBK.");
            return;
        }

        if (!personalDocument) {
            setFileError("Ju lutem ngarkoni dokumentin personal të identifikimit.");
            return;
        }

        if (!selectedSpace) {
            setShowSpaceErrorModal(true);
            return;
        }

        setLoading(true);

        // Split full name into name and surname
        const { name, surname } = splitFullName(fullName);

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
                // Store the submitted full name and selected space for the thank you message
                setSubmittedFullName(fullName);
                setSubmittedSelectedSpace(selectedSpace);
                setShowModal(true);
                // Clear form fields
                setFullName('');
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

    const closeSpaceErrorModal = () => {
        setShowSpaceErrorModal(false);
    };

    return (
        <div className="flex justify-center mt-[-8px] p-8">
            <form onSubmit={handleSubmit} className="w-full space-y-4">
                {/* Logo centered at top */}
                <div className="flex justify-center mb-6">
                    <Image 
                        src="/assets/logo-2025.png" 
                        alt="Logo" 
                        width={170}
                        height={120}
                        className="w-40 h-40 sm:w-32 sm:h-32 object-contain"
                    />
                </div>

                {/* Header Text */}
                <div className="text-center mb-6 space-y-2">
                    <h1 ref={prishtinaRef} className="text-xl sm:text-2xl font-bold font-malkie-slab text-[#031603]">
                        Prishtina Festive
                    </h1>
                    <h2 ref={bashkeRef} className="text-3xl sm:text-4xl text-[#367a3b] font-malkie-slab">
                        Bashkë në shesh!
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 font-aerialpro mt-4">
                        Këtu mund të gjeni dokumentin mbi detajet për aplikimin për shtëpizë në <b>Verë n&apos;Dimën</b>
                    </p>
                </div>

                {/* Countdown Timer Component */}
                <CountdownTimer onDeadlineReached={handleDeadlineReached} />

                {/* PDF Document View/Download */}
                <div className="flex flex-col items-center gap-3 mb-6">
                    <a 
                        href="/assets/Thirrje-per-aplikim.pdf" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-[#367a3b] text-white rounded hover:bg-[#2d5f32] font-aerialpro text-base transition shadow-md hover:shadow-lg"
                    >
                        Shiko dokumentin
                    </a>
                    <div ref={arrowRef} className="flex justify-center">
                        <HiOutlineChevronDoubleDown className="text-[#367a3b] text-2xl" />
                    </div>
                </div>

                <Image src={pattern} alt="Logo" className="lg:w-[100ch] w-full object-contain mx-auto" />
                <div className='lg:w-[409px] mx-auto'>
                    <p className="text-[32px] text-center font-extrabold font-malkie-slab text-[#1d1d1b]">Apliko këtu!</p>
                    <p className="text-center">Plotëso të dhënat në hapësirat e mëposhtme për të aplikuar për shtëpizë në <b>&quot;Verë n&rsquo;Dimën&quot;.</b></p>
                </div>

                {/* SEKSIONI 1: INFORMATA PERSONALE */}
                {!isDeadlinePassed ? (
                <>
                <div className="space-y-4">
                    <h3 className="text-[#367a3b] font-bold text-lg text-center">INFORMATA PERSONALE</h3>
                    
                    <div className="w-full max-w-[700px] mx-auto space-y-4">
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Shkruani emrin dhe mbiemrin"
                            required
                            className="block w-full px-4 py-3 bg-[#031603] text-white border border-[#EF5B13]/30 rounded-md focus:outline-none focus:border-[#EF5B13] transition-all"
                        />

                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Emri i kompanisë"
                            required
                            className="block w-full px-4 py-3 bg-[#031603] text-white border border-[#EF5B13]/30 rounded-md focus:outline-none focus:border-[#EF5B13] transition-all"
                        />

                        <div className="flex flex-col lg:flex-row gap-4">
                            <input
                                type="email"
                                value={companyEmail}
                                onChange={(e) => setCompanyEmail(e.target.value)}
                                placeholder="Email adresa"
                                required
                                className="flex-1 px-4 py-3 bg-[#031603] text-white border border-[#EF5B13]/30 rounded-md focus:outline-none focus:border-[#EF5B13] transition-all"
                            />

                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="Nr.kontaktues"
                                required
                                className="flex-1 px-4 py-3 bg-[#031603] text-white border border-[#EF5B13]/30 rounded-md focus:outline-none focus:border-[#EF5B13] transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* SEKSIONI 2: DOKUMENTET PËR NGARKIM */}
                <div className="space-y-4">
                    <h3 className="text-[#367a3b] font-bold text-lg text-center">DOKUMENTET PËR NGARKIM</h3>
                    
                    <div className="w-full max-w-[700px] mx-auto space-y-4">
                        {/* File inputs in flex layout */}
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Business Certificate */}
                            <div className="flex-1 space-y-2">
                                <label className="block">
                                    <input
                                        type="file"
                                        onChange={handleBusinessCertificateChange}
                                        required
                                        accept=".pdf, .jpg, .jpeg, .png"
                                        className="block w-full px-4 py-3 bg-[#031603] text-white border border-[#EF5B13]/30 rounded-md focus:outline-none focus:border-[#EF5B13] transition-all file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#367a3b] file:text-white hover:file:bg-[#c43b32] file:cursor-pointer cursor-pointer"
                                    />
                                </label>
                                <p className="text-[#c43b32] text-xs italic text-center lg:text-left">
                                    Certifikata e biznesit e regjistruar në ARBK (PDF, JPG, PNG)
                                </p>
                                {businessCertificate && (
                                    <div className="text-center lg:text-left text-[#367a3b] text-xs font-medium truncate">
                                        ✓ {businessCertificate.name}
                                    </div>
                                )}
                            </div>

                            {/* Personal Document */}
                            <div className="flex-1 space-y-2">
                                <label className="block">
                                    <input
                                        type="file"
                                        onChange={handlePersonalDocumentChange}
                                        required
                                        accept=".pdf, .jpg, .jpeg, .png"
                                        className="block w-full px-4 py-3 bg-[#031603] text-white border border-[#EF5B13]/30 rounded-md focus:outline-none focus:border-[#EF5B13] transition-all file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#367a3b] file:text-white hover:file:bg-[#c43b32] file:cursor-pointer cursor-pointer"
                                    />
                                </label>
                                <p className="text-[#c43b32] text-xs italic text-center lg:text-left">
                                    Ngarkoni dokumentin personal të identifikimit
                                </p>
                                {personalDocument && (
                                    <div className="text-center lg:text-left text-[#367a3b] text-xs font-medium truncate">
                                        ✓ {personalDocument.name}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Warning message */}
                        <div className="w-full">
                            <p className="text-center text-[#c43b32] text-xs font-semibold italic">
                                * Ju lutem mos ngarkoni përmbajtje më të madhe se 2MB për dokumentet tuaja.
                            </p>
                        </div>
                    </div>
                </div>

                {/* SEKSIONI 3: ZGJIDHNI HAPËSIRËN */}
                <div>
                    <h3 className="text-[#367a3b] font-bold text-lg text-center mb-4">ZGJIDHNI HAPËSIRËN</h3>
                    
                    <div className="grid grid-cols-3 gap-3 lg:gap-4 w-full max-w-[700px] mx-auto">
                        {/* Option 1: Sheshi Skënderbeu */}
                        <label 
                            className={`group relative flex flex-col items-center p-2 lg:p-3 cursor-pointer transition-all duration-150 ${
                                selectedSpace === 'Sheshi Skënderbeu'
                                    ? 'opacity-100'
                                    : 'opacity-100 hover:opacity-90'
                            }`}
                        >
                            {/* Image - Fixed square size */}
                            <div className="relative w-24 h-24 lg:w-44 lg:h-44 mb-3 lg:mb-4 overflow-hidden mx-auto">
                                <Image
                                    src={image2}
                                    alt="Sheshi Skënderbeu"
                                    fill
                                    className="object-cover rounded-md"
                                    priority={false}
                                />
                            </div>
                            
                            {/* Name */}
                            <div className="flex flex-col items-center text-center w-full mb-3">
                                <span className="text-[#367a3b] text-sm lg:text-base font-bold leading-tight">
                                    Sheshi &quot;Skënderbeu&quot;
                                </span>
                            </div>

                            {/* Checkbox */}
                            <div className="flex items-center justify-center">
                                <div className={`w-5 h-5 lg:w-6 lg:h-6 border-2 flex items-center justify-center transition-all ${
                                    selectedSpace === 'Sheshi Skënderbeu'
                                        ? 'border-[#36713b] bg-[#367a3b]'
                                        : 'border-[#367a3b] group-hover:border-[#87c260] bg-transparent'
                                }`}>
                                    {selectedSpace === 'Sheshi Skënderbeu' && (
                                        <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#c43b32]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <input
                                    type="radio"
                                    name="space"
                                    value="Sheshi Skënderbeu"
                                    checked={selectedSpace === 'Sheshi Skënderbeu'}
                                    onChange={(e) => setSelectedSpace(e.target.value)}
                                    className="absolute opacity-0 w-0 h-0" 
                                />
                            </div>
                        </label>

                        {/* Option 2: Sheshi Zahir Pajaziti */}
                        <label 
                            className={`group relative flex flex-col items-center p-2 lg:p-3 cursor-pointer transition-all duration-150 ${
                                selectedSpace === 'Sheshi Zahir Pajaziti'
                                    ? 'opacity-100'
                                    : 'opacity-100 hover:opacity-90'
                            }`}
                        >
                            {/* Image - Fixed square size */}
                            <div className="relative w-24 h-24 lg:w-44 lg:h-44 mb-3 lg:mb-4 overflow-hidden mx-auto">
                                <Image
                                    src={image1}
                                    alt="Sheshi Zahir Pajaziti"
                                    fill
                                    className="object-cover rounded-md"
                                    priority={false}
                                />
                            </div>
                            
                            {/* Name */}
                            <div className="flex flex-col items-center text-center w-full mb-3">
                                <span className="text-[#367a3b] text-sm lg:text-base font-bold leading-tight">
                                    Sheshi &quot;Zahir Pajaziti&quot;
                                </span>
                            </div>

                            {/* Checkbox */}
                            <div className="flex items-center justify-center">
                                <div className={`w-5 h-5 lg:w-6 lg:h-6 border-2 flex items-center justify-center transition-all ${
                                    selectedSpace === 'Sheshi Zahir Pajaziti'
                                        ? 'border-[#367a3b] bg-[#367a3b]'
                                        : 'border-[#367a3b] group-hover:border-[#87c260] bg-transparent'
                                }`}>
                                    {selectedSpace === 'Sheshi Zahir Pajaziti' && (
                                        <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#c43b32]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <input
                                    type="radio"
                                    name="space"
                                    value="Sheshi Zahir Pajaziti"
                                    checked={selectedSpace === 'Sheshi Zahir Pajaziti'}
                                    onChange={(e) => setSelectedSpace(e.target.value)}
                                    className="absolute opacity-0 w-0 h-0" 
                                />
                            </div>
                        </label>

                        {/* Option 3: Wonderland */}
                        <label 
                            className={`group relative flex flex-col items-center p-2 lg:p-3 cursor-pointer transition-all duration-150 ${
                                selectedSpace === 'Wonderland (me mjete motorike)'
                                    ? 'opacity-100'
                                    : 'opacity-100 hover:opacity-90'
                            }`}
                        >
                            {/* Image - Fixed square size */}
                            <div className="relative w-24 h-24 lg:w-44 lg:h-44 mb-3 lg:mb-4 overflow-hidden mx-auto">
                                <Image
                                    src={image3}
                                    alt="Wonderland"
                                    fill
                                    className="object-cover rounded-md"
                                    priority={false}
                                />
                            </div>
                            
                            {/* Name */}
                            <div className="flex flex-col items-center text-center w-full mb-3">
                                <span className="text-[#367a3b] text-sm lg:text-base font-bold leading-tight">
                                    Sheshi &quot;Adem Jashari&quot; Prishtina Wonderland
                                </span>
                                <span className="text-[#031603]/80 text-[11px] underline underline-offset-4 lg:text-base mt-0.5 italic">(me mjete motorike)</span>
                            </div>

                            {/* Checkbox */}
                            <div className="flex items-center justify-center">
                                <div className={`w-5 h-5 lg:w-6 lg:h-6 border-2 flex items-center justify-center transition-all ${
                                    selectedSpace === 'Wonderland (me mjete motorike)'
                                        ? 'border-[#367a3b] bg-[#367a3b]'
                                        : 'border-[#367a3b] group-hover:border-[#87c260] bg-transparent'
                                }`}>
                                    {selectedSpace === 'Wonderland (me mjete motorike)' && (
                                        <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#c43b32]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <input
                                    type="radio"
                                    name="space"
                                    value="Wonderland (me mjete motorike)"
                                    checked={selectedSpace === 'Wonderland (me mjete motorike)'}
                                    onChange={(e) => setSelectedSpace(e.target.value)}
                                    className="absolute opacity-0 w-0 h-0" 
                                />
                            </div>
                        </label>
                    </div>
                </div>

                <div className="w-full max-w-[700px] mx-auto">
                    {loading ? (
                        <div className="w-full py-3 flex items-center justify-center">
                            <span className="flex items-center gap-1 text-[#367a3b] font-semibold text-lg">
                                Duke u procesuar
                                <span className="flex gap-1 ml-1">
                                    <span className="animate-bounce-dot" style={{ animationDelay: '0s' }}>.</span>
                                    <span className="animate-bounce-dot" style={{ animationDelay: '0.2s' }}>.</span>
                                    <span className="animate-bounce-dot" style={{ animationDelay: '0.4s' }}>.</span>
                                </span>
                            </span>
                        </div>
                    ) : (
                        <button
                            type="submit"
                            className="w-full bg-[#367a3b] hover:bg-[#1d1d1b] text-white font-semibold py-3 rounded-md transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            Dërgo
                        </button>
                    )}
                </div>
                </>
                ) : null}

                <p className="text-center text-[#031603] text-[12px] font-malkieslab">© 2025 Prishtina Festive</p>
                <Image src={pattern} alt="Logo" className="object-contain lg:w-[100ch] w-full pb-8 mx-auto" />
            </form>

            {showModal && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex lg:justify-center items-center z-50 p-4 animate-fadeIn"
                    onClick={closeModal}
                >
                    <div 
                        className="p-8 rounded-xl shadow-2xl max-w-lg w-full border border-[#367a3b]/10 animate-scaleIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center mb-8">
                            {/* Success Icon with Animation */}
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#367a3b]/20 to-[#87c260]/20 mb-6 animate-bounceIn">
                                <div className="w-16 h-16 rounded-full bg-[#367a3b]/10 flex items-center justify-center">
                                    <svg className="w-10 h-10 text-[#367a3b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            
                            {/* Thank You Message */}
                            <h2 className="text-center font-bold text-2xl text-[#1d1d1b] mb-4 leading-tight">
                                Faleminderit <span className="font-bold text-[#367a3b]">{submittedFullName}</span> që aplikuat për shtëpizë në Verë n&rsquo;Dimën.
                            </h2>
                            
                            {/* Professional Message */}
                            <div className="space-y-3 text-[#1d1d1b] leading-relaxed">
                               
                                <p className="text-base">
                                    Ju keni zgjedhur hapësirën <span className="font-semibold text-[#367a3b]">{submittedSelectedSpace}</span>.
                                </p>
                                <p className="text-base text-[#1d1d1b]/80">
                                    Për detaje tjera do të njoftoheni me kohë.
                                </p>
                            </div>
                        </div>
                        
                        {/* Close Button */}
                        <button 
                            onClick={closeModal} 
                            className="w-full bg-[#367a3b] hover:bg-[#1d1d1b] text-white font-semibold py-3 px-6 rounded-lg focus:outline-none transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                        >
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

            {showSpaceErrorModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-md shadow-lg py-12">
                        <p className="text-center font-bold text-lg">Ju lutem zgjidhni një hapësirë</p>
                        <button onClick={closeSpaceErrorModal} className="mt-4 w-full bg-[#EF5B13] hover:bg-[#031603] text-white font-semibold py-2 px-4 rounded-md focus:outline-none">
                            Mbyll
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
