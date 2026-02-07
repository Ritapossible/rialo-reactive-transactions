import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useChainId } from 'wagmi';
import { parseEther, formatEther, decodeEventLog } from 'viem';
import { TOKEN_FACTORY_ABI, ERC20_ABI, getContractAddress, SEPOLIA_CHAIN_ID } from '@/contracts/abis';
import { useState, useEffect, useCallback } from 'react';

export function useCreateToken() {
  const chainId = useChainId();
  const tokenFactoryAddress = getContractAddress(chainId?.toString() || SEPOLIA_CHAIN_ID, 'TokenFactory') as `0x${string}`;
  
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [createdTokenAddress, setCreatedTokenAddress] = useState<`0x${string}` | undefined>();
  
  const { writeContractAsync, isPending, error, reset: resetWrite } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({ 
    hash: txHash,
    query: { enabled: !!txHash }
  });

  // Extract the created token address from the TokenCreated event
  useEffect(() => {
    if (receipt?.logs && isSuccess) {
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: TOKEN_FACTORY_ABI,
            data: log.data,
            topics: log.topics,
          }) as { eventName: string; args: { tokenAddress: `0x${string}` } };
          if (decoded.eventName === 'TokenCreated') {
            setCreatedTokenAddress(decoded.args.tokenAddress);
            break;
          }
        } catch {
          // Not a TokenCreated event, continue
        }
      }
    }
  }, [receipt, isSuccess]);

  const createToken = useCallback(async (name: string, symbol: string, initialSupply: number) => {
    try {
      // Reset state for new transaction
      setTxHash(undefined);
      setCreatedTokenAddress(undefined);
      resetWrite();
      
      const hash = await writeContractAsync({
        address: tokenFactoryAddress,
        abi: TOKEN_FACTORY_ABI,
        functionName: 'createToken',
        args: [name, symbol, BigInt(initialSupply)],
      } as any);
      setTxHash(hash);
    } catch (e) {
      console.error('Create token error:', e);
      throw e;
    }
  }, [writeContractAsync, tokenFactoryAddress, resetWrite]);

  // Reset hash after success to stop polling
  useEffect(() => {
    if (isSuccess && createdTokenAddress) {
      // Keep the hash for one render cycle for success handling, then clear
      const timer = setTimeout(() => {
        setTxHash(undefined);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, createdTokenAddress]);

  return { createToken, hash: txHash, isPending, isConfirming, isSuccess, error, createdTokenAddress };
}

export function useTransferToken() {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  
  const { writeContractAsync, isPending, error, reset: resetWrite } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash: txHash,
    query: { enabled: !!txHash }
  });

  const transfer = useCallback(async (tokenAddress: `0x${string}`, to: `0x${string}`, amount: number) => {
    try {
      setTxHash(undefined);
      resetWrite();
      
      const hash = await writeContractAsync({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [to, parseEther(amount.toString())],
      } as any);
      setTxHash(hash);
    } catch (e) {
      console.error('Transfer error:', e);
      throw e;
    }
  }, [writeContractAsync, resetWrite]);

  // Reset hash after success to stop polling
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setTxHash(undefined);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  return { transfer, hash: txHash, isPending, isConfirming, isSuccess, error };
}

export function useApproveToken() {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  
  const { writeContractAsync, isPending, error, reset: resetWrite } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash: txHash,
    query: { enabled: !!txHash }
  });

  const approve = useCallback(async (tokenAddress: `0x${string}`, spender: `0x${string}`, amount: number) => {
    try {
      setTxHash(undefined);
      resetWrite();
      
      const hash = await writeContractAsync({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spender, parseEther(amount.toString())],
      } as any);
      setTxHash(hash);
    } catch (e) {
      console.error('Approve error:', e);
      throw e;
    }
  }, [writeContractAsync, resetWrite]);

  // Reset hash after success to stop polling
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setTxHash(undefined);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  return { approve, hash: txHash, isPending, isConfirming, isSuccess, error };
}

export function useTokenBalance(tokenAddress: `0x${string}` | undefined, userAddress: `0x${string}` | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!tokenAddress && !!userAddress },
  } as any);

  return { balance: data ? formatEther(data as bigint) : '0', isLoading, refetch };
}
