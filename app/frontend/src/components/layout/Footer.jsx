import React from 'react';

const Footer = () => {
    return (
        <footer className="fixed bottom-0 left-0 w-full z-50 p-4 border-t border-white/10 bg-dark/80 backdrop-blur-sm flex justify-between items-center font-mono text-[10px] uppercase tracking-widest text-white/50">
            <div>&copy; 2026 EVERTON VAZ // CODE IS RESISTENCE</div>
            <div className="flex gap-4">
                <span className="text-accent-green">STATUS: BORN2CODE_OK</span>
                <span className="hidden md:inline">SYSTEM: ACTIVE</span>
            </div>
        </footer>
    );
};

export default Footer;
