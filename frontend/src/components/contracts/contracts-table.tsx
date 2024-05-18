'use client';

import React from 'react';
import {
  useTable,
  useResizeColumns,
  useFlexLayout,
  useSortBy,
  usePagination,
} from 'react-table';
import { randomColor } from 'randomcolor';
import Button from '@/components/ui/button';
import Scrollbar from '@/components/ui/scrollbar';
import { ExternalLink } from '@/components/icons/external-link';
import { ChevronDown } from '@/components/icons/chevron-down';
import { LongArrowRight } from '@/components/icons/long-arrow-right';
import { LongArrowLeft } from '@/components/icons/long-arrow-left';
import {
  GaslessContractAddress,
  ProfileContractAddress,
  SurveyContractAddress,
  PriceOracleContractAddress,
  ContractStoreAddress,
  AccessControlAddress,
  SurveyBackendAddress,
} from '@/contracts/constants';
import { LinkIcon } from '@/components/icons/link-icon';
import { id } from 'date-fns/locale';
import Image from 'next/image';
function generateSymmetricalPixelArt(width, height, pixelSize, color1, color2) {
  const canvas = document.createElement('canvas');
  canvas.width = width * pixelSize;
  canvas.height = height * pixelSize;
  const ctx = canvas.getContext('2d');

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width / 2; x++) {
      const color = Math.random() < 0.5 ? color1 : color2;
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      ctx.fillRect(
        (width - x - 1) * pixelSize,
        y * pixelSize,
        pixelSize,
        pixelSize,
      ); // Mirror the pixel horizontally
    }
  }

  return canvas.toDataURL(); // Get the base64 representation of the image
}

const pixelSize = 8;
const contracts = [
  {
    id: 1,
    contractName: 'Contract Store',
    contractAddress: ContractStoreAddress,
    chain: 'Sapphire',
    img: generateSymmetricalPixelArt(
      16,
      16,
      pixelSize,
      randomColor(),
      randomColor(),
    ),
  },
  {
    id: 2,
    contractName: 'Access Control',
    contractAddress: AccessControlAddress,
    chain: 'Sapphire',
    img: generateSymmetricalPixelArt(
      16,
      16,
      pixelSize,
      randomColor(),
      randomColor(),
    ),
  },
  {
    id: 3,
    contractName: 'Gasless',
    contractAddress: GaslessContractAddress,
    chain: 'Sapphire',
    img: generateSymmetricalPixelArt(
      16,
      16,
      pixelSize,
      randomColor(),
      randomColor(),
    ),
  },
  {
    id: 4,
    contractName: 'Profile',
    contractAddress: ProfileContractAddress,
    chain: 'Sapphire',
    img: generateSymmetricalPixelArt(
      16,
      16,
      pixelSize,
      randomColor(),
      randomColor(),
    ),
  },
  {
    id: 5,
    contractName: 'Survey',
    contractAddress: SurveyContractAddress,
    chain: 'Sapphire',
    img: generateSymmetricalPixelArt(
      16,
      16,
      pixelSize,
      randomColor(),
      randomColor(),
    ),
  },
  {
    id: 6,
    contractName: 'Survey Backend',
    contractAddress: SurveyBackendAddress,
    chain: 'Sapphire',
    img: generateSymmetricalPixelArt(
      16,
      16,
      pixelSize,
      randomColor(),
      randomColor(),
    ),
  },
  {
    id: 7,
    contractName: 'Rewards Oracle',
    contractAddress: PriceOracleContractAddress,
    chain: 'Sapphire',
    img: generateSymmetricalPixelArt(
      16,
      16,
      pixelSize,
      randomColor(),
      randomColor(),
    ),
  },
];

const COLUMNS = [
  {
    Header: 'ID',
    accessor: 'id',
    minWidth: 60,
    maxWidth: 80,
  },
  {
    Header: () => <div className="ltr:ml-auto rtl:mr-auto">Contract Name</div>,
    accessor: 'contractName',
    // @ts-ignore
    Cell: ({ cell: { value } }) => (
      <div className="text-center uppercase">{value}</div>
    ),
    minWidth: 200,
    maxWidth: 220,
  },
  {
    Header: () => <div className="ltr:ml-auto rtl:mr-auto">BlockChain</div>,
    accessor: 'chain',
    // @ts-ignore
    Cell: ({ cell: { value } }) => (
      <div className="ltr:text-right rtl:text-left">{value}</div>
    ),
    minWidth: 100,
    maxWidth: 180,
  },
  {
    Header: () => <div className="ltr:ml-auto rtl:mr-auto">Address</div>,
    accessor: 'contractAddress',
    // @ts-ignore
    Cell: ({ cell: { value, row } }) => (
      <div className="flex items-center justify-end">
        {/* <LinkIcon className="h-[18px] w-[18px] ltr:mr-2 rtl:ml-2" /> */}
        <Image
          src={row.original.img}
          alt="Contract Image"
          className="ltr:mr-2 rtl:ml-2"
          width="15"
          height="15"
        />{' '}
        <a
          href={`https://explorer.oasis.io/testnet/sapphire/address/${value}`}
          target="_blank"
          rel="noreferrer"
        >
          {value}
        </a>{' '}
        <ExternalLink className="h-[15px] w-[15px] ltr:ml-2 rtl:mr-2" />
      </div>
    ),
    minWidth: 500,
    maxWidth: 580,
  },
];

