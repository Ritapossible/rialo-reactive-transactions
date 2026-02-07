import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { MintDialog } from './MintDialog';
import { SendTokenDialog } from './SendTokenDialog';
import { StakeDialog } from './StakeDialog';
import { useTokens, TokenData } from '@/hooks/useTokens';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

function TokenRow({ 
  token, 
  index, 
  isSelected,
  onSelect 
}: { 
  token: TokenData; 
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isPositive = token.change24h >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, x: 4 }}
      onClick={onSelect}
      className={`flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer ${
        isSelected 
          ? 'bg-primary/10 border border-primary/30' 
          : 'bg-secondary/50 hover:bg-secondary'
      }`}
    >
      <div className="flex items-center gap-3">
        <motion.div 
          className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-xl"
          whileHover={{ rotate: 10 }}
        >
          {token.icon}
        </motion.div>
        <div>
          <p className="font-semibold">{token.symbol}</p>
          <p className="text-sm text-muted-foreground">{token.name}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-mono font-semibold">{token.balance.toLocaleString()}</p>
        <motion.div 
          className={`flex items-center justify-end gap-1 text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          <span>{isPositive ? '+' : ''}{token.change24h}%</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function TokenPanel() {
  const { tokens, totalValue, isLoading, refetch } = useTokens();
  const { isConnected } = useAccount();
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  const selectedToken = tokens.find(t => t.id === selectedTokenId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card variant="gradient">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                💎
              </motion.span>
              Your Tokens
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Total Value: <span className="font-mono font-semibold text-foreground">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <MintDialog onMintSuccess={refetch} />
            <SendTokenDialog 
              tokenAddress={selectedToken?.contractAddress as `0x${string}` | undefined}
              tokenSymbol={selectedToken?.symbol}
              tokenBalance={selectedToken?.balance}
              onSendSuccess={refetch}
              disabled={!selectedToken}
            />
            <StakeDialog 
              tokenAddress={selectedToken?.contractAddress as `0x${string}` | undefined}
              tokenSymbol={selectedToken?.symbol}
              tokenBalance={selectedToken?.balance}
              onStakeSuccess={refetch}
              disabled={!selectedToken}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedToken && (
            <motion.p 
              className="text-xs text-muted-foreground bg-primary/10 p-2 rounded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Selected: <span className="font-semibold text-primary">{selectedToken.symbol}</span> - Click a token to select it for Send/Stake
            </motion.p>
          )}
          
          {!selectedToken && tokens.length > 0 && (
            <motion.p 
              className="text-xs text-muted-foreground bg-muted p-2 rounded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Click a token below to select it for sending or staking
            </motion.p>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {tokens.map((token, index) => (
                <TokenRow 
                  key={token.id} 
                  token={token} 
                  index={index}
                  isSelected={token.id === selectedTokenId}
                  onSelect={() => setSelectedTokenId(token.id === selectedTokenId ? null : token.id)}
                />
              ))}
            </AnimatePresence>
          )}
          
          {!isConnected && (
            <motion.p 
              className="text-sm text-center text-muted-foreground py-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Connect wallet to view your minted tokens
            </motion.p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
