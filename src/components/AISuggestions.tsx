import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { aiSuggestions } from '@/lib/mockData';
import { Sparkles, TrendingUp, ShoppingCart, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const actionIcons: Record<string, React.ReactNode> = {
  stake: <TrendingUp className="h-4 w-4" />,
  buy: <ShoppingCart className="h-4 w-4" />,
  review: <AlertCircle className="h-4 w-4" />,
};

export function AISuggestions() {
  const handleAction = (action: string, title: string) => {
    toast.success(`Action initiated: ${title}`, {
      description: 'This feature is coming soon in the full version.',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <Card variant="gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 180, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
            AI Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiSuggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-all"
            >
              <div className="flex items-start justify-between mb-2 gap-2">
                <h4 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                  {actionIcons[suggestion.action]}
                  {suggestion.title}
                </h4>
                <Badge variant="outline" className="font-mono shrink-0">
                  {suggestion.confidence}%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 sm:w-24 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${suggestion.confidence}%` }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:inline">Confidence</span>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleAction(suggestion.action, suggestion.title)}
                  >
                    Apply
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
