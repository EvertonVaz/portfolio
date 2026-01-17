import React from 'react';
import { useTranslation } from 'react-i18next';
import Logo from './shared/Logo';
import SocialLinks from './shared/SocialLinks';
import NavItems from './shared/NavItems';
import LanguageSwitcher from './shared/LanguageSwitcher';

const Navbar = () => {
    const { t } = useTranslation();

    const menuItems = [
        { name: t('nav.home'), path: '/#home' },
        { name: t('nav.work'), path: '/#work' },
        { name: t('nav.terminal'), path: '/terminal' },
        { name: t('nav.contact'), path: '/#contact' },
    ];

    return (
        <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center bg-zinc-900/90 backdrop-blur-sm border-b border-white/10">
            {/* Responsabilidade: Brand/Logo */}
            <Logo />

            <div className="flex items-center gap-8">
                {/* Responsabilidade: Social Interaction */}
                <SocialLinks className="hidden sm:flex border-r border-white/10 pr-8" />

                {/* Responsabilidade: Navigation Actions */}
                <div className="flex items-center gap-8">
                    <NavItems
                        items={menuItems}
                        className="hidden md:flex gap-8 group items-center"
                    />

                    {/* Responsabilidade: Localization */}
                    <div className="hidden md:block">
                        <LanguageSwitcher />
                    </div>
                </div>
            </div>

            {/* Mobile View - Responsividade mantida de forma limpa */}
            <div className="md:hidden flex items-center gap-3">
                <LanguageSwitcher mobile />
                <button className="text-white font-mono text-xs uppercase tracking-widest">
                    [ menu ]
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
