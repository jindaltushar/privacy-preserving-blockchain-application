// Import required modules
import express from "express";
import { get_sentence_vector } from "./ml_model_helper.mjs";
// import { ethers as hardhatethers } from "hardhat";
import {
  getAllQuestions,
  getOrganisationsAllPost,
  getSurveyAnswered,
  getLatest10Posts,
  getTop10RecentPostsByFollowing,
  increaseLikes,
  decreaseLikes,
  addFollowing,
  removeFollowing,
  getUsersFollowings,
  getOrganisationFollowers,
  saveRewardTransaction,
  getRewardTotalOfUser,
  getTotalValueTransactedOnPlatform
} from "./database_helper.js";
import { ethers } from "ethers";
import { calculateCosineSimilarity } from "./helpers.js";
import cors from "cors";
import bodyParser from "body-parser";
import moment from "moment";
import { verifySignature } from "./identityVerify.mjs";
import ProfileContract from "./contracts/Profile.json" with { type: "json" };
import ProfileContractAddressFile from "./contracts/contract-address-Profile.json" with { type: "json" };
import VerifyCivicPassOnFantomTestnet from "./contracts/VerifyCivicPassOnFantomTestnet.json" with { type: "json" };
import VerifyCivicPassOnFantomTestnetAddressFile from "./contracts/contract-address-VerifyCivicPassOnFantomTestnet.json" with { type: "json" };
import GaslessContractAddressFile from "./contracts/contract-address-GaslessContract.json" with { type: "json" };
const ProfileContractAddress = ProfileContractAddressFile.Token;
const ProfileContractABI = ProfileContract.abi;
const VerifyCivicPassOnFantomTestnetAddress = VerifyCivicPassOnFantomTestnetAddressFile.Token;
const VerifyCivicPassOnFantomTestnetABI = VerifyCivicPassOnFantomTestnet.abi;
const GaslessContractAddress = GaslessContractAddressFile.Token;
const fantomprovider = new ethers.providers.JsonRpcProvider(
  "https://rpc.testnet.fantom.network"
)
const sapphireprovider = new ethers.providers.JsonRpcProvider(
  "https://testnet.sapphire.oasis.io"
)
const nexus_api = "http://testnet.nexus.oasis.io/v1/sapphire/events?block=";
const wallet = new ethers.Wallet(private_key_of_you_account,sapphireprovider);
//console lof wallet address
const profileContractRead = new ethers.Contract(
  ProfileContractAddress,
  ProfileContractABI,
  sapphireprovider
);

const profileContractWrite = new ethers.Contract(
  ProfileContractAddress,
  ProfileContractABI,
  wallet
);

const verifyCivicPassOnFantomTestnetContract = new ethers.Contract(
  VerifyCivicPassOnFantomTestnetAddress,
  VerifyCivicPassOnFantomTestnetABI,
  fantomprovider);

// Create an instance of express
const app = express();
const port = 3005; // Port on which your server will run
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/api/requestCivicVerification",(req,res)=>{
  var {userId,user, time, r, s, v } = req.body;
   if (!verifySignature(user, time, r, s, v)) {
     return res.status(400).json({ message: "Invalid Authentication" });
   }
   profileContractRead.getUserVerificationStatus(userId)
  .then((result) => {
    const { status, validUntil } = result;
    if (status != 2) {
      verifyCivicPassOnFantomTestnetContract.getUserCivicPassVerificationStatus(user)
        .then((civicresult) => {
            const { verified, expiry } = civicresult;
            if (verified == true && Number(expiry)*1000 > Date.now()) {
              profileContractWrite.updateUserVerificationStatus(user,true,Number(expiry))
              return res.json({ message: "User Verification Request Sent" });
            }
            else{
              return res.json({ message: "User Not Verified" });
            }
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json({ message: "Internal Server Error" });
        });
    } else {
      return res.status(400).json({ message: "User is already verified" });
    }
  })
  .catch((error) => {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  });

})

