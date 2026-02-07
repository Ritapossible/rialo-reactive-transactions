import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

export function NetworkWarning() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId !== sepolia.id;

  return (
    <AnimatePresence>
      {isWrongNetwork && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-16 left-0 right-0 z-50 px-4"
        >
          <Alert variant="destructive" className="max-w-2xl mx-auto border-destructive/50 bg-destructive/10 backdrop-blur-sm">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Wrong Network</AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-4">
              <span>
                Please switch to <strong>Sepolia Testnet</strong> to use this app. 
                You are currently on an unsupported network.
              </span>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => switchChain({ chainId: sepolia.id })}
                disabled={isPending}
                className="shrink-0"
              >
                {isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Switching...
                  </>
                ) : (
                  'Switch to Sepolia'
                )}
              </Button>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useIsCorrectNetwork() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  return !isConnected || chainId === sepolia.id;
}
