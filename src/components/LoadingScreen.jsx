import React from 'react';

export function LoadingScreen({ isLoading }) {
    return (
        <div
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-1000 ease-in-out ${isLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
        >
            <div className="flex flex-col items-center">
                {/* Logo Container */}
                <div className="w-40 h-40 mb-8 rounded-full overflow-hidden border-2 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    <img
                        src="/diamas.webp"
                        alt="DIAMAS Logo"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Text */}
                <h1 className="text-4xl font-light tracking-[0.3em] text-white text-center font-serif">
                    DIAMAS
                </h1>

                {/* Loading Indicator Line */}
                <div className="w-24 h-0.5 bg-gradient-to-r  animate-pulse from-transparent via-white/50 to-transparent mt-6" />
            </div>
        </div>
    );
}
