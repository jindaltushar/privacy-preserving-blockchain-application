import { ethers } from "ethers";
import ProfileContractAddressFile from "./contracts/contract-address-Profile.json" with { type: "json" };
const ProfileContractAddress = ProfileContractAddressFile.Token;

const domains = {
    name: "Survey.SignIn",
    version: "1",
    chainId: 23295,
    verifyingContract: ProfileContractAddress ,
  };
  
const types = {
    SignIn: [
      { name: "user", type: "address" },
      { name: "time", type: "uint256" },
    ],
  };

function verifySignature(user,time,r,s,v){
    const currentTime = new Date().getTime();
    if (currentTime>time+86350000){
        return false
    }
    const values = {
        user: user,
        time: time,
      };
    let signature = ethers.utils.joinSignature({
        r: r,
        s: s,
        v: v,
    });
    const result =  ethers.utils.verifyTypedData(domains, types, values, signature)
    return result.toLowerCase() == user.toLowerCase()
}

export {
  verifySignature
};
