import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { mockTokens } from '@/lib/mockData';

export interface TokenData {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  price: number;
  change24h: number;
  icon: string;
  contractAddress?: string;
}

export function useTokens() {
  const { address, isConnected } = useAccount();
  const [tokens, setTokens] = useState<TokenData[]>(mockTokens.map(t => ({
    id: t.id,
    name: t.name,
    symbol: t.symbol,
    balance: t.balance,
    price: t.price,
    change24h: t.change24h,
    icon: t.icon,
  })));
  const [isLoading, setIsLoading] = useState(false);

  const fetchTokens = async () => {
    if (!isConnected || !address) {
      setTokens(mockTokens.map(t => ({
        id: t.id,
        name: t.name,
        symbol: t.symbol,
        balance: t.balance,
        price: t.price,
        change24h: t.change24h,
        icon: t.icon,
      })));
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .eq('wallet_address', address)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setTokens(data.map(t => ({
          id: t.id,
          name: t.name,
          symbol: t.symbol,
          balance: Number(t.balance),
          price: Number(t.price),
          change24h: Number(t.change_24h),
          icon: t.icon,
          contractAddress: t.contract_address || undefined,
        })));
      } else {
        // Show mock tokens if no user tokens
        setTokens(mockTokens.map(t => ({
          id: t.id,
          name: t.name,
          symbol: t.symbol,
          balance: t.balance,
          price: t.price,
          change24h: t.change24h,
          icon: t.icon,
        })));
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, [address, isConnected]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!isConnected || !address) return;

    const channel = supabase
      .channel('tokens-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tokens',
          filter: `wallet_address=eq.${address}`,
        },
        () => {
          fetchTokens();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [address, isConnected]);

  const totalValue = tokens.reduce((acc, t) => acc + t.balance * t.price, 0);

  return { tokens, totalValue, isLoading, refetch: fetchTokens };
}
