import cn from 'classnames';
import React from 'react';

export function ScrollContainer({
  children,
  className,
  ...rest
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>) {
  return (
    <div
      className={cn(
        'snap-y snap-mandatory h-screen overflow-y-hidden',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function ScrollTarget({
  children,
  className,
  ...rest
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>) {
  return (
    <div
      className={cn(
        'h-screen w-full flex flex-col items-center justify-center snap-start px-8 py-8',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
