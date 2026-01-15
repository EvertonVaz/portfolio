import React from 'react';

const HeroCards = () => {
  const cards = [
    {
      label: '# DISCIPLINE:',
      content: 'PUNK. HARDCORE. INDEPENDENT.',
      colorClass: 'bg-accent-pink',
      labelColor: 'text-accent-pink'
    },
    {
      label: '# LOGIC:',
      content: 'MATH. PHYSICS. FRACTALS.',
      colorClass: 'bg-accent-green',
      labelColor: 'text-accent-green'
    }
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center justify-center mt-8">
      {cards.map((card, index) => (
        <div key={index} className="punk-card max-w-sm text-left group">
          <div className={`absolute top-0 left-0 w-full h-1 ${card.colorClass} group-hover:h-full transition-all duration-500 opacity-10`}></div>
          <p className="font-mono text-lg relative z-10 leading-tight">
            <span className={`${card.labelColor} font-bold text-sm block mb-1`}>{card.label}</span>
            {card.content}
          </p>
        </div>
      ))}
    </div>
  );
};

export default HeroCards;
