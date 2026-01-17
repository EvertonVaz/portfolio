import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
    return (
        <div className="text-2xl font-black tracking-tighter uppercase whitespace-nowrap">
            <Link to="/" className="flex items-center">
                <span className="w-2 h-6 bg-white mr-1 block"></span>
                <span className="text-white">Everton Vaz</span>
            </Link>
        </div>
    );
};

export default Logo;
