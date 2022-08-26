const fs = require("fs");
const hre = require("hardhat");

const TIMELOCK_PERIOD = 30;
const ERC20_ADDRESS = "0xe11A86849d99F524cAC3E7A0Ec1241828e332C62";
const TRUSTED_FORWARDER_ADDRESS = "0x9399BB24DBB5C4b782C70c2969F58716Ebbd6a3b";

async function main() {
  let accounts = await ethers.getSigners();
  let deployer = await accounts[0];
  let deployerAddress = await accounts[0].getAddress();

  console.log(`Deployer's address: `, deployerAddress);

  console.log("Deploying TimeLock...");
  let contractFactoryPool = await ethers.getContractFactory("TimeLock");
  let deployedContract = await contractFactoryPool.deploy(
    TIMELOCK_PERIOD,
    ERC20_ADDRESS,
    TRUSTED_FORWARDER_ADDRESS,
    {
        gasLimit: 1000000,
    }
  );
  console.log("TimeLock registry deployed to:", deployedContract.address);
  exportAddresses(deployedContract.address);
  try {
    await hre.run("verify:verify", {
      address: deployedContract.address,
      constructorArguments: [
        TIMELOCK_PERIOD,
        ERC20_ADDRESS,
        TRUSTED_FORWARDER_ADDRESS,
      ],
    });
  } catch (e) {
    console.log(e);
  }
}

function exportAddresses(Contract1) {
  //Pass in interface after deploying the contractFactory
  let addresses = {
    TimeLock: Contract1,
  };
  let addressesJSON = JSON.stringify(addresses);
  fs.writeFileSync("env/contractAddress.json", addressesJSON);
}

main();
