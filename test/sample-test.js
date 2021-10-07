const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MarketPlace", () => {
  it("Should deploy marketplace and NFT contracts", async function () {
    const Market = await ethers.getContractFactory("Market");
    const market = await Market.deploy();
    await market.deployed();

    marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();
    nftMarketAddress = await nft.getContractAddress();

    expect(nftMarketAddress).to.equal(marketAddress)
  });

  //it("Should create market item", ())
});
