"use client";

export default function ThankYouMessage() {
    return (
        <div className="relative z-10 flex justify-center py-12 px-4 lg:px-0 bg-[#FFDB00]">
            <div className="w-full max-w-4xl bg-gradient-to-br from-[#FFDB00] via-[#FFE55C] to-[#FFF2A3] space-y-6 p-12 rounded-2xl shadow-2xl border-4 border-[#EF5B13] relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-[#EF5B13] opacity-10 rounded-full -translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#EF5B13] opacity-10 rounded-full translate-x-12 translate-y-12"></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-[#EF5B13] opacity-5 rounded-full"></div>
                
                {/* Main content */}
                <div className="relative z-10 text-center space-y-8">
                    {/* Icon */}
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#EF5B13] to-[#FF6B35] rounded-full flex items-center justify-center shadow-2xl animate-float">
                            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>

                    {/* Main heading */}
                    <div className="space-y-4">
                        <h1 className="text-xl lg:text-5xl text-[#EF5B13] font-semibold leading-tight animate-fade-in">
                            Faleminderit për interesimin e jashtëzakonshëm
                        </h1>
                        
                        {/* Subtitle */}
                        <p className="text-sm lg:text-2xl font-semibold text-[#031603] opacity-90 leading-relaxed">
                            për aplikim për shtëpizë në <span className="font-bold text-[#EF5B13]">Akull n&apos;Verë</span>
                        </p>
                    </div>

                    {/* Decorative line */}
                    <div className="flex justify-center">
                        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#EF5B13] to-transparent rounded-full"></div>
                    </div>

                    {/* Additional message */}
                    <div className="bg-white bg-opacity-90 rounded-xl p-8 shadow-xl border-2 border-[#EF5B13] border-opacity-30 backdrop-blur-sm animate-shimmer">
                        <p className="text-lg text-[#031603] font-medium leading-relaxed">
                            Aplikimet janë të mbyllura.
                        </p>
                    </div>

                    {/* Decorative elements */}
                    <div className="flex justify-center space-x-4">
                        <div className="w-3 h-3 bg-[#EF5B13] rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-[#EF5B13] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-3 h-3 bg-[#EF5B13] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                </div>
            </div>
        </div>
    );
} 