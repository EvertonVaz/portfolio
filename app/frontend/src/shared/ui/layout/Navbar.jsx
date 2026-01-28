import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HashLink } from 'react-router-hash-link';
import Logo from '../Logo';
import SocialLinks from '../social/SocialLinks';
import NavItems from '../NavItems';
import LanguageSwitcher from '../LanguageSwitcher';

const Navbar = () => {
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Bloquear scroll quando menu estiver aberto
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    const menuItems = [
        { name: t('nav.home'), path: '/#home' },
        { name: t('nav.work'), path: '/#work' },
        { name: t('nav.contact'), path: '/#contact' },
    ];

    return (
        <>
            <nav className="fixed top-0 left-0 w-full z-50 px-4 py-3 lg:px-8 flex justify-between items-center bg-punk-bg/95 backdrop-blur-md border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                {/* Responsabilidade: Brand/Logo */}
                <Logo />

                <div className="flex items-center gap-8">
                    {/* Responsabilidade: Social Interaction */}
                    <SocialLinks className="hidden sm:flex border-r border-white/10 pr-8 opacity-50 hover:opacity-100 transition-opacity" />

                    {/* Responsabilidade: Navigation Actions */}
                    <div className="flex items-center gap-8">
                        <NavItems
                            items={menuItems}
                            className="hidden md:flex gap-8 group items-center font-mono text-xs uppercase tracking-widest text-white/60"
                            itemClass="hover:text-punk-green hover:underline decoration-punk-green underline-offset-4 transition-all"
                        />

                        {/* Responsabilidade: Localization */}
                        <div className="hidden md:block border-l border-white/10 pl-8">
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>

                {/* Mobile View */}
                <div className="md:hidden flex items-center gap-4">
                    <LanguageSwitcher mobile />

                    {/* Hamburger Button Animado */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="relative w-10 h-10 flex flex-col justify-center items-center border border-white/10 bg-white/5 hover:bg-white/10 transition-colors z-50"
                        aria-label="Toggle menu"
                    >
                        <span className={`block w-5 h-[2px] bg-white transition-transform duration-300 ease-in-out ${isMenuOpen ? 'rotate-45 translate-y-[6px]' : '-translate-y-[4px]'}`} />
                        <span className={`block w-5 h-[2px] bg-white transition-opacity duration-300 ease-in-out ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
                        <span className={`block w-5 h-[2px] bg-white transition-transform duration-300 ease-in-out ${isMenuOpen ? '-rotate-45 -translate-y-[6px]' : 'translate-y-[4px]'}`} />
                    </button>
                </div>
            </nav>

            {/* Mobile Drawer Overlay */}
            <div
                className={`fixed inset-0 z-40 bg-punk-bg/98 backdrop-blur-xl transition-all duration-500 ease-in-out ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                    }`}
                style={{ top: '64px' }} // Altura aproximada do navbar
            >
                <nav className="flex flex-col items-center justify-start pt-16 h-full gap-8">
                    {menuItems.map((item, index) => (
                        <HashLink
                            key={item.name}
                            smooth
                            to={item.path}
                            onClick={() => setIsMenuOpen(false)}
                            className="font-mono text-3xl uppercase tracking-widest text-white/70 hover:text-punk-green hover:scale-105 transition-all duration-300"
                            style={{
                                transitionDelay: `${index * 50}ms`,
                                opacity: isMenuOpen ? 1 : 0,
                                transform: isMenuOpen ? 'translateY(0)' : 'translateY(20px)'
                            }}
                        >
                            {item.name}
                        </HashLink>
                    ))}

                    <div
                        className="mt-8 pt-8 border-t border-white/10 w-full flex justify-center transition-all duration-500 delay-300"
                        style={{
                            opacity: isMenuOpen ? 1 : 0,
                            transform: isMenuOpen ? 'translateY(0)' : 'translateY(20px)'
                        }}
                    >
                        <SocialLinks className="flex gap-8 opacity-80" />
                    </div>
                </nav>
            </div>
        </>
    );
};

export default Navbar;
