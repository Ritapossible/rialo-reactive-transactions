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
import { Plus, Sparkles, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { useCreateToken } from '@/hooks/useTokenContract';
import { useNotifications } from '@/hooks/useNotifications';
import { useIsCorrectNetwork } from './NetworkWarning';

interface MintDialogProps {
  onMintSuccess: () => void;
}

export function MintDialog({ onMintSuccess }: MintDialogProps) {
  const { address, isConnected } = useAccount();
  const isCorrectNetwork = useIsCorrectNetwork();
  const [isOpen, setIsOpen] = useState(false);
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [amount, setAmount] = useState('');
  const { addNotification } = useNotifications();
  
  const { createToken, hash, isPending, isConfirming, isSuccess, error, createdTokenAddress } = useCreateToken();

  useEffect(() => {
    if (isSuccess && hash && address && createdTokenAddress) {
      // Save to database after successful on-chain mint
      const saveToken = async () => {
        const tokenIcons = ['🔷', '💎', '🏆', '🌊', '⚡', '🔥', '💫', '🌟'];
        const randomIcon = tokenIcons[Math.floor(Math.random() * tokenIcons.length)];
        const randomPrice = (Math.random() * 5 + 0.1).toFixed(2);
        const randomChange = (Math.random() * 20 - 10).toFixed(1);

        await supabase.from('tokens').insert({
          wallet_address: address,
          name: tokenName.trim(),
          symbol: tokenSymbol.trim().toUpperCase(),
          balance: parseFloat(amount),
          price: parseFloat(randomPrice),
          change_24h: parseFloat(randomChange),
          icon: randomIcon,
          contract_address: createdTokenAddress,
        });

        toast.success(`Token created on-chain!`);
        
        addNotification({
          type: 'success',
          title: 'Token Minted',
          message: `Successfully deployed ${tokenSymbol.trim().toUpperCase()} token with ${parseFloat(amount).toLocaleString()} supply`,
          txHash: hash,
        });

        setTokenName('');
        setTokenSymbol('');
        setAmount('');
        setIsOpen(false);
        onMintSuccess();
      };
      
      saveToken();
    }
  }, [isSuccess, hash, address, tokenName, tokenSymbol, amount, onMintSuccess, createdTokenAddress]);

  useEffect(() => {
    if (error) {
      if (error.message.includes('User rejected') || error.message.includes('rejected')) {
        toast.error('Transaction rejected by user');
      } else {
        toast.error('Failed to create token', {
          description: error.message.slice(0, 100),
        });
      }
    }
  }, [error]);

  const handleMint = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!isCorrectNetwork) {
      toast.error('Please switch to Sepolia network');
      return;
    }

    if (!tokenName.trim() || !tokenSymbol.trim() || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    const mintAmount = parseFloat(amount);
    if (isNaN(mintAmount) || mintAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    createToken(tokenName.trim(), tokenSymbol.trim().toUpperCase(), mintAmount);
  };

  const isLoading = isPending || isConfirming;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button size="sm" variant="outline" className="gap-1">
            <Plus className="h-4 w-4" />
            Mint
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Mint Token On-Chain
          </DialogTitle>
          <DialogDescription>
            Deploy a new ERC-20 token on Sepolia testnet. Gas fees apply.
          </DialogDescription>
        </DialogHeader>
        
        <motion.div 
          className="space-y-4 py-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="space-y-2">
            <Label htmlFor="tokenName">Token Name</Label>
            <Input
              id="tokenName"
              placeholder="e.g., My Token"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              maxLength={50}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tokenSymbol">Token Symbol</Label>
            <Input
              id="tokenSymbol"
              placeholder="e.g., MTK"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
              maxLength={10}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Initial Supply</Label>
            <Input
              id="amount"
              type="number"
              placeholder="e.g., 1000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              disabled={isLoading}
            />
          </div>

          {!isConnected && (
            <motion.p 
              className="text-sm text-warning bg-warning/10 p-3 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Please connect your wallet to mint tokens.
            </motion.p>
          )}

          {isConnected && !isCorrectNetwork && (
            <motion.p 
              className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Please switch to Sepolia network to mint tokens.
            </motion.p>
          )}

          {isConfirming && (
            <motion.p 
              className="text-sm text-primary bg-primary/10 p-3 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Confirming transaction on blockchain...
            </motion.p>
          )}
        </motion.div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={handleMint} 
              disabled={isLoading || !isConnected || !isCorrectNetwork}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.div>
                  {isPending ? 'Sign in Wallet...' : 'Confirming...'}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Deploy Token
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
