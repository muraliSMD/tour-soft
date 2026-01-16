import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-primary hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] border border-transparent",
    secondary:
      "bg-surface-highlight hover:bg-zinc-800 text-white border border-zinc-700 hover:border-zinc-600",
    ghost: "text-text-muted hover:text-white hover:bg-surface-highlight/50",
    danger:
      "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
