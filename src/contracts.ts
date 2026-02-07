// src/contracts.ts

// 1. Define the Chain IDs
export const SEPOLIA_CHAIN_ID = '11155111';
export const HARDHAT_LOCAL_CHAIN_ID = '31337';

// 2. Define the types for clarity
interface ContractAddresses {
  [chainID: string]: {
    Staking: string;
    TokenFactory: string;
  };
}

// 3. Store the Deployed Addresses (Use YOUR addresses)
export const CONTRACT_ADDRESSES: ContractAddresses = {
    // Sepolia Network
    [SEPOLIA_CHAIN_ID]: {
        Staking: "your-contrast-address",
        TokenFactory: "your-contrast-address",
    },
    // Hardhat Local Development Network (Placeholders, updated after local deploy)
    [HARDHAT_LOCAL_CHAIN_ID]: {
        // NOTE: Replace these with the addresses from your next local deployment!
        Staking: "your-contrast-address",
        TokenFactory: "your-contrast-address",
    },
};

/**
 * Helper function to retrieve the contract address for a given chain.
 */
export function getContractAddress(chainId: string, contractName: keyof ContractAddresses['11155111']): string {
    const addresses = CONTRACT_ADDRESSES[chainId];
    if (!addresses) {
        // Fallback for when the app is connected to an unlisted chain
        return CONTRACT_ADDRESSES[HARDHAT_LOCAL_CHAIN_ID][contractName] || ''; 
    }
    return addresses[contractName];
}
