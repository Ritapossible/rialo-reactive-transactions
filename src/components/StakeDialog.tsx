import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, ExternalLink, TrendingUp, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useStake, useUnstake, useClaimRewards, useStakeInfo, useApproveForStaking } from '@/hooks/useStaking';
import { useNotifications } from '@/hooks/useNotifications';
import { useIsCorrectNetwork } from './NetworkWarning';

interface StakeDialogProps {
  tokenAddress?: `0x${string}`;
  tokenSymbol?: string;
  tokenBalance?: number;
  onStakeSuccess?: () => void;
  disabled?: boolean;
}

export function StakeDialog({ 
  tokenAddress, 
  tokenSymbol = 'TOKEN',
  tokenBalance = 0,
  onStakeSuccess,
  disabled = false
}: StakeDialogProps) {
  const { address, isConnected } = useAccount();
  const isCorrectNetwork = useIsCorrectNetwork();
  const [isOpen, setIsOpen] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const { addNotification } = useNotifications();
  
  const { stake, hash: stakeHash, isPending: isStakePending, isConfirming: isStakeConfirming, isSuccess: isStakeSuccess, error: stakeError } = useStake();
  const { unstake, hash: unstakeHash, isPending: isUnstakePending, isConfirming: isUnstakeConfirming, isSuccess: isUnstakeSuccess, error: unstakeError } = useUnstake();
  const { claimRewards, hash: claimHash, isPending: isClaimPending, isConfirming: isClaimConfirming, isSuccess: isClaimSuccess, error: claimError } = useClaimRewards();
  const { approve, isPending: isApprovePending, isConfirming: isApproveConfirming, isSuccess: isApproveSuccess, error: approveError } = useApproveForStaking();
  
  const { stakedAmount, pendingRewards, stakingTime, refetch: refetchStakeInfo } = useStakeInfo(
    address,
    tokenAddress
  );

  // Handle stake success
  useEffect(() => {
    if (isStakeSuccess && stakeHash) {
      toast.success(`Tokens staked successfully!`);
      
      addNotification({
        type: 'success',
        title: 'Tokens Staked',
        message: `Successfully staked ${parseFloat(stakeAmount).toLocaleString()} ${tokenSymbol} at 10% APY`,
        txHash: stakeHash,
      });
      
      setStakeAmount('');
      refetchStakeInfo();
      onStakeSuccess?.();
    }
  }, [isStakeSuccess, stakeHash, onStakeSuccess, refetchStakeInfo, addNotification, stakeAmount, tokenSymbol]);

  // Handle unstake success
  useEffect(() => {
    if (isUnstakeSuccess && unstakeHash) {
      toast.success(`Tokens unstaked successfully!`);
      
      addNotification({
        type: 'success',
        title: 'Tokens Unstaked',
        message: `Successfully unstaked ${parseFloat(stakedAmount).toLocaleString()} ${tokenSymbol}`,
        txHash: unstakeHash,
      });
      
      refetchStakeInfo();
      onStakeSuccess?.();
    }
  }, [isUnstakeSuccess, unstakeHash, onStakeSuccess, refetchStakeInfo, addNotification, stakedAmount, tokenSymbol]);

  // Handle claim success
  useEffect(() => {
    if (isClaimSuccess && claimHash) {
      toast.success(`Rewards claimed!`);
      
      addNotification({
        type: 'success',
        title: 'Rewards Claimed',
        message: `Successfully claimed ${parseFloat(pendingRewards).toFixed(6)} ${tokenSymbol} rewards`,
        txHash: claimHash,
      });
      
      refetchStakeInfo();
    }
  }, [isClaimSuccess, claimHash, refetchStakeInfo, addNotification, pendingRewards, tokenSymbol]);

  // Handle approve success - proceed to stake
  useEffect(() => {
    if (isApproveSuccess && isApproving && tokenAddress) {
      setIsApproving(false);
      stake(tokenAddress, parseFloat(stakeAmount));
    }
  }, [isApproveSuccess, isApproving, tokenAddress, stakeAmount, stake]);

  // Handle errors
  useEffect(() => {
    const error = stakeError || unstakeError || claimError || approveError;
    if (error) {
      setIsApproving(false);
      if (error.message.includes('User rejected') || error.message.includes('rejected')) {
        toast.error('Transaction rejected by user');
      } else {
        toast.error('Transaction failed', {
          description: error.message.slice(0, 100),
        });
      }
    }
  }, [stakeError, unstakeError, claimError, approveError]);

  const handleStake = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!tokenAddress) {
      toast.error('No token selected');
      return;
    }

    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > tokenBalance) {
      toast.error('Insufficient balance');
      return;
    }

    // First approve, then stake
    setIsApproving(true);
    approve(tokenAddress, amount);
  };

  const handleUnstake = async () => {
    if (!isConnected || !tokenAddress) return;
    unstake(tokenAddress);
  };

  const handleClaimRewards = async () => {
    if (!isConnected || !tokenAddress) return;
    claimRewards(tokenAddress);
  };

  const isStaking = isApprovePending || isApproveConfirming || isStakePending || isStakeConfirming;
  const isUnstaking = isUnstakePending || isUnstakeConfirming;
  const isClaiming = isClaimPending || isClaimConfirming;

  const stakingDays = stakingTime > 0 ? Math.floor((Date.now() / 1000 - stakingTime) / 86400) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={disabled ? {} : { scale: 1.02 }} whileTap={disabled ? {} : { scale: 0.98 }}>
          <Button size="sm" variant="outline" className="gap-1" disabled={disabled}>
            <Coins className="h-4 w-4" />
            Stake
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Stake {tokenSymbol}
          </DialogTitle>
          <DialogDescription>
            Stake your tokens to earn rewards. 10% APY on Sepolia testnet.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="stake" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stake">Stake</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>

          <TabsContent value="stake">
            <motion.div 
              className="space-y-4 py-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Available</span>
                <span className="font-semibold">{tokenBalance.toLocaleString()} {tokenSymbol}</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stakeAmount">Amount to Stake</Label>
                <div className="relative">
                  <Input
                    id="stakeAmount"
                    type="number"
                    placeholder="0.00"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    min="0"
                    step="any"
                    disabled={isStaking}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs"
                    onClick={() => setStakeAmount(tokenBalance.toString())}
                    disabled={isStaking}
                  >
                    MAX
                  </Button>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-center gap-2 text-primary">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">10% APY Rewards</span>
                </div>
              </div>

              {isConnected && !isCorrectNetwork && (
                <motion.p 
                  className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Please switch to Sepolia network to stake tokens.
                </motion.p>
              )}

              {isConnected && isCorrectNetwork && !tokenAddress && (
                <motion.p 
                  className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  This token was minted before contract tracking was added. Please mint a new token to use Send/Stake features.
                </motion.p>
              )}

              <Button 
                onClick={handleStake} 
                disabled={isStaking || !isConnected || !tokenAddress || !isCorrectNetwork}
                className="w-full gap-2"
              >
                {isStaking ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Coins className="h-4 w-4" />
                    </motion.div>
                    {isApproving ? 'Approving...' : 'Staking...'}
                  </>
                ) : (
                  <>
                    <Coins className="h-4 w-4" />
                    Stake Tokens
                  </>
                )}
              </Button>
            </motion.div>
          </TabsContent>

          <TabsContent value="manage">
            <motion.div 
              className="space-y-4 py-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Staked</p>
                  <p className="font-semibold">{parseFloat(stakedAmount).toLocaleString()} {tokenSymbol}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Staking Days</p>
                  <p className="font-semibold">{stakingDays} days</p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-success/20 bg-success/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-success">
                    <Gift className="h-4 w-4" />
                    <span className="text-sm font-medium">Pending Rewards</span>
                  </div>
                  <span className="font-semibold text-success">{parseFloat(pendingRewards).toFixed(6)} {tokenSymbol}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleClaimRewards} 
                  disabled={isClaiming || parseFloat(pendingRewards) === 0 || !isConnected}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  {isClaiming ? 'Claiming...' : 'Claim Rewards'}
                </Button>
                <Button 
                  onClick={handleUnstake} 
                  disabled={isUnstaking || parseFloat(stakedAmount) === 0 || !isConnected}
                  variant="destructive"
                  className="flex-1 gap-2"
                >
                  {isUnstaking ? 'Unstaking...' : 'Unstake All'}
                </Button>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
