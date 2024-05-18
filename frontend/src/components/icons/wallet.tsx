// icon:wallet | System UIcons https://systemuicons.com/ | Corey Ginnivan
import * as React from 'react';

function WalletIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 17 18" fill="none" height="18" width="17" {...props}>
      <g fill="none" fillRule="evenodd" transform="translate(3 4)">
        <path
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M.5 2.5h12a2 2 0 012 2v6a2 2 0 01-2 2h-10a2 2 0 01-2-2zm1-2h9a1 1 0 011 1v1H.5v-1a1 1 0 011-1z"
        />
        <path
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.5 7.5 A1 1 0 0 1 11.5 8.5 A1 1 0 0 1 10.5 7.5 A1 1 0 0 1 12.5 7.5 z"
        />
      </g>
    </svg>
  );
}

export default WalletIcon;
