const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MarketPlace", () => {
  it("Should deploy marketplace and NFT contracts", async () => {
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

  it("Should have a listing price", async () => {
    
    const Market = await ethers.getContractFactory("Market");
    const market = await Market.deploy();
    await market.deployed();

    
    const listingPrice = await market.getListingPrice();
    
    const expectedListingPrice = ethers.utils.parseEther('0.001')
    
    expect(listingPrice).to.equal(expectedListingPrice)

  });

  it("Should create market item", async () => {
    const Market = await ethers.getContractFactory("Market");
    const market = await Market.deploy();
    await market.deployed();

    marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();

    nftAddress = nft.address;

    await nft.createToken("www.mytoken.com")

    const listingPrice = await market.getListingPrice();

    const itemPrice = ethers.utils.parseUnits('100', 'ether')

    await market.createMarketItem(nftAddress, 1, itemPrice, {value: listingPrice})

    createdItem = await market.fetchSingleItem(1);

    expect(createdItem.price).to.equal(itemPrice)
  });

  it("Should update item market price", async () => {
    const Market = await ethers.getContractFactory("Market");
    const market = await Market.deploy();
    await market.deployed();

    marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();

    nftAddress = nft.address;

    await nft.createToken("www.mytoken.com")

    const listingPrice = await market.getListingPrice();

    const initialPrice = ethers.utils.parseUnits('100', 'ether')

    await market.createMarketItem(nftAddress, 1, initialPrice, {value: listingPrice})

    const updatedPrice = ethers.utils.parseUnits('150', 'ether')

    await market.updateMarketItemPrice(1, updatedPrice)

    const updatedItem = await market.fetchSingleItem(1)

    expect(updatedItem.price).to.equal(updatedPrice)
  });

  it("Should delete market item", async () => {
    const Market = await ethers.getContractFactory("Market");
    const market = await Market.deploy();
    await market.deployed();

    marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();

    nftAddress = nft.address;

    await nft.createToken("www.mytoken.com")

    const listingPrice = await market.getListingPrice();

    const initialPrice = ethers.utils.parseUnits('100', 'ether')

    await market.createMarketItem(nftAddress, 1, initialPrice, {value: listingPrice})

    await market.deleteMarketItem(1)

    const item = await market.fetchSingleItem(1)
  
    expect(item.tokenId).to.equal(0)
  })
});
