import React from 'react';
import TransactionInfo from '@/components/ui/transaction-info';
import { masterSettingsAtom, nodesAtom } from '@/stores/atoms';
import { useRecoilState } from 'recoil';
import { Transition } from '@/components/ui/transition';
const SurveySiderbarComponent = () => {
  const [masterSettings] = useRecoilState(masterSettingsAtom);
  const [nodes] = useRecoilState(nodesAtom);
  if (nodes.length != 0) {
    return (
      <Transition
        appear={true}
        show={true}
        enter="transition-opacity duration-150"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="relative mt-20 hidden flex-col rounded-lg bg-gray-200 p-6 dark:bg-[#333E59] lg:flex">
          <h2 className="mb-7 mt-5 text-center text-[20px] font-semibold leading-8 text-light-dark dark:text-white">
            Survey Summary
          </h2>
          <div className="mb-3"></div>
          <TransactionInfo
            label={'Survey Type'}
            value={masterSettings.is_survey_private ? 'Private' : 'Public'}
          />
          <TransactionInfo label={'Total Questions'} value={nodes.length} />
        </div>
      </Transition>
    );
  }
};

export default SurveySiderbarComponent;
