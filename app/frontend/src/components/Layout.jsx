import React from 'react';
import Navbar from './Navbar';
import FractalBackground from './FractalBackground';

const Layout = ({ children }) => {
    return (
        <div className="relative min-h-screen bg-dark text-white selection:bg-accent-pink selection:text-white">
            <FractalBackground />
            {/* Background patterns */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
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

            <Navbar />

            <main className="relative z-10 pt-24 min-h-screen">
                {children}
            </main>

            {/* Footer / Status Bar - Punk Style */}
            <footer className="fixed bottom-0 left-0 w-full z-50 p-4 border-t border-white/10 bg-dark/80 backdrop-blur-sm flex justify-between items-center font-mono text-[10px] uppercase tracking-widest text-white/50">
                <div>&copy; 2026 EVERTON VAZ // CODE IS RESISTENCE</div>
                <div className="flex gap-4">
                    <span className="text-accent-green">STATUS: BORN2CODE_OK</span>
                    <span className="hidden md:inline">SYSTEM: ACTIVE</span>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
