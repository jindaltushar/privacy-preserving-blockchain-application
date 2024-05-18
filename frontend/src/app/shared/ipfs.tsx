const axios = require('axios');
import {
  REACT_APP_PINATA_API_KEY,
  REACT_APP_PINATA_API_SECRET,
} from '@/contracts/constants';

import bs58 from 'bs58';

import { IPFSHash } from '@/app/shared/types';

export const sendFileToIPFS = async (fileImg: File) => {
  if (fileImg) {
    try {
      const formData = new FormData();
      formData.append('file', fileImg);
      const resFile = await axios({
        method: 'post',
        url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
        data: formData,
        headers: {
          pinata_api_key: REACT_APP_PINATA_API_KEY,
          pinata_secret_api_key: REACT_APP_PINATA_API_SECRET,
          'Content-Type': 'multipart/form-data',
        },
      });

      const ImgHash = resFile.data.IpfsHash;
      // //write the file with the name of ipfs hash to folder 'ipfscontent'
      // const folderPath = path.join(__dirname, 'ipfscontent');
      // const filePath = path.join(folderPath, `${ImgHash}.svg`);

      // fs.writeFileSync(filePath, fileImg);
      return getBytes32FromMultiash(ImgHash);
      //Take a look at your Pinata Pinned section, you will see a new file added to you list.
    } catch (error) {
      console.log('Error sending File to IPFS: ');
      console.log(error);
    }
  }
};

export const sendJSONToIPFS = async (jsonData: any): Promise<IPFSHash> => {
  try {
    const jsonString = JSON.stringify(jsonData);
    const formData = new FormData();
    formData.append(
      'file',
      new Blob([jsonString], { type: 'application/json' }),
    );

    const resFile = await axios({
      method: 'post',
      url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
      data: formData,
      headers: {
        pinata_api_key: REACT_APP_PINATA_API_KEY,
        pinata_secret_api_key: REACT_APP_PINATA_API_SECRET,
        'Content-Type': 'multipart/form-data',
      },
    });

    const hash = resFile.data.IpfsHash;
    return getBytes32FromMultiash(hash);
  } catch (error) {
    console.log('Error sending JSON to IPFS: ');
    console.log(error);
    throw error;
  }
};

export const readIPFS = async (multihash: IPFSHash) => {
  try {
    var hash = getMultihashFromBytes32(multihash);
    const res = await axios.get(
      `https://gold-petite-cuckoo-977.mypinata.cloud/ipfs/${hash}?pinataGatewayToken=RqQzTClnZ4z78ZHzxtm7ALo7q2FBVYqb-Ve-CVCHMoqFthQGJkDHUMpJ9oS_lPjz`,
    );
    return res.data;
  } catch (error) {
    console.log('Error reading IPFS: ');
    console.log(error);
  }
};

export function getBytes32FromMultiash(multihash: string): IPFSHash {
  const decoded = bs58.decode(multihash);
  const string_decoded = Buffer.from(decoded.slice(2)).toString('hex');
  return {
    digest: `0x${string_decoded}`,
    hashFunction: decoded[0],
    size: decoded[1],
  };
}

export function getMultihashFromBytes32(multihash: IPFSHash): string | null {
  const { digest, hashFunction, size } = multihash;
  if (size === 0) return null;

  // cut off leading "0x"
  const hashBytes = Buffer.from(digest.slice(2), 'hex');

  // prepend hashFunction and digest size
  const multihashBytes = new Uint8Array(2 + hashBytes.length);
  multihashBytes[0] = hashFunction;
  multihashBytes[1] = size;
  multihashBytes.set(hashBytes, 2);

  return bs58.encode(multihashBytes);
}

export function parseContractResponse(response) {
  const [digest, hashFunction, size] = response;
  return {
    digest,
    hashFunction: hashFunction.toNumber(),
    size: size.toNumber(),
  };
}

export function getMultihashFromContractResponse(response) {
  return getMultihashFromBytes32(parseContractResponse(response));
}
