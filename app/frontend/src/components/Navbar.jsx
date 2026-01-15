import React from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { SiGithub, SiLinkedin } from 'react-icons/si';
import { MdTranslate } from 'react-icons/md';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language.startsWith('pt') ? 'en' : 'pt';
        i18n.changeLanguage(newLang);
    };

    const menuItems = [
        { name: t('nav.home'), path: '/#home' },
        { name: t('nav.terminal'), path: '/#terminal' },
        // { name: t('nav.work'), path: '/#work' },
        // { name: t('nav.hacklog'), path: '/#hacklog' },
        { name: t('nav.contact'), path: '/#contact' },
    ];

    return (
        <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center bg-zinc-900/90 backdrop-blur-sm border-b border-white/10">
            <div className="text-2xl font-black tracking-tighter uppercase whitespace-nowrap">
                <Link to="/" className="flex items-center">
                    <span className="w-2 h-6 bg-white mr-1 block"></span>
                    <span className="text-white">Everton Vaz</span>
                </Link>
            </div>

            <div className="flex items-center gap-8">
                <div className="flex items-center gap-4 border-r border-white/10 pr-8">
                    <a
                        href="https://github.com/evertonvaz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-accent-green transition-colors duration-200"
                    >
                        <SiGithub size={20} />
                    </a>
                    <a
                        href="https://linkedin.com/in/etovaz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-accent-blue transition-colors duration-200"
                    >
                        <SiLinkedin size={20} />
                    </a>
                </div>

                <ul className="hidden md:flex gap-8 group items-center">
                    {menuItems.map((item) => (
                        <li key={item.name}>
                            <HashLink
                                smooth
                                to={item.path}
                                className="font-mono text-sm uppercase tracking-widest text-white hover:text-accent-pink transition-colors duration-200"
                            >
                                {item.name}
                            </HashLink>
                        </li>
                    ))}
                    <li>
                        <button
                            onClick={toggleLanguage}
                            className="group flex items-center gap-1 font-mono text-[9px] sm:text-[10px] border border-white/20 px-2 py-1 hover:border-accent-pink hover:bg-accent-pink/5 transition-all duration-300 uppercase tracking-tighter relative overflow-hidden"
                            title={i18n.language.startsWith('pt') ? 'Switch to English' : 'Mudar para Português'}
                        >
                            <MdTranslate size={14} className="text-accent-pink group-hover:scale-110 transition-transform duration-300" />
                            <span className="relative z-10 opacity-70 group-hover:opacity-100">
                                {i18n.language.startsWith('pt') ? 'PT > EN' : 'EN > PT'}
                            </span>
                        </button>
                    </li>
                </ul>
            </div>

            {/* Mobile Menu Button - Minimalist placeholder */}
            <div className="md:hidden flex items-center gap-3">
                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-1 font-mono text-[9px] border border-white/20 px-1.5 py-0.5 hover:border-accent-pink transition-all"
                >
                    <MdTranslate size={12} className="text-accent-pink" />
                    {i18n.language.startsWith('pt') ? 'EN' : 'PT'}
                </button>
                <button className="text-white font-mono text-xs uppercase tracking-widest">
                    [ menu ]
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
