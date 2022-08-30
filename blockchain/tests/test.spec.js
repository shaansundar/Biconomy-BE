const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

let contractFactory, testERC20, deployedContract, txHash, txReciept;

let TIMELOCK_PERIOD = 30; //30 secs

let INITIAL_BALANCE = 100;

let DEPOSIT_AMOUNT = 20;

let deployerAndOwner, user1, user2, user3, trustedForwarder, pseudoContract;

describe("Unit Test: Time-Lock Contract:", async () => {
  before(async () => {
    [deployerAndOwner, user1, user2, user3, trustedForwarder, pseudoContract] =
      await ethers.getSigners();

    contractFactory = await ethers.getContractFactory("TestERC20");
    testERC20 = await contractFactory.deploy();
    contractFactory = await ethers.getContractFactory("TimeLock");
    deployedContract = await contractFactory.deploy(
      TIMELOCK_PERIOD,
      testERC20.address
    );
  });

  describe("Initial storage vars", async () => {
    it("Gets the correct timelock period", async () => {
      expect(await deployedContract.timelockPeriod()).to.equal(TIMELOCK_PERIOD);
    });
    it("Gets the correct supported ERC20 address", async () => {
      expect(await deployedContract.supportedTokens(testERC20.address)).to.be
        .true;
    });
  });

  describe("Change storage vars", async () => {
    it("Doesn't allow a user to change timelock period", async () => {
      await expect(
        deployedContract.connect(user1).editTimelockPeriod(TIMELOCK_PERIOD * 2)
      ).to.be.reverted;
    });
    it("Allows an owner to change timelock period", async () => {
      await deployedContract
        .connect(deployerAndOwner)
        .editTimelockPeriod(TIMELOCK_PERIOD * 2);
      expect(await deployedContract.timelockPeriod()).to.equal(
        TIMELOCK_PERIOD * 2
      );
      await deployedContract
        .connect(deployerAndOwner)
        .editTimelockPeriod(TIMELOCK_PERIOD);
      expect(await deployedContract.timelockPeriod()).to.equal(TIMELOCK_PERIOD);
    });
  });

  describe("Functionality", async () => {
    it("Allows User to deposit ERC20 tokens", async () => {
      await testERC20.mint(
        await user1.getAddress(),
        ethers.utils.parseEther(`${INITIAL_BALANCE}`)
      );
      expect(await testERC20.getBalanceOf(await user1.getAddress())).to.equal(
        ethers.utils.parseEther(`${INITIAL_BALANCE}`)
      );

      await testERC20
        .connect(user1)
        .approve(
          deployedContract.address,
          ethers.utils.parseEther(`${INITIAL_BALANCE}`)
        );

      block = await ethers.provider.getBlock(
        await ethers.provider.getBlockNumber()
      );
      txHash = await deployedContract
        .connect(user1)
        .depositERC20(
          testERC20.address,
          ethers.utils.parseEther(`${DEPOSIT_AMOUNT}`)
        );
      txReciept = await txHash.wait();
      expect(txReciept.events[txReciept.events.length - 1].args[0]).to.equal(
        testERC20.address
      );
      timeStamp = block.timestamp;
      expect(
        Number(txReciept.events[txReciept.events.length - 1].args[2])
      ).to.be.lessThan(timeStamp + TIMELOCK_PERIOD + 6); //Block time is 3-6 secs, makes sure limit doesn't lapse due to new mining

      expect(await testERC20.getBalanceOf(deployedContract.address)).to.equal(
        ethers.utils.parseEther(`${DEPOSIT_AMOUNT}`)
      );
      expect(await testERC20.getBalanceOf(await user1.getAddress())).to.equal(
        ethers.utils.parseEther(`${INITIAL_BALANCE - DEPOSIT_AMOUNT}`)
      );
    });
    it("Allows User to deposit Ether", async () => {
      block = await ethers.provider.getBlock(
        await ethers.provider.getBlockNumber()
      );
      txHash = await deployedContract
        .connect(user1)
        .depositEther({ value: ethers.utils.parseEther(`${DEPOSIT_AMOUNT}`) });
      txReciept = await txHash.wait();
      expect(txReciept.events[txReciept.events.length - 1].args[0]).to.equal(
        ethers.constants.AddressZero
      );
      timeStamp = block.timestamp;
      expect(
        Number(txReciept.events[txReciept.events.length - 1].args[2])
      ).to.be.lessThan(timeStamp + TIMELOCK_PERIOD + 6); //Block time is 3-6 secs, makes sure limit doesn't lapse due to new mining

      expect(
        await ethers.provider.getBalance(deployedContract.address)
      ).to.equal(ethers.utils.parseEther(`${DEPOSIT_AMOUNT}`));
    });
    it("Allows User to deposit Ether by sending Tx", async () => {
      expect(
        (
          await deployedContract.depositData(
            await user1.getAddress(),
            ethers.constants.AddressZero
          )
        )[0]
      ).to.equal(ethers.utils.parseEther(`${DEPOSIT_AMOUNT}`));
      await user1.sendTransaction({
        to: deployedContract.address,
        value: ethers.utils.parseEther(`${DEPOSIT_AMOUNT}`),
      });
      expect(
        (
          await deployedContract.depositData(
            await user1.getAddress(),
            ethers.constants.AddressZero
          )
        )[0]
      ).to.equal(ethers.utils.parseEther(`${DEPOSIT_AMOUNT * 2}`));
      expect(
        await ethers.provider.getBalance(deployedContract.address)
      ).to.equal(ethers.utils.parseEther(`${DEPOSIT_AMOUNT * 2}`));
    });
    it("Allows User to withdraw ERC20 tokens", async () => {
      await expect(
        deployedContract
          .connect(user1)
          .withdrawERC20Direct(
            testERC20.address,
            ethers.utils.parseEther(`${DEPOSIT_AMOUNT - 2}`)
          )
      ).to.be.reverted;
      await network.provider.send("evm_increaseTime", [3600]);
      await network.provider.send("evm_mine");
      txHash = await deployedContract
        .connect(user1)
        .withdrawERC20Direct(
          testERC20.address,
          ethers.utils.parseEther(`${DEPOSIT_AMOUNT - 2}`)
        );
      txReciept = await txHash.wait();
      expect(txReciept.events[txReciept.events.length - 1].args[0]).to.equal(
        testERC20.address
      );
      timeStamp = block.timestamp;
      expect(await testERC20.getBalanceOf(deployedContract.address)).to.equal(
        ethers.utils.parseEther(`${2}`)
      );
      expect(await testERC20.getBalanceOf(await user1.getAddress())).to.equal(
        ethers.utils.parseEther(`${INITIAL_BALANCE - 2}`)
      );

      block = await ethers.provider.getBlock(
        await ethers.provider.getBlockNumber()
      );
    });
    it("Allows User to withdraw Ether", async () => {
      txHash = await deployedContract
        .connect(user1)
        .withdrawEtherDirect(ethers.utils.parseEther(`${DEPOSIT_AMOUNT - 2}`));
      txReciept = await txHash.wait();
      expect(txReciept.events[txReciept.events.length - 1].args[0]).to.equal(
        ethers.constants.AddressZero
      );
      timeStamp = block.timestamp;
      expect(
        await ethers.provider.getBalance(deployedContract.address)
      ).to.equal(
        ethers.utils.parseEther(`${DEPOSIT_AMOUNT * 2 - (DEPOSIT_AMOUNT - 2)}`)
      );
    });
    it("Allows Forwarder to withdraw ERC20 tokens with Voucher", async () => {
      let contractBalance = await testERC20.getBalanceOf(
        deployedContract.address
      );
      let user1Balance = await testERC20.getBalanceOf(await user1.getAddress());

      let voucher = {
        user: await user1.getAddress(),
        token: testERC20.address,
        amount: ethers.utils.parseEther(`${1}`),
      };
      const hashedVoucher = await deployedContract.getVoucherHash({
        ...voucher,
        signature: 0,
      });
      const userSignature = await user1.signMessage(
        ethers.utils.arrayify(hashedVoucher)
      );
      await deployedContract
        .connect(trustedForwarder)
        .withdrawWithVoucher({ ...voucher, signature: userSignature });

      expect(await testERC20.getBalanceOf(deployedContract.address)).to.equal(
        contractBalance.sub(ethers.utils.parseEther(`${1}`))
      );
      expect(await testERC20.getBalanceOf(await user1.getAddress())).to.equal(
        user1Balance.add(ethers.utils.parseEther(`${1}`))
      );
    });
    it("Allows Forwarder to withdraw Ether with Voucher", async () => {
      let contractBalance = await ethers.provider.getBalance(
        deployedContract.address
      );

      let user1Balance = await ethers.provider.getBalance(
        await user1.getAddress()
      );

      let voucher = {
        user: await user1.getAddress(),
        token: ethers.constants.AddressZero,
        amount: ethers.utils.parseEther(`${1}`),
      };
      const hashedVoucher = await deployedContract.getVoucherHash({
        ...voucher,
        signature: 0,
      });
      const userSignature = await user1.signMessage(
        ethers.utils.arrayify(hashedVoucher)
      );
      await deployedContract
        .connect(trustedForwarder)
        .withdrawWithVoucher({ ...voucher, signature: userSignature });

      expect(await ethers.provider.getBalance(deployedContract.address)).to.equal(
        contractBalance.sub(ethers.utils.parseEther(`${1}`))
      );
      expect(await ethers.provider.getBalance(await user1.getAddress())).to.equal(
        user1Balance.add(ethers.utils.parseEther(`${1}`))
      );
    });
  });
});
