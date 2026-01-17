import React from 'react';
import Navbar from './Navbar';
import Footer from './layout/Footer';
import BackgroundPatterns from './layout/BackgroundPatterns';
import FractalBackground from './FractalBackground';

/**
 * Orquestrador do Layout Global.
 * SRP: Gerencia apenas a estrutura e a composição de elementos globais.
 */
const Layout = ({ children }) => {
    return (
        <div className="relative min-h-screen bg-dark text-white selection:bg-accent-pink selection:text-white">
            {/* Visual Layers */}
            <FractalBackground />
            <BackgroundPatterns />

            {/* Global Interface Elements */}
            <Navbar />

            {/* Main Content Area */}
            <main className="relative z-10 pt-24 pb-16 min-h-screen">
                {children}
            </main>

            {/* Bottom Status Layer */}
            <Footer />
        </div>
    );
};

export default Layout;