export default function ContractsTable() {
  const data = React.useMemo(() => contracts, []);
  const columns = React.useMemo(() => COLUMNS, []);

  const {
    getTableProps,
    getTableBodyProps,
    canPreviousPage,
    canNextPage,
    pageOptions,
    state,
    headerGroups,
    page,
    nextPage,
    previousPage,
    prepareRow,
  } = useTable(
    {
      // @ts-ignore
      columns,
      data,
      initialState: { pageSize: 5 },
    },
    useSortBy,
    useResizeColumns,
    useFlexLayout,
    usePagination,
  );

  const { pageIndex } = state;

  return (
    <div className="">
      <div className="rounded-tl-lg rounded-tr-lg bg-white px-4 pt-6 dark:bg-light-dark md:px-8 md:pt-8">
        <div className="flex flex-col items-center justify-between border-b border-dashed border-gray-200 pb-5 dark:border-gray-700 md:flex-row">
          <h2 className="mb-3 shrink-0 text-lg font-medium text-black dark:text-white sm:text-xl md:mb-0 md:text-2xl">
            Addresses You are Interacting with
          </h2>
        </div>
      </div>
      <div className="-mx-0.5 dark:[&_.os-scrollbar_.os-scrollbar-track_.os-scrollbar-handle:before]:!bg-white/50">
        <Scrollbar style={{ width: '100%' }} autoHide="never">
          <div className="px-0.5">
            <table
              {...getTableProps()}
              className="transaction-table w-full border-separate border-0"
            >
              <thead className="text-sm text-gray-500 dark:text-gray-300">
                {headerGroups.map((headerGroup, idx) => (
                  <tr {...headerGroup.getHeaderGroupProps()} key={idx}>
                    {headerGroup.headers.map((column, idx) => (
                      <th
                        {...column.getHeaderProps(
                          column.getSortByToggleProps(),
                        )}
                        key={idx}
                        className="group  bg-white px-2 py-5 font-normal first:rounded-bl-lg last:rounded-br-lg ltr:first:pl-8 ltr:last:pr-8 rtl:first:pr-8 rtl:last:pl-8 dark:bg-light-dark md:px-4"
                      >
                        <div className="flex items-center">
                          {column.render('Header')}
                          {column.canResize && (
                            <div
                              {...column.getResizerProps()}
                              className={`resizer ${
                                column.isResizing ? 'isResizing' : ''
                              }`}
                            />
                          )}
                          <span className="ltr:ml-1 rtl:mr-1">
                            {column.isSorted ? (
                              column.isSortedDesc ? (
                                <ChevronDown />
                              ) : (
                                <ChevronDown className="rotate-180" />
                              )
                            ) : (
                              <ChevronDown className="rotate-180 opacity-0 transition group-hover:opacity-50" />
                            )}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody
                {...getTableBodyProps()}
                className="text-xs font-medium text-gray-900 dark:text-white 3xl:text-sm"
              >
                {page.map((row, idx) => {
                  prepareRow(row);
                  return (
                    <tr
                      {...row.getRowProps()}
                      key={idx}
                      className="mb-3 items-center rounded-lg bg-white shadow-card last:mb-0 dark:bg-light-dark"
                    >
                      {row.cells.map((cell, idx) => {
                        return (
                          <td
                            {...cell.getCellProps()}
                            key={idx}
                            className="px-2 py-4 tracking-[1px] ltr:first:pl-4 ltr:last:pr-4 rtl:first:pr-8 rtl:last:pl-8 md:px-4 md:py-6 md:ltr:first:pl-8 md:ltr:last:pr-8 3xl:py-5"
                          >
                            {cell.render('Cell')}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Scrollbar>
      </div>
      <div className="mt-3 flex items-center justify-center rounded-lg bg-white px-5 py-4 text-sm shadow-card dark:bg-light-dark lg:py-6">
        <div className="flex items-center gap-5">
          <Button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            title="Previous"
            shape="circle"
            variant="transparent"
            size="small"
            className="text-gray-700 disabled:text-gray-400 dark:text-white disabled:dark:text-gray-400"
          >
            <LongArrowLeft className="h-auto w-4 rtl:rotate-180" />
          </Button>
          <div>
            Page{' '}
            <strong className="font-semibold">
              {pageIndex + 1} of {pageOptions.length}
            </strong>{' '}
          </div>
          <Button
            onClick={() => nextPage()}
            disabled={!canNextPage}
            title="Next"
            shape="circle"
            variant="transparent"
            size="small"
            className="text-gray-700 disabled:text-gray-400 dark:text-white disabled:dark:text-gray-400"
          >
            <LongArrowRight className="h-auto w-4 rtl:rotate-180 " />
          </Button>
        </div>
      </div>
    </div>
  );
}
