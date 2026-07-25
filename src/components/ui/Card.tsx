import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export function Card({ children, className = '', glass = false, ...props }: CardProps) {
  // Use clean color background cards and subtle borders, as per the Stripe/Linear spec.
  const cardStyle = 'bg-card border border-border-color rounded-[20px] p-8 shadow-sm';
  return (
    <div className={`${cardStyle} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex flex-col space-y-1 mb-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-[18px] font-semibold tracking-tight text-text-primary ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm text-text-secondary ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex items-center mt-6 pt-6 border-t border-border-color ${className}`} {...props}>
      {children}
    </div>
  );
}
