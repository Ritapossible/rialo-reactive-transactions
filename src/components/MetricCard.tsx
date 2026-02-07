import { Card, CardContent } from '@/components/ui/card';
import { NetworkMetric } from '@/lib/mockData';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  metric: NetworkMetric;
  index: number;
}

export function MetricCard({ metric, index }: MetricCardProps) {
  const isPositive = metric.change >= 0;
  
  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: 'spring',
        stiffness: 100
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
    >
      <Card variant="gradient" className="relative overflow-hidden group cursor-pointer">
        <motion.div 
          className="absolute inset-0 gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300"
        />
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 truncate">{metric.name}</p>
              <motion.p 
                className="text-2xl sm:text-3xl font-bold"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
              >
                {formatValue(metric.value)}
              </motion.p>
            </div>
            <motion.span 
              className="text-xl sm:text-2xl flex-shrink-0"
              animate={{ 
                y: [0, -5, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                repeatDelay: index * 0.5 + 1 
              }}
            >
              {metric.icon}
            </motion.span>
          </div>
          <motion.div 
            className={`flex items-center gap-1 mt-2 text-sm font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
          >
            {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            <span>{isPositive ? '+' : ''}{metric.change}%</span>
            <span className="text-muted-foreground font-normal ml-1 hidden sm:inline">vs last week</span>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
