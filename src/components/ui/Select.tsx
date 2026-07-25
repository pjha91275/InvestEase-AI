import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col space-y-1.5 w-full">
      {label && (
        <label className="text-xs font-semibold tracking-wide text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <select
          className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-150 outline-none border bg-card-sec border-border-color text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/10 appearance-none cursor-pointer ${
            error ? 'border-accent-danger focus:border-accent-danger focus:ring-accent-danger/10' : ''
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-card text-text-primary">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-secondary">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {error && <span className="text-xs font-medium text-accent-danger mt-1">{error}</span>}
    </div>
  );
}
