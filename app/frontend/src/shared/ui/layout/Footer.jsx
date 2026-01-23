import React from 'react';

const Footer = () => {
    return (
        <footer className="fixed bottom-0 left-0 w-full z-50 bg-punk-bg border-t border-white/10 grid grid-cols-1 md:grid-cols-3 font-mono text-[10px] uppercase tracking-widest text-white/40 select-none">

            {/* Left: Copyright */}
            <div className="p-2 text-center md:text-left md:pl-4 border-b md:border-b-0 border-white/5">
                © 2026 EVERTON VAZ // CODE_IS_RESISTANCE
            </div>

            {/* Center: System Metrics (Fake) */}
            <div className="p-2 flex justify-center gap-6 border-b md:border-b-0 md:border-l md:border-r border-white/5">
                <span className="hidden sm:inline">MEM: <span className="text-punk-green">42%</span></span>
                <span>UPTIME: <span className="text-punk-blue">99.9%</span></span>
                <span className="hidden sm:inline">NET: <span className="text-punk-pink">SECURE</span></span>
            </div>

            {/* Right: Status */}
            <div className="p-2 text-center md:text-right md:pr-4 flex justify-center md:justify-end gap-4">
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-punk-green animate-pulse"></span>
                    STATUS: ONLINE
                </span>
                <span className="hidden lg:inline text-white/20">LOC: SAO_PAULO</span>
            </div>
        </footer>
    );
};

export default Footer;
