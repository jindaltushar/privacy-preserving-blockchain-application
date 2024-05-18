'use client';
import { useState, useEffect } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import { nodesAtom, selectedNodeIndexAtom } from '@/stores/atoms';
import { Node } from '@/app/shared/types';
const SliderRating = ({ text }: { text: string }) => {
  const [rating, setRating] = useState(null); // Default rating value
  const index = useRecoilValue(selectedNodeIndexAtom);
  const [nodes, setNodes] = useRecoilState(nodesAtom);
  const handleRatingChange = (event: any) => {
    const value = parseInt(event.target.value);
    setRating(value);
  };

  const calculateWidth = () => {
    // Calculate the width of the slider based on the rating value
    return `${(rating / 5) * 100}%`;
  };

  useEffect(() => {
    setNodes((prev) => {
      if (index === undefined) return prev;
      const elem = prev[index];
      return [
        ...prev.slice(0, index),
        {
          type: elem.type,
          data: { ...elem.data, privacySetting: rating },
        } as Node,
        ...prev.slice(index + 1),
      ] as Node[];
    });
  }, [rating]);

  useEffect(() => {
    setRating(nodes[index].data.privacySetting);
  }, []);

  return (
    <div>
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mx-2">
        {text}
      </div>
      <div className="flex items-center">
        <div className="flex-grow ml-2 relative pe-4">
          <div className="w-full bg-gray-200 rounded h-2.5 dark:bg-gray-700 absolute inset-0 me-8">
            <div
              className="bg-brand 0 h-2.5 rounded dark:bg-brand pe-4"
              style={{ width: calculateWidth() }}
            ></div>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="1"
            value={rating}
            onChange={handleRatingChange}
            className="w-full absolute inset-0 opacity-0 cursor-pointer z-10 pe-4"
          />
        </div>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-2 mt-2">
          {rating}
        </span>
      </div>
    </div>
  );
};

export default SliderRating;
