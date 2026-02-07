import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockLeaderboard, LeaderboardEntry } from '@/lib/mockData';
import { Trophy, Medal, Award } from 'lucide-react';
import { motion } from 'framer-motion';

function LeaderboardRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-warning" />;
      case 2: return <Medal className="h-5 w-5 text-muted-foreground" />;
      case 3: return <Award className="h-5 w-5 text-warning/70" />;
      default: return <span className="w-5 text-center font-mono text-muted-foreground">{rank}</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
      whileHover={{ scale: 1.02, x: 5 }}
      className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition-all cursor-pointer ${
        entry.rank <= 3 ? 'bg-primary/5 border border-primary/10' : 'bg-secondary/50 hover:bg-secondary'
      }`}
    >
      <motion.div 
        className="flex items-center justify-center w-6 sm:w-8"
        animate={entry.rank === 1 ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {getRankIcon(entry.rank)}
      </motion.div>
      
      <motion.div 
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent flex items-center justify-center text-lg sm:text-xl"
        whileHover={{ rotate: 10 }}
      >
        {entry.avatar}
      </motion.div>
      
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate text-sm sm:text-base">{entry.username}</p>
        <p className="text-xs sm:text-sm text-muted-foreground font-mono">{entry.address}</p>
      </div>
      
      <div className="hidden sm:grid grid-cols-3 gap-4 md:gap-6 text-right">
        <div>
          <p className="text-xs text-muted-foreground">Staked</p>
          <p className="font-mono font-semibold text-sm">{entry.tokensStaked.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Workflows</p>
          <p className="font-mono font-semibold text-sm">{entry.workflowsCreated}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Rewards</p>
          <p className="font-mono font-semibold text-success text-sm">{entry.rewardsEarned.toLocaleString()}</p>
        </div>
      </div>

      {/* Mobile view */}
      <div className="sm:hidden text-right">
        <p className="font-mono font-semibold text-success text-sm">{entry.rewardsEarned.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">rewards</p>
      </div>
    </motion.div>
  );
}

export function Leaderboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card variant="gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            >
              🏆
            </motion.span>
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockLeaderboard.map((entry, index) => (
            <LeaderboardRow key={entry.rank} entry={entry} index={index} />
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
