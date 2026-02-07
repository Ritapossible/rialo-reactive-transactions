import { useState, useMemo } from 'react';
import { Menu, Wallet, LogOut, Copy, Check, AlertTriangle, Globe, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { toast } from 'sonner';
import { getWalletLogo } from '@/lib/walletIcons';

const navItems = [
  { href: '#dashboard', label: 'Dashboard' },
  { href: '#tokens', label: 'Tokens' },
  { href: '#workflows', label: 'Workflows' },
  { href: '#leaderboard', label: 'Leaderboard' },
];

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

const hasWeb3Wallet = () => {
  return typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined';
};

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showWalletList, setShowWalletList] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  const isWrongNetwork = isConnected && chainId !== sepolia.id;

  // Filter to only show available/ready connectors, excluding WalletConnect
  const availableWallets = useMemo(() => {
    return connectors.filter(connector => {
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
      onSuccess: () => {
        setIsOpen(false);
        setShowWalletList(false);
      },
      onError: (error) => {
        if (error.message.includes('User rejected') || error.message.includes('rejected')) {
          toast.error('Connection rejected by user');
        } else {
          toast.error('Failed to connect wallet');
        }
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) setShowWalletList(false);
    }}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader className="text-left">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">R</span>
            </div>
            <SheetTitle className="font-bold text-gradient">Mini-Rialo</SheetTitle>
          </div>
        </SheetHeader>
        
        <div className="flex flex-col mt-4 gap-4">
          {/* Navigation */}
          <nav>
            <AnimatePresence>
              {navItems.map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  {item.label}
                </motion.a>
              ))}
            </AnimatePresence>
          </nav>

          {/* Wallet Section - Last after navigation */}
          <div className="pt-4 border-t space-y-3">
            {isConnected && address ? (
              <>
                {/* Network indicator */}
                <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {isWrongNetwork ? (
                      <span className="text-destructive">{getNetworkName(chainId)} (Wrong Network)</span>
                    ) : (
                      <span className="text-success">{getNetworkName(chainId)}</span>
                    )}
                  </span>
                </div>

                {/* Connected wallet address */}
                <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg">
                  {isWrongNetwork ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  )}
                  <span className="font-mono text-sm">{formatAddress(address)}</span>
                </div>
                
                {/* Wrong network warning */}
                {isWrongNetwork && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full gap-2"
                    onClick={() => switchChain({ chainId: sepolia.id })}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Switch to Sepolia
                  </Button>
                )}
                
                {/* Copy address */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full gap-2"
                  onClick={copyAddress}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? 'Copied!' : 'Copy Address'}
                </Button>
                
                {/* Disconnect */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full gap-2 text-destructive hover:text-destructive"
                  onClick={() => {
                    disconnect();
                    setIsOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Disconnect
                </Button>
              </>
            ) : showWalletList ? (
              /* Wallet selection list */
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 mb-2"
                  onClick={() => setShowWalletList(false)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <p className="text-xs text-muted-foreground px-1 mb-2">Available Wallets</p>
                
                {!hasWeb3Wallet() ? (
                  <div className="px-3 py-4 text-center bg-secondary/50 rounded-lg">
                    <Wallet className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">No Wallet Detected</p>
                    <p className="text-xs text-muted-foreground">
                      Install MetaMask, Trust Wallet, or open in a wallet browser.
                    </p>
                  </div>
                ) : (
                  availableWallets.map((connector) => {
                    const logo = getWalletLogo(connector.name);
                    return (
                      <Button
                        key={connector.uid}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-3"
                        disabled={isPending}
                        onClick={() => handleConnectWallet(connector)}
                      >
                        {logo ? (
                          <img src={logo} alt={connector.name} className="w-6 h-6 rounded" />
                        ) : (
                          <Wallet className="w-6 h-6 text-muted-foreground" />
                        )}
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{connector.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {connector.id === 'injected' ? 'Browser Extension' : connector.type}
                          </span>
                        </div>
                      </Button>
                    );
                  })
                )}
              </div>
            ) : (
              /* Connect wallet button */
              <Button
                variant="default"
                className="w-full gap-2 gradient-primary"
                disabled={isPending}
                onClick={() => setShowWalletList(true)}
              >
                <Wallet className="h-4 w-4" />
                {isPending ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
