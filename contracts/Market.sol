pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Market is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemsIds;
    Counters.Counter private _itemsSold;

    // owner of the marketplace
    address payable owner;
    // price for putting something to sale in the Marketplace
    uint256 listingPrice = 0.001 ether;

    constructor() {
        //set the owner of the contract to the one that deployed it
        owner = payable(msg.sender);
    }

    /* Returns the listing price of the contract */
    // function getListingPrice() public view returns (uint256) {
    //   return listingPrice;
    // }

    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price
    );

    //mateus

    event ProductUpdated(
      uint256 indexed itemId,
      uint256 indexed oldPrice,
      uint256 indexed newPrice
    );

    event MarketItemDeleted(uint256 itemId);

    event ProductSold(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price
    );

    modifier onlyProductOrMarketPlaceOwner(uint256 id) {
        if (idToMarketItem[id].owner != address(0)) {
            require(idToMarketItem[id].owner == msg.sender);
        } else {
            require(
                idToMarketItem[id].seller == msg.sender || msg.sender == owner
            );
        }
        _;
    }

    modifier onlyProductSeller(uint256 id) {
        require(
            idToMarketItem[id].owner == address(0) &&
                idToMarketItem[id].seller == msg.sender, "Only the product can do this operation"
        );
        _;
    }

    function getListingPrice() public view returns (uint256) {
      return listingPrice;
    }

    //mateus

    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        require(price > 0, "Price must be at least 1 wei");
        // obligates the seller to pay the listing price
        require(msg.value == listingPrice, "Listing fee required");

        _itemsIds.increment();
        uint256 itemId = _itemsIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price
        );
    }

    // mateus
    function deleteMarketItem(uint256 itemId)
        public
        onlyProductOrMarketPlaceOwner(itemId)
    {
        delete idToMarketItem[itemId];

        emit MarketItemDeleted(itemId);
    }

    function updateMarketItemPrice(uint256 id, uint256 newPrice)
        public 
        onlyProductSeller(id)
    {
        MarketItem storage item = idToMarketItem[id];
        uint256 oldPrice = item.price;
        item.price = newPrice;

        emit ProductUpdated(id, oldPrice, newPrice);
    }

    // mateus

    function createMarketSale(address nftContract, uint256 itemId)
        public
        payable
        nonReentrant
    {
        uint256 price = idToMarketItem[itemId].price;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(
            msg.value == price,
            "Please submit the asking price in order to complete the purchase"
        );

        idToMarketItem[itemId].seller.transfer(msg.value);
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment();

        //regards the marketplace with the listingPrice
        payable(owner).transfer(listingPrice);

        emit ProductSold(
            idToMarketItem[itemId].itemId,
            idToMarketItem[itemId].nftContract,
            idToMarketItem[itemId].tokenId,
            idToMarketItem[itemId].seller,
            payable(msg.sender),
            idToMarketItem[itemId].price
        );
    }

    //another possible options; fee is paid to the marketplace owner on the items sale;

    // function createMarketSale(
    //   address nftContract,
    //   uint256 itemId
    //   ) public payable nonReentrant {
    //   uint price = idToMarketItem[itemId].price;
    //   uint tokenId = idToMarketItem[itemId].tokenId;
    //   require(msg.value == price + listingPrice, "Please submit the asking price in order to complete the purchase");

    //   uint256 valueToSeller = msg.value - listingPrice;

    //   idToMarketItem[itemId].seller.transfer(valueToSeller);
    //   IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
    //   idToMarketItem[itemId].owner = payable(msg.sender);
    //   idToMarketItem[itemId].sold = true;
    //   _itemsSold.increment();

    //   //regards the marketplace with the listingPrice
    //   payable(owner).transfer(listingPrice);

    // emit ProductSold(
    // idToMarketItem[itemId].itemId,
    // idToMarketItem[itemId].nftContract,
    // idToMarketItem[itemId].tokenId,
    // idToMarketItem[itemId].seller,
    // payable(msg.sender),
    // valueToSeller
    //);
    // }

    function fetchSingleItem(uint id) public view returns (MarketItem memory) {
      return idToMarketItem[id];
    }

    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _itemsIds.current();
        uint256 unsoldItemCount = _itemsIds.current() - _itemsSold.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(0)) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemsIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }
}
