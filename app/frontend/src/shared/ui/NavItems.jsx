import React from 'react';
import { HashLink } from 'react-router-hash-link';

const NavItems = ({ items, className = "" }) => {
    return (
        <ul className={className}>
            {items.map((item) => (
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
    );
};

export default NavItems;
