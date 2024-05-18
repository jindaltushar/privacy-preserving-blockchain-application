import cn from 'classnames';

// import icons
import { Star } from '@/components/icons/star';
import { StarFill } from '@/components/icons/star-fill';
import { TrendArrowDownIcon } from '@/components/icons/trend-arrow-down-icon';
import { TrendArrowUpIcon } from '@/components/icons/trend-arrow-up-icon';
import { useState } from 'react';
import { IPFSHash, QuestionOption } from '@/app/shared/types';
import Button from '@/components/ui/button';
import { generateRandomString } from '@/app/shared/utils';
interface CoinCardDetailsProps {
  details: {
    id: number;
    title: string;
    price: string;
    stared: boolean;
    hourPrice: {
      id: string;
      title: string;
      price: string;
    }[];
    priceUp: boolean;
    upPrice: string;
    downPrice: string;
  };
}

interface audienceFilterType {
  active: boolean;
  address_list: string[];
  filter_type: number;
  nft_token_nftContractAddress: string;
  nft_token_selectedchain: number;
  prev_response_value_matchType: number;
  prev_response_value_options_optionString: string[];
  prev_response_value_questionId: number;
  questionIPFSHash: string;
  survey_answered_id: number;
  token_reserve_contractAddress: string;
  token_reserve_minAmount: number;
  token_reserve_selectedChain: number;
  token_reserve_selectedToken: number;
}
export default function CoinCard({
  details,
  index,
  setShowModal,
}: {
  details: audienceFilterType;
  index: number;
  setShowModal: any;
}) {
  const [bookmark, setBookmark] = useState(false);
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-gray-100 dark:border-gray-700 dark:bg-light-dark dark:shadow-card">
      <div className="p-3 pb-4">
        <div className="mb-4 flex items-start justify-between">
          <div className="text-sm font-medium uppercase">
            <h2 className="mb-1 text-[#111827] dark:text-white">
              {details.filter_type === 0 && 'Address List'}
              {details.filter_type === 1 && 'Previous Response'}
              {details.filter_type === 2 && 'Coin Reserve'}
              {details.filter_type === 3 && 'NFT Token'}
              {details.filter_type === 4 && 'Prev. Survey'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Filter #{index + 1}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          {details.filter_type === 0 && (
            <div className="text-xs font-normal uppercase">
              <p className="text-gray-500 dark:text-gray-400">
                Total Addresses : {details.address_list.length}
              </p>
            </div>
          )}
          {details.filter_type === 1 && (
            <div className="text-xs font-normal uppercase">
              <p className="text-gray-500 dark:text-gray-400">
                {details.questionIPFSHash}
              </p>
              {details.prev_response_value_options_optionString.map(
                (item, index) => (
                  <p
                    key={generateRandomString(12)}
                    className="text-[#111827] dark:text-white"
                  >
                    {item}
                  </p>
                ),
              )}
            </div>
          )}
          {details.filter_type === 2 && (
            <div className="text-xs font-normal uppercase">
              {details.token_reserve_selectedToken != 0 ? (
                <>
                  <p className="text-gray-500 dark:text-gray-400">
                    Token Name:
                    {details.token_reserve_selectedToken == 1
                      ? 'ROSE'
                      : 'ETHERS'}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    Min Balance : {details.token_reserve_minAmount}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-500 dark:text-gray-400">
                    Chain :{' '}
                    {details.token_reserve_selectedChain == 1
                      ? 'OASIS SAPPHIRE'
                      : 'ETHEREUM'}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    Contract Address : {details.token_reserve_contractAddress}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    Min Balance : {details.token_reserve_minAmount}
                  </p>
                </>
              )}
            </div>
          )}

          {details.filter_type === 3 && (
            <div className="text-xs font-normal uppercase">
              <p className="text-gray-500 dark:text-gray-400">
                Chain :{' '}
                {details.nft_token_selectedchain == 1
                  ? 'OASIS SAPPHIRE'
                  : 'ETHEREUM'}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Contract Address: {details.nft_token_nftContractAddress}
              </p>
            </div>
          )}

          {details.filter_type === 4 && (
            <div className="text-xs font-normal uppercase">
              <p className="text-gray-500 dark:text-gray-400">
                Survey Id: {details.survey_answered_id}
              </p>
            </div>
          )}
        </div>
      </div>
      {details.filter_type === 0 && (
        <div className=" text-center align-center justify-center pb-4 pl-4 pr-4">
          <Button shape="rounded" onClick={() => setShowModal(true)}>
            View Address List
          </Button>
        </div>
      )}
    </div>
  );
}
