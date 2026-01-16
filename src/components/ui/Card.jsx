import React from 'react';

const Card = ({ children, className = '', hoverEffect = false }) => {
  return (
    <div 
      className={`
        bg-surface/50 backdrop-blur-md border border-white/5 rounded-xl p-6
        ${hoverEffect ? 'transition-transform duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
