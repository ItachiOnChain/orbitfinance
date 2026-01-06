// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RWAIncomeNFT
 * @notice ERC-721 NFT representing tokenized real-world income streams
 */
contract RWAIncomeNFT is ERC721Enumerable, Ownable {
    enum AssetType { RENTAL, INVOICE, BOND }
    
    struct AssetMetadata {
        string assetName;
        AssetType assetType;
        uint256 monthlyIncome;  // in USDC (6 decimals)
        uint256 duration;       // in months
        uint256 totalValue;     // in USDC (6 decimals)
        uint256 mintedAt;
        bool spvApproved;
    }
    
    uint256 private _nextTokenId;
    mapping(uint256 => AssetMetadata) public assetMetadata;
    mapping(address => bool) public isSPVApprover;
    
    event AssetMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string assetName,
        AssetType assetType,
        uint256 totalValue
    );
    event SPVApproverAdded(address indexed approver);
    event SPVApproverRemoved(address indexed approver);
    event AssetApproved(uint256 indexed tokenId, address indexed approver);
    
    modifier onlySPVApprover() {
        require(isSPVApprover[msg.sender] || msg.sender == owner(), "RWAIncomeNFT: not SPV approver");
        _;
    }
    
    constructor() ERC721("Orbit RWA Income NFT", "orRWA") Ownable(msg.sender) {
        isSPVApprover[msg.sender] = true;
    }
    
    /**
     * @notice Mint a new RWA income NFT
     * @param to Recipient address
     * @param assetName Name of the asset
     * @param assetType Type of income stream
     * @param monthlyIncome Monthly income in USDC
     * @param duration Duration in months
     * @param totalValue Total asset value in USDC
     */
    function mint(
        address to,
        string memory assetName,
        AssetType assetType,
        uint256 monthlyIncome,
        uint256 duration,
        uint256 totalValue
    ) external onlySPVApprover returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        
        assetMetadata[tokenId] = AssetMetadata({
            assetName: assetName,
            assetType: assetType,
            monthlyIncome: monthlyIncome,
            duration: duration,
            totalValue: totalValue,
            mintedAt: block.timestamp,
            spvApproved: true
        });
        
        _safeMint(to, tokenId);
        
        emit AssetMinted(tokenId, to, assetName, assetType, totalValue);
        emit AssetApproved(tokenId, msg.sender);
        
        return tokenId;
    }
    
    /**
     * @notice Get the total value of an NFT
     * @param tokenId Token ID
     * @return Total value in USDC
     */
    function getValue(uint256 tokenId) external view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "RWAIncomeNFT: token does not exist");
        return assetMetadata[tokenId].totalValue;
    }
    
    /**
     * @notice Get all token IDs owned by an address
     * @param owner Address to query
     * @return Array of token IDs
     */
    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokens = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            tokens[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokens;
    }
    
    /**
     * @notice Add SPV approver
     * @param approver Address to grant approval rights
     */
    function addSPVApprover(address approver) external onlyOwner {
        isSPVApprover[approver] = true;
        emit SPVApproverAdded(approver);
    }
    
    /**
     * @notice Remove SPV approver
     * @param approver Address to revoke approval rights
     */
    function removeSPVApprover(address approver) external onlyOwner {
        isSPVApprover[approver] = false;
        emit SPVApproverRemoved(approver);
    }
    
    /**
     * @notice Get complete metadata for a token
     * @param tokenId Token ID
     * @return Metadata struct
     */
    function getMetadata(uint256 tokenId) external view returns (AssetMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "RWAIncomeNFT: token does not exist");
        return assetMetadata[tokenId];
    }
}
