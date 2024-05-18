'use client';

import { Scrollbar, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

type CoinCardProps = {
  id: string;
  name: string;
  symbol: string;
  logo: any;
  balance: string;
  color?: string;
};

export function CoinCard({
  name,
  symbol,
  logo,
  balance,
  color = '#FDEDD4',
}: CoinCardProps) {
  return (
    <div
      className="relative rounded-lg p-6 xl:p-8"
      style={{ backgroundColor: color }}
    >
      <h4 className="mb-8 text-sm font-medium uppercase tracking-wider text-gray-900">
        {name}
      </h4>
      <div className="relative h-20 lg:h-24 xl:h-28 3xl:h-36">{logo}</div>
      <div className="mb-2 mt-8 text-sm font-medium tracking-wider text-gray-900 lg:text-lg 2xl:text-xl 3xl:text-2xl">
        {balance}
        <span className="uppercase"> {symbol}</span>
      </div>
    </div>
  );
}

interface CoinSliderProps {
  coins: CoinCardProps[];
}

export default function CoinSlider({ coins }: CoinSliderProps) {
  const sliderBreakPoints = {
    640: {
      slidesPerView: 1,
      spaceBetween: 20,
    },
    1024: {
      slidesPerView: 2,
      spaceBetween: 24,
    },
    1280: {
      slidesPerView: 2,
      spaceBetween: 24,
    },
    1536: {
      slidesPerView: 2,
      spaceBetween: 24,
    },
    1700: {
      slidesPerView: 3,
      spaceBetween: 24,
    },
    2200: {
      slidesPerView: 4,
      spaceBetween: 24,
    },
  };

  return (
    <div>
      <Swiper
        modules={[Scrollbar, A11y]}
        spaceBetween={24}
        slidesPerView={1}
        scrollbar={{ draggable: true }}
        breakpoints={sliderBreakPoints}
        observer={true}
        dir="ltr"
        className="dark:[&_.swiper-scrollbar_>_.swiper-scrollbar-drag]:bg-body/50"
      >
        {coins.map((coin) => (
          <SwiperSlide key={coin.id}>
            <CoinCard
              id={coin.id}
              name={coin.name}
              symbol={coin.symbol}
              logo={coin.logo}
              balance={coin.balance}
              color={coin.color}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
