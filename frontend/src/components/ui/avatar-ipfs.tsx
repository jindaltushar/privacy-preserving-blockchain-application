import cn from 'classnames';
import Image from '@/components/ui/image';
import { StaticImageData } from 'next/image';
import { IpfsImage } from 'react-ipfs-image';
import { IPFSHash } from '@/app/shared/types';
import { getMultihashFromBytes32 } from '@/app/shared/ipfs';
interface AvatarProps {
  hash: IPFSHash;
  alt: string;
  className?: string;
  size?: SizeNames;
  shape?: ShapeNames;
  width?: number;
  height?: number;
}

type ShapeNames = 'rounded' | 'circle';
type SizeNames = 'xl' | 'lg' | 'md' | 'sm' | 'xs';

const sizes: Record<SizeNames, string[]> = {
  xl: [
    'border-white border-[5px] h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 3xl:h-40 3xl:w-40 3xl:border-8 shadow-large',
  ],
  lg: ['border-whitebor der-4 h-20 w-20 lg:h-24 lg:w-24'],
  md: ['border-white h-10 w-10 drop-shadow-main border-3'],
  sm: ['border-white h-8 w-8 border-2 shadow-card'],
  xs: ['h-6 w-6'],
};

const shapes: Record<ShapeNames, string[]> = {
  rounded: ['h-16 w-16 rounded-lg bg-white/20 p-2 backdrop-blur-[40px]'],
  circle: ['rounded-full'],
};

function Avatar({
  hash,
  alt,
  className,
  size = 'md',
  shape = 'circle',
  width,
  height,
}: AvatarProps) {
  const sizeClassNames = sizes[size];
  return (
    <figure
      className={cn(
        'relative shrink-0 overflow-hidden',
        className,
        shapes[shape],
        shape === 'circle' && sizeClassNames,
      )}
    >
      {shape === 'circle' ? (
        size === 'xs' || 'sm' ? (
          <IpfsImage
            hash={getMultihashFromBytes32(hash)}
            alt={alt}
            width={width}
            height={height}
            className="rounded-full"
          />
        ) : (
          <IpfsImage
            hash={getMultihashFromBytes32(hash)}
            alt={alt}
            width={width}
            height={height}
            placeholder="blur"
            className="rounded-full"
          />
        )
      ) : (
        <IpfsImage
          hash={getMultihashFromBytes32(hash)}
          alt={alt}
          className="rounded-[6px]"
          width={width}
        />
      )}
    </figure>
  );
}

export default Avatar;
