import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, ChevronDown, Copy, Check, AlertTriangle, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { getWalletLogo } from '@/lib/walletIcons';

const hasWeb3Wallet = () => {
  return typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined';
};

const getNetworkName = (chainId: number | undefined) => {
  if (!chainId) return 'Unknown';
  if (chainId === sepolia.id) return 'Sepolia';
  if (chainId === 1) return 'Ethereum';
  if (chainId === 137) return 'Polygon';
  if (chainId === 56) return 'BSC';
  if (chainId === 42161) return 'Arbitrum';
  if (chainId === 10) return 'Optimism';
  return `Chain ${chainId}`;
};

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [copied, setCopied] = useState(false);
  
  const isWrongNetwork = isConnected && chainId !== sepolia.id;

  // Filter to only show available/ready connectors, excluding WalletConnect
  const availableWallets = useMemo(() => {
    return connectors.filter(connector => {
      // Exclude WalletConnect
      if (connector.id === 'walletConnect') return false;
      return true;
    });
  }, [connectors]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnectWallet = (connector: typeof connectors[0]) => {
    connect({ connector }, {
      onError: (error) => {
        if (error.message.includes('User rejected') || error.message.includes('rejected')) {
          toast.error('Connection rejected by user');
        } else {
          toast.error('Failed to connect wallet');
        }
      }
    });
  };

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <Button variant={isWrongNetwork ? "destructive" : "outline"} size="sm" className="gap-2">
              {isWrongNetwork ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              )}
              <span className="font-mono">{formatAddress(address)}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-popover">
          {/* Network indicator */}
          <div className="flex items-center gap-2 px-2 py-1.5 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className={isWrongNetwork ? "text-destructive font-medium" : "text-success font-medium"}>
              {getNetworkName(chainId)}
            </span>
          </div>
          <DropdownMenuSeparator />
          
          {isWrongNetwork && (
            <>
              <DropdownMenuItem 
                onClick={() => switchChain({ chainId: sepolia.id })}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Switch to Sepolia
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            onClick={copyAddress}
            className="cursor-pointer"
          >
            {copied ? (
              <Check className="h-4 w-4 mr-2 text-success" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {copied ? 'Copied!' : 'Copy Address'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => disconnect()}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Not connected - show wallet selection dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button size="sm" disabled={isPending} className="gap-2">
            <Wallet className="h-4 w-4" />
            {isPending ? 'Connecting...' : 'Connect Wallet'}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-popover">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Available Wallets
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {!hasWeb3Wallet() ? (
          <div className="px-3 py-4 text-center">
            <Wallet className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">No Wallet Detected</p>
            <p className="text-xs text-muted-foreground">
              Install MetaMask, Trust Wallet, Coinbase Wallet, or open in a wallet browser.
            </p>
          </div>
        ) : availableWallets.length === 0 ? (
          <div className="px-3 py-4 text-center">
            <p className="text-sm text-muted-foreground">No wallets available</p>
          </div>
        ) : (
          availableWallets.map((connector) => {
            const logo = getWalletLogo(connector.name);
            return (
              <DropdownMenuItem
                key={connector.uid}
                onClick={() => handleConnectWallet(connector)}
                className="cursor-pointer"
                disabled={isPending}
              >
                {logo ? (
                  <img src={logo} alt={connector.name} className="w-6 h-6 mr-3 rounded" />
                ) : (
                  <Wallet className="w-6 h-6 mr-3 text-muted-foreground" />
                )}
                <div className="flex flex-col">
                  <span className="font-medium">{connector.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {connector.id === 'injected' ? 'Browser Extension' : connector.type}
                  </span>
                </div>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
