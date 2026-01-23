import React from 'react';

const BackgroundPatterns = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 opacity-20 select-none">
            {/* Subtle Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px]"></div>

            {/* Fractal-like math shapes (SVG) */}
            <svg className="absolute top-[-10%] right-[-10%] w-1/2 h-1/2 text-white opacity-10 animate-pulse" viewBox="0 0 100 100">
                <path fill="none" stroke="currentColor" strokeWidth="0.1" d="M50 5 L95 95 L5 95 Z" />
                <path fill="none" stroke="currentColor" strokeWidth="0.1" d="M50 15 L85 85 L15 85 Z" />
                <path fill="none" stroke="currentColor" strokeWidth="0.1" d="M50 25 L75 75 L25 75 Z" />
            </svg>

            <div className="absolute bottom-[10%] left-[5%] w-64 h-64 border border-white opacity-5 rotate-45"></div>
        </div>
    );
};

export default BackgroundPatterns;
