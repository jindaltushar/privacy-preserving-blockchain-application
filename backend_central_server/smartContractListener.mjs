import { ethers } from "ethers";
import { db_init, insertQuestion,insertSurveyAnswered ,insertPost} from "./database_helper.js";
import { fetchIPFSData, getMultihashFromBytes32 } from "./ipfs_helper.mjs";
import { get_sentence_vector } from "./ml_model_helper.mjs";
import SurveyContract from "./contracts/SurveyContract.json" with { type: "json" };
import SurveyContractAddressFile from "./contracts/contract-address-SurveyContract.json" with { type: "json" };
import ProfileContract from "./contracts/Profile.json" with { type: "json" };
import ProfileContractAddressFile from "./contracts/contract-address-Profile.json" with { type: "json" };

async function main() {
  const SurveyContractAddress = SurveyContractAddressFile.Token;
  const SurveyContractABI = SurveyContract.abi;
  const ProfileContractAddress = ProfileContractAddressFile.Token;
  const ProfileContractABI = ProfileContract.abi;

  const provider = new ethers.providers.WebSocketProvider(
    "wss://testnet.sapphire.oasis.io/ws"
  );
  const surveyContract = new ethers.Contract(
    SurveyContractAddress,
    SurveyContractABI,
    provider
  );
  const profileContract = new ethers.Contract(
    ProfileContractAddress,
    ProfileContractABI,
    provider
  );
  db_init();

  surveyContract.on("QuestionsAdded", (data) => {
    console.log(data);
    for (let i = 0; i < data.length; i++) {
      const questionId = Number(data[i].questionId);
      const questionType = Number(data[i].questionType);
      if (Number(data[i].questionipfshashsize) != 0) {
        const questionMultihash = getMultihashFromBytes32(data[i].questionIpfsDigest, Number(data[i].questionipfshashfunction), Number(data[i].questionipfshashsize));
        retryFetch(questionMultihash, 30).then((questionData) => {
          const questionString = questionData.questionString;
          get_sentence_vector(questionString).then((questionVector) => {
            insertQuestion(questionId, questionType, questionString, questionVector.data, (err, questionId) => {
              if (err) {
                console.error("Error inserting question:", err);
                return;
              }
              console.log(`Question added with ID: ${questionId}`);
            });
          });
        }).catch((error) => {
          console.error("Error fetching question:", error);
        });
      }
    }
  });

  surveyContract.on("SurveyAnswered", (surveyId,blocktime) => {
      console.log(surveyId);
      console.log(blocktime)
      const blocktimenew = Number(blocktime);
      insertSurveyAnswered(surveyId, blocktimenew, (err, surveyId) => {
        if (err) {
          console.error("Error inserting survey answered :", err);
          return;
        }
        console.log(`SurveyAnswered added with ID: ${surveyId}`);
      });

  });

  profileContract.on("OrganisationPosted",(organisationId,postIPFS)=>{
    console.log(organisationId);
    console.log(postIPFS);
    const ipfshash = getMultihashFromBytes32(postIPFS.digest, Number(postIPFS.hashFunction), Number(postIPFS.size));
    retryFetch(ipfshash, 30).then((data) => {
      const newObj ={
        post:data.post,
        image:data.image,
        time:data.time,
        createdBy:data.createdBy
      }
      insertPost(newObj,(err, organisationId) => {
        if (err) {
          console.error("Error inserting organisation post:", err);
          return;
        }
        console.log(`Organisation post added with ID: ${organisationId}`);
      });

    }).catch((error) => {
      console.error("Error fetching organisation post:", error);
    });
  })
}

async function retryFetch(Multihash, retryCount) {
  let attempt = 1;
  while (attempt <= retryCount) {
    try {
      const Data = await fetchIPFSData(Multihash);
      return Data;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === retryCount) {
        throw new Error("Exceeded retry attempts");
      }
    }
    attempt++;
  }
}

main();
