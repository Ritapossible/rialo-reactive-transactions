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
import { Send, ExternalLink, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useTransferToken } from '@/hooks/useTokenContract';
import { isAddress } from 'viem';
import { useNotifications } from '@/hooks/useNotifications';
import { useIsCorrectNetwork } from './NetworkWarning';

interface SendTokenDialogProps {
  tokenAddress?: `0x${string}`;
  tokenSymbol?: string;
  tokenBalance?: number;
  onSendSuccess?: () => void;
  disabled?: boolean;
}

export function SendTokenDialog({ 
  tokenAddress, 
  tokenSymbol = 'TOKEN',
  tokenBalance = 0,
  onSendSuccess,
  disabled = false
}: SendTokenDialogProps) {
  const { isConnected } = useAccount();
  const isCorrectNetwork = useIsCorrectNetwork();
  const [isOpen, setIsOpen] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const { addNotification } = useNotifications();
  
  const { transfer, hash, isPending, isConfirming, isSuccess, error } = useTransferToken();

  useEffect(() => {
    if (isSuccess && hash) {
      toast.success(`Tokens sent successfully!`);
      
      addNotification({
        type: 'success',
        title: 'Tokens Sent',
        message: `Sent ${parseFloat(amount).toLocaleString()} ${tokenSymbol} to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
        txHash: hash,
      });
      
      setRecipient('');
      setAmount('');
      setIsOpen(false);
      onSendSuccess?.();
    }
  }, [isSuccess, hash, onSendSuccess, addNotification, amount, tokenSymbol, recipient]);

  useEffect(() => {
    if (error) {
      if (error.message.includes('User rejected') || error.message.includes('rejected')) {
        toast.error('Transaction rejected by user');
      } else {
        toast.error('Failed to send tokens', {
          description: error.message.slice(0, 100),
        });
      }
    }
  }, [error]);

  const handleSend = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!tokenAddress) {
      toast.error('No token selected');
      return;
    }

    if (!recipient.trim()) {
      toast.error('Please enter a recipient address');
      return;
    }

    if (!isAddress(recipient)) {
      toast.error('Invalid wallet address');
      return;
    }

    const sendAmount = parseFloat(amount);
    if (isNaN(sendAmount) || sendAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (sendAmount > tokenBalance) {
      toast.error('Insufficient balance');
      return;
    }

    transfer(tokenAddress, recipient as `0x${string}`, sendAmount);
  };

  const isLoading = isPending || isConfirming;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={disabled ? {} : { scale: 1.02 }} whileTap={disabled ? {} : { scale: 0.98 }}>
          <Button size="sm" variant="outline" className="gap-1" disabled={disabled}>
            <Send className="h-4 w-4" />
            Send
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Send Tokens
          </DialogTitle>
          <DialogDescription>
            Transfer {tokenSymbol} tokens to another wallet on Sepolia.
          </DialogDescription>
        </DialogHeader>
        
        <motion.div 
          className="space-y-4 py-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Available Balance</span>
            <span className="font-semibold">{tokenBalance.toLocaleString()} {tokenSymbol}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sendAmount">Amount</Label>
            <div className="relative">
              <Input
                id="sendAmount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="any"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs"
                onClick={() => setAmount(tokenBalance.toString())}
                disabled={isLoading}
              >
                MAX
              </Button>
            </div>
          </div>

          {!isConnected && (
            <motion.p 
              className="text-sm text-warning bg-warning/10 p-3 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Please connect your wallet to send tokens.
            </motion.p>
          )}

          {isConnected && !isCorrectNetwork && (
            <motion.p 
              className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Please switch to Sepolia network to send tokens.
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
              onClick={handleSend} 
              disabled={isLoading || !isConnected || !tokenAddress || !isCorrectNetwork}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Send className="h-4 w-4" />
                  </motion.div>
                  {isPending ? 'Sign in Wallet...' : 'Confirming...'}
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  Send Tokens
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
