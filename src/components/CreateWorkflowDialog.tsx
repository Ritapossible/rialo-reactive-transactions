import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Zap, ArrowRight } from 'lucide-react';
import { useWorkflows, CreateWorkflowData } from '@/hooks/useWorkflows';
import { motion } from 'framer-motion';

const triggerTypes = [
  { value: 'price_threshold', label: 'Price Threshold', description: 'When token price crosses a value' },
  { value: 'balance_threshold', label: 'Balance Threshold', description: 'When wallet balance crosses a value' },
  { value: 'time_interval', label: 'Time Interval', description: 'At regular time intervals' },
  { value: 'network_activity', label: 'Network Activity', description: 'Based on Rialo network metrics' },
  { value: 'user_onboarding', label: 'User Onboarding', description: 'When new users join' },
  { value: 'transaction_count', label: 'Transaction Count', description: 'Based on transaction volume' },
];

const actionTypes = [
  { value: 'stake', label: 'Stake Tokens', description: 'Auto-stake tokens for rewards' },
  { value: 'unstake', label: 'Unstake Tokens', description: 'Withdraw staked tokens' },
  { value: 'transfer', label: 'Transfer', description: 'Send tokens to address' },
  { value: 'swap', label: 'Swap Tokens', description: 'Exchange between tokens' },
  { value: 'distribute_rewards', label: 'Distribute Rewards', description: 'Send rewards to users' },
  { value: 'bridge', label: 'Cross-Chain Bridge', description: 'Bridge tokens across chains' },
  { value: 'notify', label: 'Send Notification', description: 'Alert when condition met' },
];

const conditions = [
  { value: 'above', label: 'Above' },
  { value: 'below', label: 'Below' },
  { value: 'equals', label: 'Equals' },
  { value: 'every', label: 'Every' },
];

const tokens = ['RLO', 'STK', 'RWD', 'ETH'];

export function CreateWorkflowDialog() {
  const { createWorkflow } = useWorkflows();
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateWorkflowData>>({
    name: '',
    trigger_type: 'price_threshold',
    trigger_condition: 'below',
    trigger_value: 2.0,
    trigger_token: 'RLO',
    action_type: 'stake',
    action_amount: 100,
    action_token: 'RLO',
    tokens_staked: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.trigger_type || !formData.action_type) return;

    setIsCreating(true);
    try {
      await createWorkflow(formData as CreateWorkflowData);
      setOpen(false);
      setFormData({
        name: '',
        trigger_type: 'price_threshold',
        trigger_condition: 'below',
        trigger_value: 2.0,
        trigger_token: 'RLO',
        action_type: 'stake',
        action_amount: 100,
        action_token: 'RLO',
        tokens_staked: 0,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const selectedTrigger = triggerTypes.find(t => t.value === formData.trigger_type);
  const selectedAction = actionTypes.find(a => a.value === formData.action_type);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Workflow</span>
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Create Automated Workflow
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Workflow Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Workflow Name</Label>
            <Input
              id="name"
              placeholder="e.g., Auto-Stake on Dip"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Trigger Section */}
          <div className="p-4 rounded-lg bg-secondary/50 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">1</div>
              When this happens...
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <Select
                  value={formData.trigger_type}
                  onValueChange={(v) => setFormData({ ...formData, trigger_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Condition</Label>
                <Select
                  value={formData.trigger_condition}
                  onValueChange={(v) => setFormData({ ...formData, trigger_condition: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.trigger_value}
                  onChange={(e) => setFormData({ ...formData, trigger_value: parseFloat(e.target.value) })}
                />
              </div>

              {(formData.trigger_type === 'price_threshold' || formData.trigger_type === 'balance_threshold') && (
                <div className="space-y-2">
                  <Label>Token</Label>
                  <Select
                    value={formData.trigger_token}
                    onValueChange={(v) => setFormData({ ...formData, trigger_token: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tokens.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {selectedTrigger && (
              <p className="text-xs text-muted-foreground">{selectedTrigger.description}</p>
            )}
          </div>

          <div className="flex justify-center">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Action Section */}
          <div className="p-4 rounded-lg bg-accent/30 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs">2</div>
              Do this automatically...
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Action</Label>
                <Select
                  value={formData.action_type}
                  onValueChange={(v) => setFormData({ ...formData, action_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypes.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={formData.action_amount}
                  onChange={(e) => setFormData({ ...formData, action_amount: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Token</Label>
              <Select
                value={formData.action_token}
                onValueChange={(v) => setFormData({ ...formData, action_token: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAction && (
              <p className="text-xs text-muted-foreground">{selectedAction.description}</p>
            )}
          </div>

          {/* Tokens to Stake */}
          <div className="space-y-2">
            <Label>Tokens to Stake (for rewards)</Label>
            <Input
              type="number"
              placeholder="0"
              value={formData.tokens_staked}
              onChange={(e) => setFormData({ ...formData, tokens_staked: parseFloat(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">
              Stake tokens to earn additional rewards when your workflow executes
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isCreating || !formData.name}>
            {isCreating ? 'Creating...' : 'Create Workflow'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