function countResponsesInLastPeriod(responses, period) {
  const now = moment();
  let periodStart;

  if (period === "day") {
    periodStart = now.clone().subtract(1, "day").startOf("day");
  } else if (period === "week") {
    periodStart = now.clone().subtract(1, "week").startOf("day");
  } else {
    throw new Error('Invalid period. Period should be "day" or "week".');
  }

  let count = 0;

  responses.forEach((response) => {
    const responseTime = moment.unix(response.blocktime);
    if (
      responseTime.isSameOrAfter(periodStart) &&
      responseTime.isSameOrBefore(now)
    ) {
      count++;
    }
  });

  return count;
}

function calculateTimeInterval(responses) {
  const timeRange = {
    start: moment.unix(responses[0].blocktime),
    end: moment.unix(responses[responses.length - 1].blocktime),
  };

  const duration = moment.duration(timeRange.end.diff(timeRange.start));

  // Choose appropriate time interval based on the duration
  if (duration.asYears() >= 1) {
    return "year";
  } else if (duration.asMonths() >= 1) {
    return "month";
  } else if (duration.asDays() >= 1) {
    return "day";
  } else {
    return "hour"; // If duration is less than a day, use hour intervals
  }
}

function binResponsesByTime(responses, interval) {
  const bins = {};

  responses.forEach((response) => {
    const blocktime = moment.unix(response.blocktime);
    const bin = blocktime.startOf(interval).unix();

    if (!bins[bin]) {
      bins[bin] = 0;
    }
    bins[bin]++;
  });

  return bins;
}

app.post("/api/questionMatch", (req, res) => {
  var { questionString, questionType } = req.body;
  // Check if name is provided
  if (!questionString) {
    return res.status(400).json({ message: "Question is required" });
  }
  if (questionType === 999 || questionType === "999") {
    questionType = 999;
  }
  if (questionType == undefined) {
    questionType = 999;
  }
  // get vector representation of questionString
  get_sentence_vector(questionString).then((questionVector) => {
    // convert questionVector to object for comparison
    getAllQuestions(questionType, (err, questions) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      const matchedQuestions = questions.filter((question) => {
        const similarity = calculateCosineSimilarity(
          questionVector.data,
          question.question_vector
        );
        return similarity > 0.5;
      });
      // send only question_id and question_string
      matchedQuestions.map((question) => {
        delete question.question_vector;
      });
      // returns [questionid,questionType,questionString]
      return res.json(matchedQuestions);
    });
  });
});

app.post("/api/getSurveyAnswerHistory", (req, res) => {
  var { secretSurveyId } = req.body;
  // Check if name is provided
  if (!secretSurveyId) {
    return res.status(400).json({ message: "Secret Survey Id is required" });
  }
  try {
    getSurveyAnswered(secretSurveyId, (err, surveyAnswered) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      if (surveyAnswered.length > 0) {
        console.log("surveyAnswered", surveyAnswered);
        const interval = calculateTimeInterval(surveyAnswered);
        const bins = binResponsesByTime(surveyAnswered, interval);
        const responsesLastDay = countResponsesInLastPeriod(
          surveyAnswered,
          "day"
        );
        const responsesLastWeek = countResponsesInLastPeriod(
          surveyAnswered,
          "week"
        );
        // create a representation from the surveyAnswered,
        return res.json({ bins, responsesLastDay, responsesLastWeek });
      } else {
        return res.status(404).json({ message: "Survey Answered not found" });
      }
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/api/getPostsForUser", (req, res) => {
  var { user, time, r, s, v } = req.body;
  if (!verifySignature(user, time, r, s, v)) {
    console.log("Invalid Authentication");
    return res.status(400).json({ message: "Invalid Authentication" });
  }
  //return
  // getTop10RecentPostsByFollowing(user);
  // getLatest10Posts();
  getTop10RecentPostsByFollowing(user, (err, posts) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    getLatest10Posts(user, (err, latestPosts) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      return res.json({ posts, latestPosts });
    });
  });
});

