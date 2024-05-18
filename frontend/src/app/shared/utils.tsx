import { FormProps, Node, NodeType } from '@/app/shared/types';
import { FaLess } from 'react-icons/fa';
import { rangeValues } from '@/stores/atoms';
import { readIPFS, sendJSONToIPFS } from '@/app/shared/ipfs';

export function stringToBytes32(inputString: string) {
  let hexString = Buffer.from(inputString, 'utf-8').toString('hex');
  if (hexString.length < 64) {
    hexString = hexString + '0'.repeat(64 - hexString.length);
  } else if (hexString.length > 64) {
    throw new Error('Input string is too long to be converted to bytes32');
  }
  return '0x' + hexString;
}

export function bytes32ToString(bytes32String: string) {
  // Remove '0x' prefix if present
  bytes32String = bytes32String.replace(/^0x/, '');

  // Ensure the input string is exactly 64 characters long
  if (bytes32String.length !== 64) {
    throw new Error('Invalid bytes32 string length');
  }

  // Convert hexadecimal string to Buffer
  const buffer = Buffer.from(bytes32String, 'hex');

  // Convert Buffer to string using UTF-8 encoding
  const stringValue = buffer.toString('utf-8');

  // Remove trailing null characters
  const nullTerminatorIndex = stringValue.indexOf('\u0000');
  return nullTerminatorIndex >= 0
    ? stringValue.substring(0, nullTerminatorIndex)
    : stringValue;
}

export function isObjectEmpty(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

export const createEmptyElement = (element: NodeType) => {
  const data = {
    radio: {
      qn: '',
      ans: [],
      privacySetting: 4,
      answerTypeAllowed: [false, false, false],
    },
    checkbox: {
      qn: '',
      ans: [],
      privacySetting: 4,
      answerTypeAllowed: [false, false, false],
    },
    text: {
      qn: '',
      ans: '',
      privacySetting: 4,
      answerTypeAllowed: [false, true, false],
    },
    range: {
      qn: '',
      type: '0-5',
      privacySetting: 4,
      answerTypeAllowed: [false, false, false],
    },
  };
  return data[element];
};

export const generateRandomString = (length: number) => {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
};

export const nodeToFormState = (nodes: Node[]) => {
  const formNodes: FormProps[] = nodes.map((node) => {
    switch (node.type) {
      case 'text':
        return { ...node, type: 'text', values: { value: '' } };

      case 'radio':
        return { ...node, type: 'radio', values: { selected: '0' } };

      case 'range':
        return {
          ...node,
          type: 'range',
          values: { values: rangeValues[node.data.type], selected: '0' },
        };

      case 'checkbox':
        return { ...node, type: 'checkbox', values: { values: [] } };

      default:
        return node;
    }
  }) as FormProps[];
  return formNodes;
};
// same function for title as well
export const formattedOptionObject = async (optionString: string) => {
  // Check if the string length is within bounds
  if (optionString.length <= 32) {
    // Convert string to bytes32 hex representation
    const hexString =
      '0x' + Buffer.from(optionString, 'utf-8').toString('hex').padEnd(64, '0');
    return {
      option: hexString,
      optionIPFSHash: {
        digest:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        hashFunction: 0,
        size: 0,
      },
    };
  } else {
    const json = {
      optionString: optionString,
      isPrivate: false,
      nonce: false,
    };
    const ipfsHash = await sendJSONToIPFS(json);
    return { option: stringToBytes32(''), optionIPFSHash: ipfsHash };
  }
};
//same function for title as well
export const reverseFormattedOptionObject = async (formattedObject) => {
  const { option, optionIPFSHash } = formattedObject;

  if (option === stringToBytes32('')) {
    // Extract optionString from IPFS hash
    const optionString = (await readIPFS(optionIPFSHash)).optionString;
    return optionString;
  } else {
    // Convert option back to string
    const optionString = Buffer.from(option.substring(2), 'hex')
      .toString('utf-8')
      .replace(/\0+$/, '');
    return optionString;
  }
};

export function formatBalance(balance: number) {
  const eth = balance / 1e18; // Convert balance to ETH
  const gwei = balance / 1e9; // Convert balance to GWEI

  if (eth >= 1) {
    return eth.toFixed(4) + ' ETH';
  } else {
    return gwei.toFixed(4) + ' GWEI';
  }
}
