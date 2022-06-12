// const hre = require("hardhat");
const chai = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);
const { expect } = chai;
// const { expect } = require("chai");



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

    MyNFT = await ethers.getContractFactory("MyNFT");

    hardhatToken = await MyNFT.deploy();
  });


  describe("Deployment", function () {

    // If the callback function is async, Mocha will `await` it.
    it("Should set the right owner", async function () {
      // Expect receives a value, and wraps it in an Assertion object. These
      // objects have a lot of utility methods to assert values.

      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.
      const tokenOwner  = await hardhatToken.owner()
      expect(tokenOwner).to.equal(owner.address);
    });
  });

  describe("Transactions", function () {  
    it("Stake should fail if not enough Eth", async function () {

      const totalStake_before = await hardhatToken.totalStake();

      await expect(hardhatToken.stake({ value: ethers.utils.parseEther("0.04") })).to.be.reverted;

      const totalStake_after = await hardhatToken.totalStake();
      expect(totalStake_before).to.equal(totalStake_after);
    });

    it("Valid stake should increment totalStake", async function () {

      var totalStake_before = await hardhatToken.totalStake();
      totalStake_before = ethers.utils.formatEther(totalStake_before.toString());
      expect(totalStake_before).to.equal('0.0');
  
      const tx = await hardhatToken.stake({ value: ethers.utils.parseEther("0.05") });

      var totalStake_after = await hardhatToken.totalStake();
      totalStake_after = ethers.utils.formatEther(totalStake_after.toString());
      expect(totalStake_after).to.equal('0.05');
    });

    it("releaseTokens fails when totalStake has not reached target", async function () {

      var totalStake_before = await hardhatToken.totalStake();
      totalStake_before = ethers.utils.formatEther(totalStake_before.toString());
      expect(totalStake_before).to.equal('0.0');
  
      const stakeTx = await hardhatToken.stake({ value: ethers.utils.parseEther("0.05") });

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
  
      const stakeTx1 = await hardhatToken.stake({ value: ethers.utils.parseEther("0.05") });
      const stakeTx2 = await hardhatToken.stake({ value: ethers.utils.parseEther("0.05") });

      var totalStake_after = await hardhatToken.totalStake();
      totalStake_after = ethers.utils.formatEther(totalStake_after.toString())
      expect(totalStake_after).to.equal('0.1');

      const releaseTokensTx = await hardhatToken.releaseTokens();

      await expect(hardhatToken.stake({ value: ethers.utils.parseEther("0.05") })).to.be.reverted;

    });

    it("test releaseTokens", async function () {

      var totalStake_before = await hardhatToken.totalStake();
      totalStake_before = ethers.utils.formatEther(totalStake_before.toString());
      expect(totalStake_before).to.equal('0.0');
  
      const stakeTx1 = await hardhatToken.stake({ value: ethers.utils.parseEther("0.05") });
      const stakeTx2 = await hardhatToken.connect(addr1).stake({ value: ethers.utils.parseEther("0.05") });

      var totalStake_after = await hardhatToken.totalStake();
      totalStake_after = ethers.utils.formatEther(totalStake_after.toString())
      expect(totalStake_after).to.equal('0.1');

      const releaseTokensTx = await hardhatToken.releaseTokens();

      await expect(hardhatToken.stake({ value: ethers.utils.parseEther("0.05") })).to.be.reverted;

    });






  });

});