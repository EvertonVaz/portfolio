import React from 'react';
import astronautImg from '../../assets/astronaut.png';
import logo42Img from '../../assets/logo42.png';
import astronautFemImg from '../../assets/astronaut-fem.png';
import moonImg from '../../assets/moon.png';

const FractalBackground = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-10 select-none">
            {/* Astronauta Flutuante */}
            <div className="absolute top-[15%] right-[15%] w-[15vw] h-[15vw] animate-[float_12s_ease-in-out_infinite] rotate-12">
                <img src={astronautImg} alt="" className="w-full h-full object-contain" />
            </div>

            {/* Logo 42 Distante */}
            <div className="absolute bottom-[20%] left-[15%] w-[10vw] h-[10vw] animate-[float_15s_ease-in-out_infinite_reverse] opacity-50">
                <img src={logo42Img} alt="" className="w-full h-full object-contain" />
            </div>

            {/* Fractal-like rotating geometry */}
            <div className="absolute top-[20%] left-[10%] w-[40vw] h-[40vw] animate-[spin_60s_linear_infinite]">
                <svg viewBox="0 0 100 100" className="w-full h-full text-white">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.05" strokeDasharray="1 2" />
                    <rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="0.05" transform="rotate(45 50 50)" />
                    <path d="M50 5 L95 95 L5 95 Z" fill="none" stroke="currentColor" strokeWidth="0.05" />
                    <path d="M50 95 L5 5 L95 5 Z" fill="none" stroke="currentColor" strokeWidth="0.05" />
                </svg>
            </div>

            <div className="absolute bottom-[20%] right-[10%] w-[30vw] h-[30vw] animate-[spin_45s_linear_infinite_reverse]">
                <svg viewBox="0 0 100 100" className="w-full h-full text-white">
                    <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="0.05" strokeDasharray="2 2" />
                    <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.05" />
                    <path d="M0 50 L100 50 M50 0 L50 100" fill="none" stroke="currentColor" strokeWidth="0.02" />
                </svg>
            </div>

            {/* Moon */}
            <div className="absolute top-[8%] left-[8%] w-[8vw] h-[8vw] animate-[floatMoon_25s_ease-in-out_infinite] opacity-60">
                <img src={moonImg} alt="" className="w-full h-full object-contain" />
            </div>

            {/* Astronauta Feminina */}
            <div className="absolute bottom-[25%] right-[22%] w-[13vw] h-[13vw] animate-[floatAlt_16s_ease-in-out_infinite]">
                <img src={astronautFemImg} alt="" className="w-full h-full object-contain" />
            </div>

            {/* Binary rain-like column snippet */}
            <div className="absolute top-0 right-[20%] h-full w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
            <div className="absolute top-0 left-[30%] h-full w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(12deg); }
                    50% { transform: translateY(-20px) rotate(15deg); }
                }
                @keyframes floatAlt {
                    0%, 100% { transform: translateY(0) rotate(-10deg); }
                    50% { transform: translateY(-25px) rotate(-5deg); }
                }
                @keyframes floatMoon {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(2deg); }
                }
            `}</style>
        </div>
    );
};

export default FractalBackground;
