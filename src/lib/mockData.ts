export interface Token {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  price: number;
  change24h: number;
  icon: string;
}

export interface Workflow {
  id: string;
  name: string;
  status: "active" | "paused" | "completed";
  trigger: string;
  action: string;
  tokensStaked: number;
  rewardsGenerated: number;
  executionCount: number;
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  username: string;
  tokensStaked: number;
  workflowsCreated: number;
  rewardsEarned: number;
  avatar: string;
}

export interface NetworkMetric {
  name: string;
  value: number;
  change: number;
  icon: string;
}

export interface ActivityData {
  time: string;
  workflows: number;
  transactions: number;
  rewards: number;
}

export const mockTokens: Token[] = [
  { id: "1", name: "Rialo Token", symbol: "RLO", balance: 15420.50, price: 2.45, change24h: 5.2, icon: "🔷" },
  { id: "2", name: "Stake Coin", symbol: "STK", balance: 8750.00, price: 0.85, change24h: -2.1, icon: "💎" },
  { id: "3", name: "Reward Token", symbol: "RWD", balance: 3200.75, price: 1.20, change24h: 12.5, icon: "🏆" },
  { id: "4", name: "Flow Token", symbol: "FLW", balance: 5600.00, price: 0.45, change24h: 3.8, icon: "🌊" },
];

export const mockWorkflows: Workflow[] = [
  { id: "1", name: "Auto-Stake Rewards", status: "active", trigger: "Every 24 hours", action: "Stake 10% of RLO", tokensStaked: 1500, rewardsGenerated: 245.50, executionCount: 42 },
  { id: "2", name: "Price Alert Buy", status: "active", trigger: "RLO < $2.00", action: "Buy 100 RLO", tokensStaked: 2000, rewardsGenerated: 180.25, executionCount: 15 },
  { id: "3", name: "Community Reward", status: "paused", trigger: "New user joins", action: "Distribute 5 RWD", tokensStaked: 500, rewardsGenerated: 75.00, executionCount: 28 },
  { id: "4", name: "Yield Optimizer", status: "active", trigger: "APY > 15%", action: "Move funds to pool", tokensStaked: 3500, rewardsGenerated: 520.75, executionCount: 8 },
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, address: "0x1a2b...3c4d", username: "CryptoWhale", tokensStaked: 125000, workflowsCreated: 24, rewardsEarned: 8540, avatar: "🐋" },
  { rank: 2, address: "0x5e6f...7g8h", username: "DeFiMaster", tokensStaked: 98500, workflowsCreated: 18, rewardsEarned: 6320, avatar: "🦈" },
  { rank: 3, address: "0x9i0j...1k2l", username: "StakeKing", tokensStaked: 76200, workflowsCreated: 15, rewardsEarned: 4890, avatar: "👑" },
  { rank: 4, address: "0x3m4n...5o6p", username: "FlowRunner", tokensStaked: 54800, workflowsCreated: 12, rewardsEarned: 3210, avatar: "🏃" },
  { rank: 5, address: "0x7q8r...9s0t", username: "AutoTrader", tokensStaked: 42100, workflowsCreated: 9, rewardsEarned: 2450, avatar: "🤖" },
];

export const mockNetworkMetrics: NetworkMetric[] = [
  { name: "Total Value Locked", value: 2450000, change: 12.5, icon: "💰" },
  { name: "Active Workflows", value: 1842, change: 8.3, icon: "⚡" },
  { name: "Total Users", value: 15420, change: 5.7, icon: "👥" },
  { name: "Rewards Distributed", value: 856000, change: 15.2, icon: "🎁" },
];

export const mockActivityData: ActivityData[] = [
  { time: "00:00", workflows: 45, transactions: 120, rewards: 250 },
  { time: "04:00", workflows: 32, transactions: 85, rewards: 180 },
  { time: "08:00", workflows: 78, transactions: 210, rewards: 420 },
  { time: "12:00", workflows: 125, transactions: 340, rewards: 680 },
  { time: "16:00", workflows: 156, transactions: 420, rewards: 850 },
  { time: "20:00", workflows: 98, transactions: 280, rewards: 520 },
  { time: "Now", workflows: 112, transactions: 310, rewards: 620 },
];

export const aiSuggestions = [
  { id: "1", title: "Optimize Staking", description: "Move 2,500 RLO to the high-yield pool for 18% APY", confidence: 92, action: "stake" },
  { id: "2", title: "Buy Opportunity", description: "STK is 15% below 7-day average. Consider accumulating.", confidence: 78, action: "buy" },
  { id: "3", title: "Workflow Alert", description: "Your 'Price Alert Buy' workflow hasn't triggered in 5 days", confidence: 85, action: "review" },
];
