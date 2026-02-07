import { http, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// WalletConnect project ID - Get your own at https://cloud.walletconnect.com
// This is a public project ID for demo purposes
const projectId = '3fbb6bba6f1de962d911914a5d0b5eed';

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    walletConnect({ 
      projectId,
      showQrModal: true,
      metadata: {
        name: 'Mini-Rialo',
        description: 'Gamified Blockchain Testnet Simulator',
        url: typeof window !== 'undefined' ? window.location.origin : '',
        icons: []
      }
    }),
  ],
  transports: {
    [sepolia.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
