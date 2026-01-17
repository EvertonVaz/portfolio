import React from 'react';
import { SiGithub, SiLinkedin } from 'react-icons/si';

const SocialLinks = ({ className = "" }) => {
    const socialData = [
        {
            name: 'GitHub',
            url: 'https://github.com/evertonvaz',
            icon: <SiGithub size={20} />,
            hoverClass: 'hover:text-accent-green'
        },
        {
            name: 'LinkedIn',
            url: 'https://linkedin.com/in/etovaz',
            icon: <SiLinkedin size={20} />,
            hoverClass: 'hover:text-accent-blue'
        }
    ];

    return (
        <div className={`flex items-center gap-4 ${className}`}>
            {socialData.map((social) => (
                <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-white transition-colors duration-200 ${social.hoverClass}`}
                    title={social.name}
                >
                    {social.icon}
                </a>
            ))}
        </div>
    );
};

export default SocialLinks;
