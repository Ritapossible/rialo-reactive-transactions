import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from './useNotifications';

export interface Workflow {
  id: string;
  wallet_address: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'completed';
  trigger_type: string;
  trigger_condition: string;
  trigger_value: number;
  trigger_token?: string;
  action_type: string;
  action_amount?: number;
  action_recipient?: string;
  action_token?: string;
  tokens_staked: number;
  rewards_generated: number;
  execution_count: number;
  last_executed_at?: string;
  created_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  executed_at: string;
  trigger_met: string;
  action_taken: string;
  result: 'success' | 'failed' | 'pending';
  transaction_hash?: string;
  rewards_earned: number;
}

export interface CreateWorkflowData {
  name: string;
  description?: string;
  trigger_type: string;
  trigger_condition: string;
  trigger_value: number;
  trigger_token?: string;
  action_type: string;
  action_amount?: number;
  action_recipient?: string;
  action_token?: string;
  tokens_staked?: number;
}

// Rialo-specific default workflows - unique entries only
const defaultWorkflows: Omit<CreateWorkflowData, 'wallet_address'>[] = [
  {
    name: 'Auto-Stake Rewards',
    description: 'Automatically stake RLO when balance exceeds threshold',
    trigger_type: 'balance_threshold',
    trigger_condition: 'above',
    trigger_value: 1000,
    trigger_token: 'RLO',
    action_type: 'stake',
    action_amount: 100,
    action_token: 'RLO',
    tokens_staked: 1500,
  },
  {
    name: 'Price Alert Buy',
    description: 'Buy RLO when price drops below target',
    trigger_type: 'price_threshold',
    trigger_condition: 'below',
    trigger_value: 2.0,
    trigger_token: 'RLO',
    action_type: 'swap',
    action_amount: 100,
    action_token: 'RLO',
    tokens_staked: 2000,
  },
  {
    name: 'Network Activity Bridge',
    description: 'Bridge tokens when network activity is high',
    trigger_type: 'network_activity',
    trigger_condition: 'above',
    trigger_value: 80,
    action_type: 'bridge',
    action_amount: 500,
    action_token: 'RLO',
    tokens_staked: 3500,
  },
];

