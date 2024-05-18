import cn from 'classnames';
import { BigNumberish } from 'ethers';
interface TransactionInfoTypes {
  label: string;
  value?: string | number;
  className?: string;
}

export default function TransactionInfo({
  label,
  value,
  className,
}: TransactionInfoTypes) {
  return (
    <div
      className={cn(
        'flex justify-between dark:text-gray-300 items-center w-full',
        className,
      )}
      style={{ alignItems: 'center' }}
    >
      <span id="toleft" className="font-medium">
        {label}
      </span>
      <span id="toright" className="ml-auto">
        {value ? value : '_ _'}
      </span>
    </div>
  );
}
