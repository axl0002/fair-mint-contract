// const hre = require("hardhat");
const chai = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);
const { expect } = chai;
// const { expect } = require("chai");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe("Token contract", function () {

  let MyNFT;
  let hardhatToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been
    // mined.

    MyNFT = await ethers.getContractFactory("LotteryNFT");

    hardhatToken = await MyNFT.deploy(10, "50000000000000000", "100000000000000000");
  });


  describe("Deployment", function () {

    // If the callback function is async, Mocha will `await` it.
    it("deploy should set the right owner", async function () {
      // Expect receives a value, and wraps it in an Assertion object. These
      // objects have a lot of utility methods to assert values.

      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.
      const tokenOwner  = await hardhatToken.owner()
      expect(tokenOwner).to.equal(owner.address);
    });
  });

  describe("Stake", function () {  
    it("stake should fail if not enough Eth", async function () {

      const totalStake_before = await hardhatToken.totalStake();

      await expect(hardhatToken.stake({ value: ethers.utils.parseEther("0.04") })).to.be.reverted;

      const totalStake_after = await hardhatToken.totalStake();
      expect(totalStake_before).to.equal(totalStake_after);
    });

    it("stake should increment totalStake", async function () {

      var totalStake_before = await hardhatToken.totalStake();
      totalStake_before = ethers.utils.formatEther(totalStake_before.toString());
      expect(totalStake_before).to.equal('0.0');
  
      await hardhatToken.stake({ value: ethers.utils.parseEther("0.05") });

      var totalStake_after = await hardhatToken.totalStake();
      totalStake_after = ethers.utils.formatEther(totalStake_after.toString());
      expect(totalStake_after).to.equal('0.05');
    });


    it("stake after token release time should fail", async function () {

      var totalStake_before = await hardhatToken.totalStake();
      totalStake_before = ethers.utils.formatEther(totalStake_before.toString());
      expect(totalStake_before).to.equal('0.0');
      
      await sleep(20000)
      await expect(hardhatToken.stake({ value: ethers.utils.parseEther("0.05") })).to.be.reverted;;


      var totalStake_after = await hardhatToken.totalStake();
      totalStake_after = ethers.utils.formatEther(totalStake_after.toString());
      expect(totalStake_after).to.equal('0.0');
    });



  });
  describe("Release Tokens", function () {  

    it("releaseTokens was successful", async function () {

      var totalStake_before = await hardhatToken.totalStake();
      totalStake_before = ethers.utils.formatEther(totalStake_before.toString());
      expect(totalStake_before).to.equal('0.0');
  
      await hardhatToken.stake({ value: ethers.utils.parseEther("0.05") });
      await hardhatToken.stake({ value: ethers.utils.parseEther("0.05") });

      var totalStake_after = await hardhatToken.totalStake();
      totalStake_after = ethers.utils.formatEther(totalStake_after.toString());
      expect(totalStake_after).to.equal('0.1');

      await sleep(10000)

      await hardhatToken.releaseTokens();

      const tokensAreReleased = await hardhatToken.tokensAreReleased();

      expect(tokensAreReleased).to.equal(true);

    });

    it("releaseTokens fails when totalStake has not reached target", async function () {

      var totalStake_before = await hardhatToken.totalStake();
      totalStake_before = ethers.utils.formatEther(totalStake_before.toString());
      expect(totalStake_before).to.equal('0.0');
  
      await hardhatToken.stake({ value: ethers.utils.parseEther("0.05") });

      var totalStake_after = await hardhatToken.totalStake();
      totalStake_after = ethers.utils.formatEther(totalStake_after.toString());
      expect(totalStake_after).to.equal('0.05');

      // const releaseTokensTx = await hardhatToken.releaseTokens();

      await expect(hardhatToken.releaseTokens()).to.be.reverted;

    });

    it("releaseTokens locks futher staking transactions", async function () {

      var totalStake_before = await hardhatToken.totalStake();
      totalStake_before = ethers.utils.formatEther(totalStake_before.toString());
      expect(totalStake_before).to.equal('0.0');
  
      await hardhatToken.stake({ value: ethers.utils.parseEther("0.05") });
      await hardhatToken.stake({ value: ethers.utils.parseEther("0.05") });

      var totalStake_after = await hardhatToken.totalStake();
      totalStake_after = ethers.utils.formatEther(totalStake_after.toString())
      expect(totalStake_after).to.equal('0.1');


      await sleep(10000);

      await hardhatToken.releaseTokens();

      await expect(hardhatToken.stake({ value: ethers.utils.parseEther("0.05") })).to.be.reverted;

    });

    it("releaseTokens fails when called before token release time", async function () {

      var totalStake_before = await hardhatToken.totalStake();
      totalStake_before = ethers.utils.formatEther(totalStake_before.toString());
      expect(totalStake_before).to.equal('0.0');
  
      await hardhatToken.stake({ value: ethers.utils.parseEther("0.05") });
      await hardhatToken.connect(addr1).stake({ value: ethers.utils.parseEther("0.05") });

      var totalStake_after = await hardhatToken.totalStake();
      totalStake_after = ethers.utils.formatEther(totalStake_after.toString());
      expect(totalStake_after).to.equal('0.1');

      await sleep(5000);

      await expect(hardhatToken.releaseTokens()).to.be.reverted;

    });

    it("releaseTokens fails when called twice", async function () {

      var totalStake_before = await hardhatToken.totalStake();
      totalStake_before = ethers.utils.formatEther(totalStake_before.toString());
      expect(totalStake_before).to.equal('0.0');
  
      await hardhatToken.stake({ value: ethers.utils.parseEther("0.05") });
      await hardhatToken.connect(addr1).stake({ value: ethers.utils.parseEther("0.05") });

      var totalStake_after = await hardhatToken.totalStake();
      totalStake_after = ethers.utils.formatEther(totalStake_after.toString());
      expect(totalStake_after).to.equal('0.1');

      await sleep(10000);

      await hardhatToken.releaseTokens();
      await expect(hardhatToken.releaseTokens()).to.be.reverted;

    });

  });

});