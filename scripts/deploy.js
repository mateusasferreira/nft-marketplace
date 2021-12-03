// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  const Market = await hre.ethers.getContractFactory("Market");
  const market = await Market.deploy("MArketplace deployed");
  await market.deployed;
  console.log(`market contract deployed to ${market.address}`)

  const NFT = await hre.ethers.getContractFactory("NFT"); 
  const nft = await NFT.deploy(market.address);
  await nft.deployed;
  console.log(`nft contract deployed to ${nft.address}`)


  let config = `
  export const nftmarketaddress = "${nftMarket.address}"
  export const nftaddress = "${nft.address}"
  `

  let data = JSON.stringify(config)
  fs.writeFileSync('config.js', JSON.parse(data))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