app.post("/api/getPostsForOrganisation", (req, res) => {
  var { organisationId } = req.body;
  getOrganisationsAllPost(organisationId, (err, posts) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    return res.json(posts);
  });
});

app.post("/api/increaseLikes", (req, res) => {
  var { postId, user, time, r, s, v } = req.body;
  if (!verifySignature(user, time, r, s, v)) {
    return res.status(400).json({ message: "Invalid Authentication" });
  }
  increaseLikes(postId, user, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    return res.json(result);
  });
});

app.post("/api/decreaseLikes", (req, res) => {
  var { postId, user, time, r, s, v } = req.body;
  if (!verifySignature(user, time, r, s, v)) {
    return res.status(400).json({ message: "Invalid Authentication" });
  }
  decreaseLikes(postId, user, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    return res.json(result);
  });
});

app.post("/api/addFollowing", (req, res) => {
  var { user, followUser, time, r, s, v } = req.body;
  if (!verifySignature(user, time, r, s, v)) {
    return res.status(400).json({ message: "Invalid Authentication" });
  }
  addFollowing(user, followUser, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    return res.json(result);
  });
});

app.post("/api/removeFollowing", (req, res) => {
  var { user, followUser, time, r, s, v } = req.body;
  if (!verifySignature(user, time, r, s, v)) {
    return res.status(400).json({ message: "Invalid Authentication" });
  }
  removeFollowing(user, followUser, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    return res.json(result);
  });
});

app.post("/api/getUsersFollowings", (req, res) => {
  var { user, time, r, s, v } = req.body;
  if (!verifySignature(user, time, r, s, v)) {
    return res.status(400).json({ message: "Invalid Authentication" });
  }
  getUsersFollowings(user, (err, followers) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    return res.json(followers);
  });
});

app.post("/api/getOrganisationFollowers", (req, res) => {
  var { orgId } = req.body;
  getOrganisationFollowers(orgId, (err, followers) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    return res.json(followers);
  });
});

app.post("/api/isUserFollowingThisOrganisation", (req, res) => {
  var { orgId, user, time, r, s, v } = req.body;
  if (!verifySignature(user, time, r, s, v)) {
    return res.status(400).json({ message: "Invalid Authentication" });
  }
  getUsersFollowings(user, (err, followings) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    const isFollowing = followings.includes(orgId);
    return res.json({ isFollowing });
  });
});

app.post("/api/reportSuccessfulRewards",(req,res) =>{
  var {blockNumber}= req.body;
  const url = nexus_api + blockNumber;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      data.events.forEach((event) => {
        if (event.type == 'accounts.transfer'){
          // if the body object on event has both keys "from_eth" and "to_eth" then it is a reward transaction
          if (event.body.from_eth && event.body.to_eth){
            const from = event.body.from_eth;
            const to = event.body.to_eth;
            if(from == GaslessContractAddress || to == GaslessContractAddress){
              //use ethers to convert wei to gewi
            const weiValue = ethers.BigNumber.from(event.body.amount.Amount);
            const ingwei = ethers.utils.formatUnits(weiValue, "gwei");
            saveRewardTransaction(from,to,ingwei,blockNumber,(err,result) => {
              if (err) {
                console.log(err);
              }
            });
          } 
        }
      }}
    );
  }
  )
  .catch((error) => {
    console.error("Error fetching rewards:", error);
  });
  return res.json({success:true})
})

app.post("/api/getMyRewardsTotal",(req,res) =>{
  var {user} = req.body;
  getRewardTotalOfUser(user,(err, total) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    return res.json(total);
  });
}
)

app.post("/api/getTotalValueTransactedOnPlatform",(req,res) =>{
  getTotalValueTransactedOnPlatform((err, total) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    return res.json(total);
  });
}
)
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
