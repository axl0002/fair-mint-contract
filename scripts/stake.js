require("dotenv").config()
const API_URL = process.env.API_URL
const PUBLIC_KEY = process.env.PUBLIC_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY
const PUBLIC_KEY_2 = process.env.PUBLIC_KEY_2
const PRIVATE_KEY_2 = process.env.PRIVATE_KEY_2
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS

const { createAlchemyWeb3 } = require("@alch/alchemy-web3")
const web3 = createAlchemyWeb3(API_URL)

const contract = require("../artifacts/contracts/LotteryNFT.sol/LotteryNFT.json")
const contractAddress = CONTRACT_ADDRESS
const nftContract = new web3.eth.Contract(contract.abi, contractAddress)



async function stake1() {
  const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, "latest") //get latest nonce

  const value = web3.utils.toWei('0.00009', 'ether')
  //the transaction
  const tx = {
    to: contractAddress,
    nonce: nonce,
    gas: 500000,
    value: value,
    data: nftContract.methods.stake().encodeABI(),
  }

  const signPromise = web3.eth.accounts.signTransaction(tx, PRIVATE_KEY)
  signPromise
    .then((signedTx) => {
      web3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
        function (err, hash) {
          if (!err) {
            console.log(
              "The hash of your transaction is: ",
              hash,
              "\nCheck Alchemy's Mempool to view the status of your transaction!"
            )
          } else {
            console.log(
              "Something went wrong when submitting your transaction:",
              err
            )
          }
        }
      )
    })
    .catch((err) => {
      console.log("Promise failed:", err)
    })
}

async function stake2() {
  const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY_2, "latest") //get latest nonce

  const value = web3.utils.toWei('0.00001', 'ether')
  //the transaction
  const tx = {
    to: contractAddress,
    nonce: nonce,
    gas: 500000,
    value: value,
    data: nftContract.methods.stake().encodeABI(),
  }

  const signPromise = web3.eth.accounts.signTransaction(tx, PRIVATE_KEY_2)
  signPromise
    .then((signedTx) => {
      web3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
        function (err, hash) {
          if (!err) {
            console.log(
              "The hash of your transaction is: ",
              hash,
              "\nCheck Alchemy's Mempool to view the status of your transaction!"
            )
          } else {
            console.log(
              "Something went wrong when submitting your transaction:",
              err
            )
          }
        }
      )
    })
    .catch((err) => {
      console.log("Promise failed:", err)
    })
}

stake1()
stake2()