import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  const baseStyle = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-accent-primary active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  
  const variants = {
    primary: 'bg-accent-primary hover:bg-blue-600 text-white shadow-sm border border-blue-500/10',
    secondary: 'bg-card hover:bg-card-sec text-text-primary border border-border-color shadow-sm',
    outline: 'border border-border-color bg-transparent hover:bg-card-sec text-text-primary',
    danger: 'bg-accent-danger hover:bg-red-600 text-white shadow-sm border border-red-500/10',
    ghost: 'bg-transparent hover:bg-card-sec/50 text-text-secondary hover:text-text-primary',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
