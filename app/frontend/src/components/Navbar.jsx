import React from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';

const Navbar = () => {
    const menuItems = [
        { name: 'Home', path: '/#home' },
        { name: 'Terminal', path: '/#terminal' },
        // { name: 'Work', path: '/#work' },
        // { name: 'Hacklog', path: '/#hacklog' },
        { name: 'Contact', path: '/#contact' },
    ];

    return (
        <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center bg-zinc-900/90 backdrop-blur-sm border-b border-white/10">
            <div className="text-2xl font-black tracking-tighter uppercase whitespace-nowrap">
                <Link to="/" className="flex items-center">
                    <span className="w-2 h-6 bg-white mr-1 block"></span>
                    <span className="text-white">Everton Vaz</span>
                </Link>
            </div>

            <ul className="hidden md:flex gap-8 group">
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
            </ul>

            {/* Mobile Menu Button - Minimalist placeholder */}
            <button className="md:hidden text-white font-mono text-xs uppercase tracking-widest">
                [ menu ]
            </button>
        </nav>
    );
};

export default Navbar;
