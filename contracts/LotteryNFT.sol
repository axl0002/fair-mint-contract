// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract LotteryNFT is Ownable, ERC721("FairNFT", "FNFT") {
    uint256 public minimumStake;
    uint256 public targetStake;
    uint public totalStake;
    uint tokenId;
    uint256 tokenReleaseTime;

    uint public totalStakers;
    bool public stakingIsLocked = false;
    bool public tokensAreReleased = false;
    mapping(uint=>address) public stakers;
    mapping(address=>tokenMetaData[]) public ownershipRecord;
    mapping(address=>uint256) public amountStakedPerAddress;
    
    struct tokenMetaData {
        uint tokenId;
        uint timeStamp;
        string tokenURI;
    }

    constructor (uint minutesToRelease, uint256 _minimumStake, uint256 _targetStake) {
        tokenReleaseTime = block.timestamp + minutesToRelease * 1 minutes; 
        // tokenReleaseTime = block.timestamp + minutesToRelease * 1 seconds; 
        minimumStake = _minimumStake;
        targetStake = _targetStake;
    }

    event mint(address  indexed toAddress, uint indexed tokenId);


    function stake() external payable {
        require(block.timestamp < tokenReleaseTime, "Token release time has been reached");
        require(msg.value >= minimumStake, "Not enough ETH to stake");
        
        if (amountStakedPerAddress[msg.sender] == 0)
            stakers[totalStakers] = msg.sender;
            totalStakers += 1;

        amountStakedPerAddress[msg.sender] += msg.value;
        totalStake += msg.value;
    }

    function releaseTokens() external onlyOwner  {
        require(block.timestamp >= tokenReleaseTime, "Token release time not reached");
        require(totalStake >= targetStake, "Not enough total_stake to release tokens");
        require(!tokensAreReleased, "Tokens have already been released");

        tokensAreReleased = true;

        uint256 cumulativeStake = 0;

        uint256 chosenStaker = (totalStake / 100) * randomProbability();

        for(uint i = 0 ; i < totalStakers; i++) {

            uint256 nextCumulativeStake = cumulativeStake + amountStakedPerAddress[stakers[i]];

            if (cumulativeStake <= chosenStaker && chosenStaker < nextCumulativeStake) {
                _safeMint(stakers[i], tokenId);
                emit mint(stakers[i], tokenId);
                return;
            }
            cumulativeStake = nextCumulativeStake;
        }
    }

    uint randNonce = 0;
    
    function randomProbability() internal returns(uint256) {
        randNonce++; 
        return (uint(keccak256(abi.encodePacked(block.timestamp, blockhash(block.number), randNonce))) % 100);
    }
}
