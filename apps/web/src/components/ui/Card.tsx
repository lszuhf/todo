import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  hoverable = false,
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  const baseStyles =
    'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-all duration-200';

  const hoverStyles = hoverable
    ? 'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer'
    : '';

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`border-b border-gray-200 dark:border-gray-700 pb-3 mb-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`text-gray-700 dark:text-gray-300 ${className}`} {...props}>
      {children}
    </div>
  );
}
