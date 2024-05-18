import { Node } from '@/app/shared/types';

export function fixOptionstoStrAns(nodes: Node[]): Node[] {
  return nodes.map((node) => {
    if (node.type === 'checkbox' || node.type === 'radio') {
      // get option string fro optionlist for index and assigned ans number
      // assign string to ans number based on index
      const optionStringList = [];
      for (let i = 0; i < node.data.optionStrings.length; i++) {
        if (node.data.ans.includes(i)) {
          optionStringList.push(node.data.optionStrings[i].optionString);
        }
      }
      const othrOptions = [];
      if (node.data.other) {
        for (let i = 0; i < node.data.optionOptions.length; i++) {
          if (
            node.data.optionOptions[i] != null &&
            node.data.optionOptions[i] != ''
          )
            othrOptions.push(node.data.optionOptions[i]);
        }
      }
      return {
        ...node,
        data: {
          ...node.data,
          strAns: [...optionStringList, ...othrOptions],
        },
      };
    }
    return node;
  });
}
