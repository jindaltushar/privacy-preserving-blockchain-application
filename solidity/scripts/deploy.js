const hre = require("hardhat");
const path = require("path");
const axios = require("axios");
const { ethers } = require("hardhat");

async function deploy(contractName, args = []) {
  //specify 0.5 wei as value to send  to the contract
  var test;
  if (contractName == "GaslessContract") {
    test = await hre.ethers.deployContract(contractName, args, {
      value: ethers.parseEther("0.55"), // put a multiple of 5
    });
  } else if (contractName == "Vault") {
    test = await hre.ethers.deployContract(contractName, args, {
      value: ethers.parseEther("2"),
    });
  } else {
    test = await hre.ethers.deployContract(contractName, args);
  }
  await test.waitForDeployment();
  console.log(contractName + " address:", test.target);
  saveFrontendFiles(test, contractName);
  if (
    contractName == "SurveyContract" ||
    contractName == "Profile" ||
    contractName == "GaslessContract"
  ) {
    saveToBackendAPI(test, contractName);
  }
}
async function main() {
  const deployContractStore = true;
  const deployRolesAccessControl = true;
  const deployGaslessContract = true;
  const deployProfileContract = true;
  const deployVault = true;
  const deploySurveyBackendContract = true;
  const deploySurveyContract = true;
  const deployPriceOracle = true;
  var contractStore;
  var gaslesscontract;
  var profilecontract;
  var rolesAccessControl;
  var vault;
  var survey;
  var surveyBackend;
  var priceOracle;
  const [deployer, deployer2] = await ethers.getSigners();

  if (deployContractStore) {
    await deploy("ContractStore");
    contractStore = await getContract("ContractStore");
    await contractStore.setFantomCivicPassVerifyingContractAddress(
      "0xbFe85eDa732a5Fcded2772d5E5dc9F4081F829eC"
    );
  } else {
    contractStore = await getContract("ContractStore");
  }

  if (deployRolesAccessControl) {
    await deploy("RolesAccessControl");
    rolesAccessControl = await getContract("RolesAccessControl");
    await contractStore.setRoleAccessControlAddress(
      await rolesAccessControl.getAddress()
    );
  } else {
    rolesAccessControl = await getContract("RolesAccessControl");
  }

  if (deployGaslessContract) {
    await deploy("GaslessContract", [await contractStore.getAddress()]);
    gaslesscontract = await getContract("GaslessContract");
    await contractStore.setGaslessContractAddress(
      await gaslesscontract.getAddress()
    );
  } else {
    gaslesscontract = await getContract("GaslessContract");
  }

  if (deployProfileContract) {
    await deploy("Profile", [await contractStore.getAddress()]);
    profilecontract = await getContract("Profile");
    await contractStore.setProfileContractAddress(
      await profilecontract.getAddress()
    );
  } else {
    profilecontract = await getContract("Profile");
  }

  if (deployVault) {
    await deploy("Vault", [await contractStore.getAddress()]);
    vault = await getContract("Vault");
    await contractStore.setVaultContractAddress(await vault.getAddress());
  } else {
    vault = await getContract("Vault");
  }

  if (deploySurveyContract) {
    await deploy("SurveyContract", [await contractStore.getAddress()]);
    survey = await getContract("SurveyContract");
    await contractStore.setSurveyContractAddress(await survey.getAddress());
  } else {
    survey = await getContract("SurveyContract");
  }
  if (deploySurveyBackendContract) {
    await deploy("SurveyBackendContract", [await contractStore.getAddress()]);
    surveyBackend = await getContract("SurveyBackendContract");
    await contractStore.setSurveyBackendContractAddress(
      await surveyBackend.getAddress()
    );
  } else {
    surveyBackend = await getContract("SurveyBackendContract");
  }
  if (deployContractStore) {
    await contractStore.setGaslessContractAddress(
      await gaslesscontract.getAddress()
    );
    await contractStore.setProfileContractAddress(
      await profilecontract.getAddress()
    );
    await contractStore.setVaultContractAddress(await vault.getAddress());
    await contractStore.setSurveyContractAddress(await survey.getAddress());
    await contractStore.setSurveyBackendContractAddress(
      await surveyBackend.getAddress()
    );
  }
  if (deployPriceOracle) {
    await deploy("PriceOracle", [
      "0x0c2362c9A0586Dd7295549C65a4A5e3aFE10a88A",
      [10000, 20000, 30000, 40000, 50000, 60000],
      [30000, 10000, 50000],
      await contractStore.getAddress(),
    ]);
    priceOracle = await getContract("PriceOracle");
    await contractStore.setPriceOracleAddress(await priceOracle.getAddress());
  } else {
    priceOracle = await getContract("PriceOracle");
  }
}

function saveToBackendAPI(token, contractName) {
  const fs = require("fs");
  const contractsDir = path.join(
    __dirname,
    "..",
    "backend_central_server",
    "contracts"
  );
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }
  fs.writeFileSync(
    path.join(contractsDir, "contract-address-" + contractName + ".json"),
    JSON.stringify({ Token: token.target }, undefined, 2)
  );
  const TokenArtifact = artifacts.readArtifactSync(contractName);
  fs.writeFileSync(
    path.join(contractsDir, contractName + ".json"),
    JSON.stringify(TokenArtifact, null, 2)
  );
}

function saveFrontendFiles(token, contractName) {
  const fs = require("fs");
  const contractsDir = path.join(
    __dirname,
    "..",
    "frontend",
    "src",
    "contracts"
  );

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address-" + contractName + ".json"),
    JSON.stringify({ Token: token.target }, undefined, 2)
  );

  const TokenArtifact = artifacts.readArtifactSync(contractName);

  fs.writeFileSync(
    path.join(contractsDir, contractName + ".json"),
    JSON.stringify(TokenArtifact, null, 2)
  );
}

function getContractAddressFromFrontend(contractName) {
  const fs = require("fs");
  const contractsDir = path.join(
    __dirname,
    "..",
    "frontend",
    "src",
    "contracts"
  );
  // read contract address from the file names contract-address-<contractName>.json
  const contractAddress = JSON.parse(
    fs.readFileSync(
      path.join(contractsDir, "contract-address-" + contractName + ".json")
    )
  ).Token;
  return contractAddress;
}

async function getContract(contractName) {
  const contractAddress = getContractAddressFromFrontend(contractName);
  const contract = await ethers.getContractAt(contractName, contractAddress);
  return contract;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
