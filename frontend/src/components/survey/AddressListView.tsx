import React, { useState } from 'react';
import Button from '@/components/ui/button';
import { useModal } from '@/components/modal-views/context';
import { Close } from '@/components/icons/close';
import { useRecoilState } from 'recoil';
import { surveyAudienceAtom } from '@/stores/atoms';

export default function AddressListView({ ...props }) {
  const { data, closeModal } = useModal();
  const { filter_index } = data;
  const [audienceFilter, setAudienceFilter] =
    useRecoilState(surveyAudienceAtom);
  const [filterValue, setFilterValue] = useState('');

  const handleRemoveAddress = (addressToRemove) => {
    setAudienceFilter((prev) => {
      return prev.map((item, index) => {
        if (index === filter_index) {
          // Create a new object with updated address_list
          return {
            ...item,
            address_list: item.address_list.filter(
              (address) => address !== addressToRemove,
            ),
          };
        }
        return item;
      });
    });
  };
  return (
    <div className="w-full md:w-[680px]">
      <div className="relative flex flex-grow flex-col overflow-hidden rounded-lg bg-white p-4 shadow-card transition-all duration-200 hover:shadow-large dark:bg-light-dark md:p-8">
        <div className="mb-4 flex items-center justify-between text-lg font-medium capitalize text-gray-900 dark:text-white lg:text-xl">
          <span>Address List</span>
          <Button
            title="Close"
            color="white"
            shape="circle"
            variant="transparent"
            size="small"
            onClick={() => closeModal()}
          >
            <Close className="h-auto w-2.5" />
          </Button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            className="border border-gray-300 rounded px-3 py-2 w-full"
            placeholder="Filter addresses"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
        </div>

        <div>
          {audienceFilter[filter_index].address_list
            .filter((address) => address.includes(filterValue))
            .map((address, index) => (
              <div
                key={index}
                className="flex items-center justify-between mb-2"
              >
                <span>{address}</span>
                <Button
                  title="Remove"
                  color="white"
                  shape="circle"
                  variant="transparent"
                  size="small"
                  onClick={() => handleRemoveAddress(address)}
                >
                  <Close className="h-auto w-2.5" />
                </Button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
