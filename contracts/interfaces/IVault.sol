// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";

/**
 * @title IVault
 * @notice ERC4626-compatible vault interface with yield tracking
 * @dev Extends standard ERC4626 with harvest functionality
 */
interface IVault is IERC4626 {
    /**
     * @notice Harvests yield from the underlying strategy
     * @dev Should be called periodically to realize gains
     * @return The amount of yield harvested
     */
    function harvest() external returns (uint256);

    /**
     * @notice Returns the total assets at the last harvest
     * @return The total assets value at last harvest
     */
    function totalAssetsAtLastHarvest() external view returns (uint256);

    /**
     * @notice Returns the block number of the last harvest
     * @return The block number when harvest was last called
     */
    function lastHarvestBlock() external view returns (uint256);
}
