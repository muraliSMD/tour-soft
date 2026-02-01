import React from 'react';

const Input = ({ label, className = '', rightElement, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-muted mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`
            w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-text-muted/50
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all
            ${rightElement ? 'pr-11' : ''}
            ${className}
          `}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
};

export default Input;
