import React from 'react';

const Navbar = () => {
    const menuItems = [
        { name: 'Home', path: '#home' },
        { name: 'Work', path: '#work' },
        { name: 'Hacklog', path: '#hacklog' },
        { name: 'Terminal', path: '#terminal' },
        { name: 'Contact', path: '#contact' },
    ];

    return (
        <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center mix-blend-difference">
            <div className="text-2xl font-black tracking-tighter uppercase whitespace-nowrap">
                <span className="bg-white text-black px-2 mr-1">42</span>
                <span className="text-white">EV</span>
            </div>

            <ul className="hidden md:flex gap-8 group">
                {menuItems.map((item) => (
                    <li key={item.name}>
                        <a
                            href={item.path}
                            className="font-mono text-sm uppercase tracking-widest text-white hover:text-accent-pink transition-colors duration-200"
                        >
                            {item.name}
                        </a>
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
