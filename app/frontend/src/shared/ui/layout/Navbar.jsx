import React from 'react';
import { useTranslation } from 'react-i18next';
import Logo from '../Logo';
import SocialLinks from '../social/SocialLinks';
import NavItems from '../NavItems';
import LanguageSwitcher from '../LanguageSwitcher';

const Navbar = () => {
    const { t } = useTranslation();

    const menuItems = [
        { name: t('nav.home'), path: '/#home' },
        { name: t('nav.work'), path: '/#work' },
        { name: t('nav.terminal'), path: '/terminal' },
        { name: t('nav.contact'), path: '/#contact' },
    ];

    return (
        <nav className="fixed top-0 left-0 w-full z-50 p-4 lg:px-8 flex justify-between items-center bg-punk-bg/95 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
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

            {/* Mobile View - Responsividade mantida de forma limpa */}
            <div className="md:hidden flex items-center gap-4">
                <LanguageSwitcher mobile />
                <button className="text-white font-mono text-xs uppercase tracking-widest border border-white/20 px-3 py-2 hover:bg-white hover:text-black transition-colors">
                    [ menu ]
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
