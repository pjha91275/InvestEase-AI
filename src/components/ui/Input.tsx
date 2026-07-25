import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col space-y-1.5 w-full">
      {label && (
        <label className="text-xs font-semibold tracking-wide text-text-secondary">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-150 outline-none border bg-card-sec border-border-color text-text-primary placeholder:text-text-secondary/40 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/10 ${
          error ? 'border-accent-danger focus:border-accent-danger focus:ring-accent-danger/10' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs font-medium text-accent-danger mt-1">{error}</span>}
    </div>
  );
}
