import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useWorkflows, Workflow } from '@/hooks/useWorkflows';
import { CreateWorkflowDialog } from './CreateWorkflowDialog';
import { MoreHorizontal, Zap, ChevronRight, Trash2, Play, Activity, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const triggerLabels: Record<string, string> = {
  price_threshold: 'Price',
  balance_threshold: 'Balance',
  time_interval: 'Time',
  network_activity: 'Network',
  user_onboarding: 'New Users',
  transaction_count: 'Tx Count',
};

const actionLabels: Record<string, string> = {
  stake: 'Stake',
  unstake: 'Unstake',
  transfer: 'Transfer',
  swap: 'Swap',
  distribute_rewards: 'Distribute',
  notify: 'Notify',
  bridge: 'Bridge',
};

const actionIcons: Record<string, string> = {
  stake: '📈',
  unstake: '📉',
  transfer: '💸',
  swap: '🔄',
  distribute_rewards: '🎁',
  notify: '🔔',
  bridge: '🌉',
};

function formatTrigger(workflow: Workflow): string {
  const type = triggerLabels[workflow.trigger_type] || workflow.trigger_type;
  const condition = workflow.trigger_condition;
  const value = workflow.trigger_value;
  const token = workflow.trigger_token || '';
  
  if (workflow.trigger_type === 'price_threshold') {
    return `${token} ${condition} $${value}`;
  }
  if (workflow.trigger_type === 'balance_threshold') {
    return `${token} balance ${condition} ${value}`;
  }
  if (workflow.trigger_type === 'user_onboarding') {
    return `${value}+ new users`;
  }
  if (workflow.trigger_type === 'network_activity') {
    return `Activity ${condition} ${value}%`;
  }
  return `${type}: ${condition} ${value}`;
}

function formatAction(workflow: Workflow): string {
  const action = actionLabels[workflow.action_type] || workflow.action_type;
  const amount = workflow.action_amount || 0;
  const token = workflow.action_token || '';
  
  return `${action} ${amount} ${token}`;
}

function WorkflowCard({ workflow, index }: { workflow: Workflow; index: number }) {
  const { updateWorkflowStatus, deleteWorkflow, evaluateWorkflows, isEvaluating } = useWorkflows();
  const isActive = workflow.status === 'active';

  const toggleWorkflow = () => {
    const newStatus = isActive ? 'paused' : 'active';
    updateWorkflowStatus(workflow.id, newStatus);
  };

  const handleDelete = () => {
    deleteWorkflow(workflow.id);
  };

  const handleManualRun = async () => {
    toast.info('Evaluating workflow conditions...');
    await evaluateWorkflows(5000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.01 }}
      className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div 
            className={`w-2 h-2 rounded-full ${isActive ? 'bg-success' : 'bg-muted-foreground'}`}
            animate={isActive ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-lg">
              {actionIcons[workflow.action_type] || '⚡'}
            </div>
            <div>
              <h4 className="font-semibold">{workflow.name}</h4>
              {workflow.description && (
                <p className="text-xs text-muted-foreground line-clamp-1">{workflow.description}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isActive ? 'success' : 'secondary'}>
            {isActive ? 'Active' : 'Paused'}
          </Badge>
          <Switch checked={isActive} onCheckedChange={toggleWorkflow} />
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 text-sm mb-3">
        <span className="px-2 py-1 rounded bg-card text-muted-foreground font-mono text-xs">
          {formatTrigger(workflow)}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="px-2 py-1 rounded bg-accent text-accent-foreground font-mono text-xs">
          {formatAction(workflow)}
        </span>
      </div>

      <motion.div 
        className="flex items-center justify-between pt-3 border-t border-border/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.2 }}
      >
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>Staked: <span className="font-mono text-foreground">{workflow.tokens_staked?.toLocaleString() || 0}</span></span>
          <span>Rewards: <span className="font-mono text-success">{workflow.rewards_generated?.toLocaleString() || 0}</span></span>
          <span className="hidden sm:inline">Runs: <span className="font-mono text-foreground">{workflow.execution_count || 0}</span></span>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleManualRun} disabled={isEvaluating}>
              {isEvaluating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Run Now
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    </motion.div>
  );
}

export function WorkflowBuilder() {
  const { workflows, isLoading, isEvaluating, evaluateWorkflows } = useWorkflows();

  const handleEvaluateAll = async () => {
    toast.info('Evaluating all workflow conditions...');
    const result = await evaluateWorkflows(5000);
    if (result?.results?.length > 0) {
      const executed = result.results.filter((r: any) => r.executed).length;
      toast.success(`${executed} workflow(s) executed`);
    } else {
      toast.info('No workflow conditions met at this time');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      id="workflows"
    >
      <Card variant="gradient">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              ⚙️
            </motion.span>
            Automated Workflows
            {isEvaluating && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEvaluateAll}
              disabled={isEvaluating}
              className="gap-1"
            >
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Evaluate</span>
            </Button>
            <CreateWorkflowDialog />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : workflows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No workflows yet. Create your first automated workflow!</p>
            </div>
          ) : (
            <AnimatePresence>
              {workflows.map((workflow, index) => (
                <WorkflowCard key={workflow.id} workflow={workflow} index={index} />
              ))}
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
