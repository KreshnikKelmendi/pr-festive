"use client";

import { useState } from 'react';

export default function PaymentMethods() {
    const [selectedPayment, setSelectedPayment] = useState<string>('');

    return (
        <div className="flex justify-center py-12 px-4 lg:px-0 bg-gradient-to-br from-[#FFDB00] via-[#FFE55C] to-[#FFF2A3]">
            <div className="w-full max-w-4xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h2 className="text-3xl lg:text-4xl font-extrabold text-[#EF5B13] leading-tight animate-fade-in">
                        Zgjidhni Metodën e Pagesës
                    </h2>
                    <p className="text-lg text-[#031603] opacity-90 font-medium">
                        Përzgjidhni mënyrën tuaj të preferuar për pagesë
                    </p>
                </div>

                {/* Payment Options */}
                <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                    {/* Cash Payment */}
                    <div 
                        className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                            selectedPayment === 'cash' 
                                ? 'ring-4 ring-[#EF5B13] ring-opacity-50' 
                                : 'hover:shadow-xl'
                        }`}
                        onClick={() => setSelectedPayment('cash')}
                    >
                        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-[#EF5B13] border-opacity-30 hover:border-opacity-60 transition-all duration-300">
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#EF5B13] to-[#FF6B35] rounded-full flex items-center justify-center shadow-lg animate-float">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
                                    </svg>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="text-center space-y-4">
                                <h3 className="text-2xl font-bold text-[#EF5B13]">
                                    Paguaj me Cash
                                </h3>
                                <p className="text-[#031603] opacity-80 leading-relaxed">
                                    Pagesa e menjëhershme me para në dorë
                                </p>
                                
                                {/* Checkbox */}
                                <div className="flex justify-center">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                        selectedPayment === 'cash' 
                                            ? 'bg-[#EF5B13] border-[#EF5B13]' 
                                            : 'border-[#EF5B13] border-opacity-50'
                                    }`}>
                                        {selectedPayment === 'cash' && (
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card Payment */}
                    <div 
                        className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                            selectedPayment === 'card' 
                                ? 'ring-4 ring-[#EF5B13] ring-opacity-50' 
                                : 'hover:shadow-xl'
                        }`}
                        onClick={() => setSelectedPayment('card')}
                    >
                        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-[#EF5B13] border-opacity-30 hover:border-opacity-60 transition-all duration-300">
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#EF5B13] to-[#FF6B35] rounded-full flex items-center justify-center shadow-lg animate-float" style={{animationDelay: '0.5s'}}>
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
                                    </svg>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="text-center space-y-4">
                                <h3 className="text-2xl font-bold text-[#EF5B13]">
                                    Paguaj me Kartelë e Argon
                                </h3>
                                <p className="text-[#031603] opacity-80 leading-relaxed">
                                    Pagesa e sigurt me kartën e kreditit
                                </p>
                                
                                {/* Checkbox */}
                                <div className="flex justify-center">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                        selectedPayment === 'card' 
                                            ? 'bg-[#EF5B13] border-[#EF5B13]' 
                                            : 'border-[#EF5B13] border-opacity-50'
                                    }`}>
                                        {selectedPayment === 'card' && (
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selected Payment Display */}
                {selectedPayment && (
                    <div className="bg-white bg-opacity-90 rounded-xl p-6 shadow-xl border-2 border-[#EF5B13] border-opacity-30 backdrop-blur-sm animate-shimmer">
                        <div className="text-center">
                            <p className="text-lg text-[#031603] font-medium">
                                Metoda e zgjedhur: <span className="font-bold text-[#EF5B13]">
                                    {selectedPayment === 'cash' ? 'Paguaj me Cash' : 'Paguaj me Kartelë e Argon'}
                                </span>
                            </p>
                        </div>
                    </div>
                )}

                {/* Decorative elements */}
                <div className="flex justify-center space-x-4">
                    <div className="w-3 h-3 bg-[#EF5B13] rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-[#EF5B13] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-3 h-3 bg-[#EF5B13] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
            </div>
        </div>
    );
} 