// Wallet logo imports
import metamaskLogo from '@/assets/wallets/metamask.png';
import coinbaseLogo from '@/assets/wallets/coinbase.png';
import trustLogo from '@/assets/wallets/trust.png';
import phantomLogo from '@/assets/wallets/phantom.png';
import rainbowLogo from '@/assets/wallets/rainbow.png';
import braveLogo from '@/assets/wallets/brave.png';
import okxLogo from '@/assets/wallets/okx.png';
import bitgetLogo from '@/assets/wallets/bitget.png';
import walletconnectLogo from '@/assets/wallets/walletconnect.png';

export const walletLogos: Record<string, string> = {
  metamask: metamaskLogo,
  coinbase: coinbaseLogo,
  trust: trustLogo,
  phantom: phantomLogo,
  rainbow: rainbowLogo,
  brave: braveLogo,
  okx: okxLogo,
  bitget: bitgetLogo,
  walletconnect: walletconnectLogo,
};

export const getWalletLogo = (name: string): string | null => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('metamask')) return walletLogos.metamask;
  if (lowerName.includes('coinbase')) return walletLogos.coinbase;
  if (lowerName.includes('trust')) return walletLogos.trust;
  if (lowerName.includes('phantom')) return walletLogos.phantom;
  if (lowerName.includes('rainbow')) return walletLogos.rainbow;
  if (lowerName.includes('brave')) return walletLogos.brave;
  if (lowerName.includes('okx') || lowerName.includes('okex')) return walletLogos.okx;
  if (lowerName.includes('bitget')) return walletLogos.bitget;
  if (lowerName.includes('walletconnect')) return walletLogos.walletconnect;
  
  return null;
};
