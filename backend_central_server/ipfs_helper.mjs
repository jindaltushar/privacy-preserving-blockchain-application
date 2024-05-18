// Import the fetch function from the 'node-fetch' package
import fetch from "node-fetch";
import bs58 from "bs58";
import axios from "axios";
const sendJSONToIPFS = async (jsonData) => {
  try {
    const jsonString = JSON.stringify(jsonData);
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([jsonString], { type: "application/json" })
    );

    const resFile = await axios({
      method: "post",
      url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
      data: formData,
      headers: {
        pinata_api_key: pinata_api_key,
        pinata_secret_api_key: pinata_secret_api_key,
        "Content-Type": "multipart/form-data",
      },
    });

    const hash = resFile.data.IpfsHash;
    return getBytes32FromMultiash(hash);
  } catch (error) {
    console.log("Error sending JSON to IPFS: ");
    console.log(error);
    throw error;
  }
};

// Define a function to fetch JSON data from IPFS
async function fetchIPFSData(ipfsHash) {
  token = "define here..........";
  try {
    // Make a GET request to the IPFS gateway with the given hash
    const response = await fetch(
      `https://gold-petite-cuckoo-977.mypinata.cloud/ipfs/${ipfsHash}?pinataGatewayToken=${token}`
    );

    // Check if the request was successful (status code 200)
    if (!response.ok) {
      throw new Error(
        `Failed to fetch IPFS data (${response.status} ${response.statusText})`
      );
    }

    // Parse the JSON data from the response
    const jsonData = await response.json();

    return jsonData;
  } catch (error) {
    console.error("Error fetching IPFS data:", error);
    return null;
  }
}

/**
 * @typedef {Object} Multihash
 * @property {string} digest The digest output of hash function in hex with prepended '0x'
 * @property {number} hashFunction The hash function code for the function used
 * @property {number} size The length of digest
 */

/**
 * Partition multihash string into object representing multihash
 *
 * @param {string} multihash A base58 encoded multihash string
 * @returns {Multihash}
 */
function getBytes32FromMultiash(multihash) {
  const decoded = bs58.decode(multihash);
  const string_decoded = Buffer.from(decoded.slice(2)).toString("hex");
  return {
    digest: `0x${string_decoded}`,
    hashFunction: decoded[0],
    size: decoded[1],
  };
}
// function getBytes32FromMultiash(multihash) {
//   const decoded = bs58.decode(multihash);

//   return {
//     digest: `0x${decoded.slice(2).toString("hex")}`,
//     hashFunction: decoded[0],
//     size: decoded[1],
//   };
// }

/**
 * Encode a multihash structure into base58 encoded multihash string
 *
 * @param {Multihash} multihash
 * @returns {(string|null)} base58 encoded multihash string
 */
function getMultihashFromBytes32(digest, hashFunction, size) {
  if (size === 0) return null;

  // cut off leading "0x"
  const hashBytes = Buffer.from(digest.slice(2), "hex");

  // prepend hashFunction and digest size
  const multihashBytes = new Uint8Array(2 + hashBytes.length);
  multihashBytes[0] = hashFunction;
  multihashBytes[1] = size;
  multihashBytes.set(hashBytes, 2);

  return bs58.encode(multihashBytes);
}

/**
 * Parse Solidity response in array to a Multihash object
 *
 * @param {array} response Response array from Solidity
 * @returns {Multihash} multihash object
 */
function parseContractResponse(response) {
  const [digest, hashFunction, size] = response;
  return {
    digest,
    hashFunction: hashFunction.toNumber(),
    size: size.toNumber(),
  };
}

/**
 * Parse Solidity response in array to a base58 encoded multihash string
 *
 * @param {array} response Response array from Solidity
 * @returns {string} base58 encoded multihash string
 */
function getMultihashFromContractResponse(response) {
  return getMultihashFromBytes32(parseContractResponse(response));
}

export {
  fetchIPFSData,
  getBytes32FromMultiash,
  getMultihashFromBytes32,
  parseContractResponse,
  getMultihashFromContractResponse,
  sendJSONToIPFS,
};
