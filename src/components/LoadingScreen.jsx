import React from 'react';

export function LoadingScreen({ isLoading }) {
    return (
        <div
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-1000 ease-in-out ${isLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
        >
            <div className="flex flex-col items-center">
                {/* Logo Container */}
                <div className="w-80 h-80  overflow-hidden ">
                    <img
                        src="/4A.webp"
                        alt="DIAMAS Logo"
                        className="w-full h-full object-contain"
                    />
                </div>
            </div>
        </div>
    );
}
