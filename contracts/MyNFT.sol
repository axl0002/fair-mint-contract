//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract MyNFT is Ownable, ERC721("FairNFT", "FNFT") {
    uint256 public minimumStake = 0.05 ether;
    uint256 public targetStake = 0.1 ether;
    uint public totalStake;
    uint tokenId;
    uint public totalStakers;
    bool public stakingIsLocked = false;
    bool public tokensAreReleased = false;
    mapping(uint=>address) public stakers;
    mapping(address=>tokenMetaData[]) public ownershipRecord;
    mapping(address=>uint256) public amountStakedPerAddress;
    
    struct tokenMetaData{
        uint tokenId;
        uint timeStamp;
        string tokenURI;
    }

    event mint(address  indexed toAddress, uint indexed tokenId);
    
    function stake() external payable {
        require(msg.value >= minimumStake, "Not enough Ether to stake");
        require(!stakingIsLocked);

        // ownershipRecord[msg.sender].push(tokenMetaData(tokenId, block.timestamp, "ipfs://QmZdvtvDYqXZYjiUVX7LSD1654xjSMVc88c45tsrMkD1hH"));
        
        if (amountStakedPerAddress[msg.sender] == 0)
            stakers[totalStakers] = msg.sender;
            totalStakers += 1;

        amountStakedPerAddress[msg.sender] += msg.value;
        totalStake += msg.value;
    }

    function releaseTokens() external onlyOwner {
        require(totalStake >= targetStake, "Not enough total_stake to release tokens");
        require(!tokensAreReleased, "Tokens have already been released");

        stakingIsLocked = true;
        tokensAreReleased = true;

        uint256 cumulativeStake = 0;

        uint256 chosenStaker = (totalStake / 100) * randomProbability();

        // console.log('chosenStaker: ', chosenStaker);

        for(uint i = 0 ; i < totalStakers; i++) {

            uint256 nextCumulativeStake = cumulativeStake + amountStakedPerAddress[stakers[i]];

            // console.log('loop: ', cumulativeStake, nextCumulativeStake);

            if (cumulativeStake <= chosenStaker && chosenStaker < nextCumulativeStake) {
                // console.log('minting');
                _safeMint(stakers[i], tokenId);
                emit mint(stakers[i], tokenId);
                return;
            }
            cumulativeStake = nextCumulativeStake;
        }
    }

    // Initializing the state variable
    uint randNonce = 0;
    
    // Defining a function to generate
    // a random number
    function randomProbability() internal returns(uint256) {
        // increase nonce
        randNonce++; 
        return (uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))) % 100);
    }
}
