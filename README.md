# fair-mint-contract

1. Compile the contract

npx hardhat compile

2. Deploy the contract to the Rinkeby network, and save contract address to .env file

npx hardhat --network rinkeby run scripts/deploy.js

3. Run stake scripts, with two wallets

node scripts/stake.js

4. Execute the lottery and release the tokens

node scripts/release-nft.js