// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MintableToken
 * @dev ERC20 token that can be created by the TokenFactory
 */
contract MintableToken is ERC20, Ownable {
    uint8 private _decimals;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_,
        address owner_
    ) ERC20(name_, symbol_) Ownable(owner_) {
        _decimals = 18;
        _mint(owner_, initialSupply_ * 10**_decimals);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}

/**
 * @title TokenFactory
 * @dev Factory contract for creating new ERC20 tokens on Sepolia testnet
 */
contract TokenFactory {
    // Mapping from creator address to array of token addresses
    mapping(address => address[]) public tokensByCreator;
    
    // Array of all created tokens
    address[] public allTokens;

    // Event emitted when a new token is created
    event TokenCreated(
        address indexed creator,
        address tokenAddress,
        string name,
        string symbol
    );

    /**
     * @dev Creates a new ERC20 token
     * @param name The name of the token
     * @param symbol The symbol of the token
     * @param initialSupply The initial supply (will be multiplied by 10^18)
     * @return The address of the newly created token
     */
    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) external returns (address) {
        MintableToken newToken = new MintableToken(
            name,
            symbol,
            initialSupply,
            msg.sender
        );

        address tokenAddress = address(newToken);
        tokensByCreator[msg.sender].push(tokenAddress);
        allTokens.push(tokenAddress);

        emit TokenCreated(msg.sender, tokenAddress, name, symbol);

        return tokenAddress;
    }

    /**
     * @dev Returns all tokens created by a specific address
     * @param creator The address of the token creator
     * @return Array of token addresses
     */
    function getTokensByCreator(address creator) external view returns (address[] memory) {
        return tokensByCreator[creator];
    }

    /**
     * @dev Returns all created tokens
     * @return Array of all token addresses
     */
    function getAllTokens() external view returns (address[] memory) {
        return allTokens;
    }

    /**
     * @dev Returns the total number of tokens created
     * @return The count of all tokens
     */
    function getTokenCount() external view returns (uint256) {
        return allTokens.length;
    }
}
