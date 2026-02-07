import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useChainId } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { STAKING_ABI, ERC20_ABI, getContractAddress, SEPOLIA_CHAIN_ID } from '@/contracts/abis';
import { useState, useEffect, useCallback } from 'react';

export function useStake() {
  const chainId = useChainId();
  const stakingAddress = getContractAddress(chainId?.toString() || SEPOLIA_CHAIN_ID, 'Staking') as `0x${string}`;
  
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  
  const { writeContractAsync, isPending, error, reset: resetWrite } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash: txHash,
    query: { enabled: !!txHash }
  });

  const stake = useCallback(async (tokenAddress: `0x${string}`, amount: number) => {
    try {
      setTxHash(undefined);
      resetWrite();
      
      const hash = await writeContractAsync({
        address: stakingAddress,
        abi: STAKING_ABI,
        functionName: 'stake',
        args: [tokenAddress, parseEther(amount.toString())],
      } as any);
      setTxHash(hash);
    } catch (e) {
      console.error('Stake error:', e);
      throw e;
    }
  }, [writeContractAsync, stakingAddress, resetWrite]);

  // Reset hash after success to stop polling
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setTxHash(undefined);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  return { stake, hash: txHash, isPending, isConfirming, isSuccess, error };
}

export function useUnstake() {
  const chainId = useChainId();
  const stakingAddress = getContractAddress(chainId?.toString() || SEPOLIA_CHAIN_ID, 'Staking') as `0x${string}`;
  
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  
  const { writeContractAsync, isPending, error, reset: resetWrite } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash: txHash,
    query: { enabled: !!txHash }
  });

  const unstake = useCallback(async (tokenAddress: `0x${string}`) => {
    try {
      setTxHash(undefined);
      resetWrite();
      
      const hash = await writeContractAsync({
        address: stakingAddress,
        abi: STAKING_ABI,
        functionName: 'unstake',
        args: [tokenAddress],
      } as any);
      setTxHash(hash);
    } catch (e) {
      console.error('Unstake error:', e);
      throw e;
    }
  }, [writeContractAsync, stakingAddress, resetWrite]);

  // Reset hash after success to stop polling
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setTxHash(undefined);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  return { unstake, hash: txHash, isPending, isConfirming, isSuccess, error };
}

export function useClaimRewards() {
  const chainId = useChainId();
  const stakingAddress = getContractAddress(chainId?.toString() || SEPOLIA_CHAIN_ID, 'Staking') as `0x${string}`;
  
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  
  const { writeContractAsync, isPending, error, reset: resetWrite } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash: txHash,
    query: { enabled: !!txHash }
  });

  const claimRewards = useCallback(async (tokenAddress: `0x${string}`) => {
    try {
      setTxHash(undefined);
      resetWrite();
      
      const hash = await writeContractAsync({
        address: stakingAddress,
        abi: STAKING_ABI,
        functionName: 'claimRewards',
        args: [tokenAddress],
      } as any);
      setTxHash(hash);
    } catch (e) {
      console.error('Claim rewards error:', e);
      throw e;
    }
  }, [writeContractAsync, stakingAddress, resetWrite]);

  // Reset hash after success to stop polling
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setTxHash(undefined);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  return { claimRewards, hash: txHash, isPending, isConfirming, isSuccess, error };
}

export function useStakeInfo(userAddress: `0x${string}` | undefined, tokenAddress: `0x${string}` | undefined) {
  const chainId = useChainId();
  const stakingAddress = getContractAddress(chainId?.toString() || SEPOLIA_CHAIN_ID, 'Staking') as `0x${string}`;
  
  const { data, isLoading, refetch } = useReadContract({
    address: stakingAddress,
    abi: STAKING_ABI,
    functionName: 'getStakeInfo',
    args: userAddress && tokenAddress ? [userAddress, tokenAddress] : undefined,
    query: { enabled: !!userAddress && !!tokenAddress },
  } as any);

  const result = data as [bigint, bigint, bigint] | undefined;
  return {
    stakedAmount: result ? formatEther(result[0]) : '0',
    pendingRewards: result ? formatEther(result[1]) : '0',
    stakingTime: result ? Number(result[2]) : 0,
    isLoading,
    refetch,
  };
}

export function useApproveForStaking() {
  const chainId = useChainId();
  const stakingAddress = getContractAddress(chainId?.toString() || SEPOLIA_CHAIN_ID, 'Staking') as `0x${string}`;
  
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  
  const { writeContractAsync, isPending, error, reset: resetWrite } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash: txHash,
    query: { enabled: !!txHash }
  });

  const approve = useCallback(async (tokenAddress: `0x${string}`, amount: number) => {
    try {
      setTxHash(undefined);
      resetWrite();
      
      const hash = await writeContractAsync({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [stakingAddress, parseEther(amount.toString())],
      } as any);
      setTxHash(hash);
    } catch (e) {
      console.error('Approve error:', e);
      throw e;
    }
  }, [writeContractAsync, stakingAddress, resetWrite]);

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
