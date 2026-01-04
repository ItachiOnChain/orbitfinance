// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IPriceOracle} from "../interfaces/IPriceOracle.sol";
import {OrbitErrors} from "../errors/OrbitErrors.sol";

/**
 * @title MockPriceOracle
 * @notice Simple price oracle for testing
 * @dev Provides configurable asset prices with 18 decimal precision
 */
contract MockPriceOracle is IPriceOracle {
    /// @notice Mapping of asset to price in USD (18 decimals)
    mapping(address asset => uint256 priceInUSD) public prices;

    /// @notice The owner of this contract
    address public owner;

    /**
     * @notice Emitted when a price is updated
     * @param asset The asset address
     * @param price The new price in USD
     */
    event PriceUpdated(address indexed asset, uint256 price);

    /**
     * @notice Ensures only the owner can call the function
     */
    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert OrbitErrors.Unauthorized(msg.sender);
        }
        _;
    }

    /**
     * @notice Creates a new MockPriceOracle with default prices
     * @dev Sets common asset prices: WETH, WBTC, USDC, DAI
     */
    constructor() {
        owner = msg.sender;

        // Set default prices (using placeholder addresses for testing)
        // In production, these would be actual token addresses
        // WETH: $3000
        // WBTC: $45000
        // USDC: $1
        // DAI: $1

        // Note: These are placeholder addresses for testing
        // Real addresses should be set via setPrice() in deployment scripts
    }

    /**
     * @notice Sets the price for an asset
     * @dev Only callable by owner
     * @param asset The asset address
     * @param priceInUSD The price in USD with 18 decimals
     */
    function setPrice(address asset, uint256 priceInUSD) external onlyOwner {
        if (priceInUSD == 0) {
            revert OrbitErrors.ZeroAmount();
        }

        prices[asset] = priceInUSD;
        emit PriceUpdated(asset, priceInUSD);
    }

    /**
     * @notice Batch sets prices for multiple assets
     * @dev Only callable by owner
     * @param assets Array of asset addresses
     * @param pricesInUSD Array of prices in USD with 18 decimals
     */
    function setPrices(
        address[] memory assets,
        uint256[] memory pricesInUSD
    ) external onlyOwner {
        if (assets.length != pricesInUSD.length) {
            revert OrbitErrors.InvalidState(
                uint8(assets.length),
                uint8(pricesInUSD.length)
            );
        }

        for (uint256 i = 0; i < assets.length; i++) {
            if (pricesInUSD[i] == 0) {
                revert OrbitErrors.ZeroAmount();
            }

            prices[assets[i]] = pricesInUSD[i];
            emit PriceUpdated(assets[i], pricesInUSD[i]);
        }
    }

    /**
     * @notice Returns the price of an asset in USD
     * @dev Implements IPriceOracle interface
     * @param asset The address of the asset
     * @return The price in USD with 18 decimals
     */
    function getPrice(address asset) external view override returns (uint256) {
        uint256 price = prices[asset];

        if (price == 0) {
            revert OrbitErrors.InvalidState(0, 1);
        }

        return price;
    }

    /**
     * @notice Transfers ownership to a new address
     * @dev Only callable by the current owner
     * @param newOwner The new owner address
     */
    function setOwner(address newOwner) external onlyOwner {
        if (newOwner == address(0)) {
            revert OrbitErrors.InvalidImplementation(newOwner);
        }

        owner = newOwner;
    }
}
