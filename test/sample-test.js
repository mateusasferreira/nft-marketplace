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

  it("Should create market sale", async () => {
    const Market = await ethers.getContractFactory("Market");
    const market = await Market.deploy();
    await market.deployed();

    marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();

    nftAddress = nft.address;

    const [marketPlaceOwner, sellerAddress, buyerAddress] = await ethers.getSigners();
    
    await nft.connect(sellerAddress).createToken("www.mytoken.com")

    const listingPrice = await market.getListingPrice();

    auctionPrice = ethers.utils.parseEther('100')

    await market.connect(sellerAddress).createMarketItem(nftAddress, 1, 100, {value: listingPrice})

    await expect(await market.connect(buyerAddress)
      .createMarketSale(nftAddress, 1, {value: 100}))
      .to.changeEtherBalance(buyerAddress, -100)
      .to.changeEtherBalance(sellerAddress, 100)
      .to.changeEtherBalance(marketPlaceOwner, listingPrice)
  });

  it("Should update market item price", async () => {
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

  it("should not update price if requester is not seller", async () => {
    const Market = await ethers.getContractFactory("Market");
    const market = await Market.deploy();
    await market.deployed();

    marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();

    nftAddress = nft.address;

    const [marketplaceOwner, sellerAddress, nonAuthorizedPerson] = await ethers.getSigners();
    
    await nft.connect(sellerAddress).createToken("www.mytoken.com")

    const listingPrice = await market.getListingPrice();

    await market.connect(sellerAddress).createMarketItem(nftAddress, 1, 100, {value: listingPrice})

    await expect(market.connect(nonAuthorizedPerson).updateMarketItemPrice(1, 150))
      .to.be.reverted
    
    await expect(market.connect(marketplaceOwner).updateMarketItemPrice(1, 150))
      .to.be.revertedWith("Only the product can do this operation");
  })

  it("should allow buyer to resell an owned item", async () => {
    const Market = await ethers.getContractFactory("Market");
    const market = await Market.deploy();
    await market.deployed();

    marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();

    nftAddress = nft.address;

    const [marketplaceOwner, creator, buyer] = await ethers.getSigners();

    await nft.connect(creator).createToken("www.mytoken.com")

    const listingPrice = await market.getListingPrice();

    await market.connect(creator).createMarketItem(nftAddress, 1, 100, {value: listingPrice})

    const unsoldItem = await market.fetchSingleItem(1)

    await market.connect(buyer).createMarketSale(nftAddress, 1, {value: 100})
    
    await market.connect(buyer).putItemToResell(1, 150, {value: listingPrice})

    const item = await market.fetchSingleItem(1)

    expect(item.owner).to.equal(unsoldItem.owner);
    expect(item.seller).to.equal(buyer.address)
    expect(item.creator).to.equal(creator.address)
  })

  
  it("Should allow seller to delete market item ", async () => {
    const Market = await ethers.getContractFactory("Market");
    const market = await Market.deploy();
    await market.deployed();

    marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();

    nftAddress = nft.address;

    const [marketplaceOwner, seller] = await ethers.getSigners();

    await nft.connect(seller).createToken("www.mytoken.com")

    const listingPrice = await market.getListingPrice();

    const initialPrice = ethers.utils.parseUnits('100', 'ether')

    await market.connect(seller).createMarketItem(nftAddress, 1, initialPrice, {value: listingPrice})

    await market.connect(seller).deleteMarketItem(1)

    const item = await market.fetchSingleItem(1)
  
    expect(item.tokenId).to.equal(0)
  });

  it("Should allow marketplace owner to delete market item ", async () => {
    const Market = await ethers.getContractFactory("Market");
    const market = await Market.deploy();
    await market.deployed();

    marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();

    nftAddress = nft.address;

    const [marketplaceOwner, seller] = await ethers.getSigners();

    await nft.connect(seller).createToken("www.mytoken.com")

    const listingPrice = await market.getListingPrice();

    const initialPrice = ethers.utils.parseUnits('100', 'ether')

    await market.connect(seller).createMarketItem(nftAddress, 1, initialPrice, {value: listingPrice})

    await market.connect(marketplaceOwner).deleteMarketItem(1)

    const item = await market.fetchSingleItem(1)
  
    expect(item.tokenId).to.equal(0)
  });

  it("should allow buyer to delete item", async () => {
    const Market = await ethers.getContractFactory("Market");
    const market = await Market.deploy();
    await market.deployed();

    marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();

    const [marketplaceOwner, seller, buyer] = await ethers.getSigners();

    nftAddress = nft.address;

    await nft.connect(seller).createToken("www.mytoken.com")

    const listingPrice = await market.getListingPrice();

    await market.connect(seller).createMarketItem(nftAddress, 1, 100, {value: listingPrice})

    await market.connect(buyer).createMarketSale(nftAddress, 1, {value: 100})

    await market.connect(buyer).deleteMarketItem(1)

    const item = await market.fetchSingleItem(1)
    
    expect(item.tokenId).to.equal(0)
  })

  it("should not delete item is requester is not seller or marketplace", async () => {
    const Market = await ethers.getContractFactory("Market");
    const market = await Market.deploy();
    await market.deployed();

    marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();

    const [marketplaceOwner, seller, nonAuthorizedPerson] = await ethers.getSigners();

    nftAddress = nft.address;

    await nft.connect(seller).createToken("www.mytoken.com")

    const listingPrice = await market.getListingPrice();

    await market.connect(seller).createMarketItem(nftAddress, 1, 100, {value: listingPrice})

    await expect(market.connect(nonAuthorizedPerson).deleteMarketItem(1))
      .to.be.reverted
  })
});
