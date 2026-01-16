import React from 'react';

const Input = ({ label, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-muted mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`
          w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-text-muted/50
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all
          ${className}
        `}
        {...props}
      />
    </div>
  );
};

export default Input;
