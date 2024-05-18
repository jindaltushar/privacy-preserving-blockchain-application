'use client';
import { useRecoilState } from 'recoil';
import { nodesAtom, selectedNodeIndexAtom } from '@/stores/atoms';
import Button from '@/components/ui/button/button';
import { FaTrash } from 'react-icons/fa';
import { ArrowUp } from '@/components/icons/arrow-up';

export function DeleteButton({ index }: { index: number }) {
  const [nodes, setNodes] = useRecoilState(nodesAtom);
  const [selectedNodeIndex, setSelectedNodeIndex] = useRecoilState(
    selectedNodeIndexAtom,
  );
  return (
    <Button
      onClick={() => {
        if (selectedNodeIndex === index) setSelectedNodeIndex(undefined);
        if (index < 0 || index >= nodes.length) return;
        setNodes((prev) => {
          return [...prev.slice(0, index), ...prev.slice(index + 1)];
        });
      }}
    >
      <FaTrash />
    </Button>
  );
}

export function MoveupButton({ index }: { index: number }) {
  const [nodes, setNodes] = useRecoilState(nodesAtom);
  return (
    <Button
      size="mini"
      color="gray"
      shape="circle"
      variant="transparent"
      onClick={() => {
        if (index <= 0 || index >= nodes.length) return;
        setNodes((prev) => {
          const a = nodes[index - 1];
          const b = nodes[index];
          return [...prev.slice(0, index - 1), b, a, ...prev.slice(index + 1)];
        });
      }}
    >
      <ArrowUp className="h-auto w-3" />
    </Button>
  );
}

export function MovedownButton({ index }: { index: number }) {
  const [nodes, setNodes] = useRecoilState(nodesAtom);
  return (
    <Button
      size="mini"
      color="gray"
      shape="circle"
      variant="transparent"
      onClick={() => {
        if (index < 0 || index >= nodes.length - 1) return;
        setNodes((prev) => {
          const a = nodes[index];
          const b = nodes[index + 1];
          return [...prev.slice(0, index), b, a, ...prev.slice(index + 2)];
        });
      }}
    >
      <span className="inline-block transform rotate-180">
        <ArrowUp className="h-auto w-3" />
      </span>
    </Button>
  );
}
