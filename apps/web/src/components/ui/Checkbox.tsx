import { InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', ...props }, ref) => {
    const baseStyles =
      'w-4 h-4 text-primary-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-900';

    if (label) {
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input ref={ref} type="checkbox" className={`${baseStyles} ${className}`} {...props} />
          <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
        </label>
      );
    }

    return <input ref={ref} type="checkbox" className={`${baseStyles} ${className}`} {...props} />;
  }
);

Checkbox.displayName = 'Checkbox';