export function useWorkflows() {
  const { address, isConnected } = useAccount();
  const { addNotification } = useNotifications();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const fetchWorkflows = useCallback(async () => {
    if (!address) {
      setWorkflows([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('wallet_address', address)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // If no workflows exist, create defaults
      if (!data || data.length === 0) {
        await seedDefaultWorkflows();
        return;
      }

      setWorkflows(data as Workflow[]);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  const seedDefaultWorkflows = async () => {
    if (!address) return;

    try {
      const workflowsToInsert = defaultWorkflows.map(w => ({
        ...w,
        wallet_address: address,
        status: 'active',
      }));

      const { data, error } = await supabase
        .from('workflows')
        .insert(workflowsToInsert)
        .select();

      if (error) throw error;
      setWorkflows(data as Workflow[]);
    } catch (error) {
      console.error('Error seeding workflows:', error);
    }
  };

  const createWorkflow = async (workflowData: CreateWorkflowData) => {
    if (!address) return null;

    try {
      const { data, error } = await supabase
        .from('workflows')
        .insert({
          ...workflowData,
          wallet_address: address,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      setWorkflows(prev => [data as Workflow, ...prev]);
      addNotification({
        type: 'success',
        title: 'Workflow Created',
        message: `"${workflowData.name}" is now active and monitoring conditions`,
      });

      return data;
    } catch (error) {
      console.error('Error creating workflow:', error);
      addNotification({
        type: 'error',
        title: 'Failed to Create Workflow',
        message: 'Please try again',
      });
      return null;
    }
  };

  const updateWorkflowStatus = async (workflowId: string, status: 'active' | 'paused') => {
    const workflow = workflows.find(w => w.id === workflowId);
    const previousStatus = workflow?.status;

    // Optimistic update - update UI immediately
    setWorkflows(prev =>
      prev.map(w => (w.id === workflowId ? { ...w, status } : w))
    );

    try {
      const { error } = await supabase
        .from('workflows')
        .update({ status })
        .eq('id', workflowId);

      if (error) throw error;

      addNotification({
        type: status === 'active' ? 'success' : 'info',
        title: status === 'active' ? 'Workflow Activated' : 'Workflow Paused',
        message: workflow?.name || 'Workflow status updated',
      });
    } catch (error) {
      console.error('Error updating workflow:', error);
      // Revert on error
      setWorkflows(prev =>
        prev.map(w => (w.id === workflowId ? { ...w, status: previousStatus || 'paused' } : w))
      );
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    try {
      const workflow = workflows.find(w => w.id === workflowId);
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', workflowId);

      if (error) throw error;

      setWorkflows(prev => prev.filter(w => w.id !== workflowId));
      addNotification({
        type: 'info',
        title: 'Workflow Deleted',
        message: workflow?.name || 'Workflow removed',
      });
    } catch (error) {
      console.error('Error deleting workflow:', error);
    }
  };

  const evaluateWorkflows = async (userBalance: number = 0) => {
    if (!address || isEvaluating) return;

    setIsEvaluating(true);
    try {
      const response = await supabase.functions.invoke('workflow-engine', {
        body: {
          action: 'evaluate',
          wallet_address: address,
          user_balance: userBalance,
        },
      });

      if (response.error) throw response.error;

      const { results, marketData } = response.data;

      // Notify for each executed workflow
      for (const result of results || []) {
        if (result.executed) {
          addNotification({
            type: 'success',
            title: 'Workflow Executed',
            message: `"${result.name}" triggered: ${result.action} (+${result.reward.toFixed(2)} rewards)`,
          });
        }
      }

      // Update workflow stats locally without overwriting status
      if (results) {
        setWorkflows(prev => prev.map(w => {
          const executed = results.find((r: any) => r.workflow_id === w.id);
          if (executed) {
            return {
              ...w,
              execution_count: (w.execution_count || 0) + 1,
              rewards_generated: (w.rewards_generated || 0) + (executed.reward || 0),
              last_executed_at: new Date().toISOString(),
            };
          }
          return w;
        }));
      }

      return { results, marketData };
    } catch (error) {
      console.error('Error evaluating workflows:', error);
      return null;
    } finally {
      setIsEvaluating(false);
    }
  };

  // Fetch recent executions
  const fetchExecutions = useCallback(async () => {
    if (!address) return;

    try {
      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setExecutions(data as WorkflowExecution[]);
    } catch (error) {
      console.error('Error fetching executions:', error);
    }
  }, [address]);

  // Set up realtime subscription for workflow changes
  useEffect(() => {
    fetchWorkflows();
    fetchExecutions();

    if (!address) return;

    const workflowChannel = supabase
      .channel(`workflows-${address}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'workflows' },
        (payload) => {
          const newWorkflow = payload.new as Workflow;
          // Only add if it belongs to this wallet and not already in state
          if (newWorkflow.wallet_address === address) {
            setWorkflows(prev => {
              const exists = prev.some(w => w.id === newWorkflow.id);
              if (exists) return prev;
              return [newWorkflow, ...prev];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'workflows' },
        (payload) => {
          const updatedWorkflow = payload.new as Workflow;
          if (updatedWorkflow.wallet_address === address) {
            setWorkflows(prev => 
              prev.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w)
            );
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'workflows' },
        (payload) => {
          const deletedWorkflow = payload.old as { id: string };
          setWorkflows(prev => prev.filter(w => w.id !== deletedWorkflow.id));
        }
      )
      .subscribe();

    const executionChannel = supabase
      .channel(`executions-${address}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'workflow_executions' },
        (payload) => {
          const newExecution = payload.new as WorkflowExecution;
          setExecutions(prev => {
            const exists = prev.some(e => e.id === newExecution.id);
            if (exists) return prev;
            return [newExecution, ...prev].slice(0, 20);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(workflowChannel);
      supabase.removeChannel(executionChannel);
    };
  }, [fetchWorkflows, fetchExecutions, address]);

  // Auto-evaluate workflows periodically
  useEffect(() => {
    if (!isConnected || !address) return;

    const interval = setInterval(() => {
      evaluateWorkflows(5000); // Pass mock balance
    }, 30000); // Evaluate every 30 seconds

    return () => clearInterval(interval);
  }, [isConnected, address]);

  return {
    workflows,
    executions,
    isLoading,
    isEvaluating,
    createWorkflow,
    updateWorkflowStatus,
    deleteWorkflow,
    evaluateWorkflows,
    refetch: fetchWorkflows,
  };
}
