import { forwardRef } from 'react';
import cn from 'classnames';
import { on } from 'events';

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  label?: string;
  error?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  useUppercaseLabel?: boolean;
  suffix?: React.ReactNode;
  suffixClassName?: string;
  onkeydown?: React.KeyboardEventHandler<HTMLInputElement>;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      type = 'text',
      className,
      inputClassName,
      labelClassName,
      suffix,
      suffixClassName,
      useUppercaseLabel = true,
      onkeydown,
      ...props
    },
    ref,
  ) => (
    <div className={cn('text-xs sm:text-sm', className)}>
      <div className={labelClassName}>
        {label && (
          <span
            className={cn(
              'block font-medium tracking-widest dark:text-gray-100',
              useUppercaseLabel ? 'mb-2 uppercase sm:mb-3' : 'mb-2',
            )}
          >
            {label}

            {props.required && (
              <sup className="inline-block text-[13px] text-red-500 ltr:ml-1 rtl:mr-1">
                *
              </sup>
            )}
          </span>
        )}
        <input
          type={type}
          onKeyDown={onkeydown}
          ref={ref}
          {...props}
          className={cn(
            'mt-1 block h-10 w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm placeholder-gray-400  transition-shadow duration-200 invalid:border-red-500 invalid:text-red-600 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:invalid:border-red-500 focus:invalid:ring-red-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-light-dark dark:text-gray-100 dark:focus:border-gray-600 dark:focus:ring-gray-600 sm:h-12 sm:rounded-lg',
            inputClassName,
          )}
        />
        {suffix && (
          <span
            className={cn('whitespace-nowrap leading-normal', suffixClassName)}
          >
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <span role="alert" className="mt-2 block !text-gray-500 sm:mt-2.5">
          {error}
        </span>
      )}
    </div>
  ),
);

Input.displayName = 'Input';
export default Input;
