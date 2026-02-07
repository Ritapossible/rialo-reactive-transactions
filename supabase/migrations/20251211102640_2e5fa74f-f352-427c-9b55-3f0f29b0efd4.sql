-- Create workflows table for automated actions
CREATE TABLE public.workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  
  -- Trigger conditions
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('price_threshold', 'time_interval', 'balance_threshold', 'network_activity', 'user_onboarding', 'transaction_count')),
  trigger_condition TEXT NOT NULL, -- e.g., 'above', 'below', 'equals', 'every'
  trigger_value NUMERIC NOT NULL,
  trigger_token TEXT, -- Token symbol for price/balance triggers
  
  -- Action to perform
  action_type TEXT NOT NULL CHECK (action_type IN ('stake', 'unstake', 'transfer', 'swap', 'distribute_rewards', 'notify', 'bridge')),
  action_amount NUMERIC,
  action_recipient TEXT,
  action_token TEXT,
  
  -- Stats
  tokens_staked NUMERIC DEFAULT 0,
  rewards_generated NUMERIC DEFAULT 0,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own workflows"
ON public.workflows FOR SELECT
USING (true);

CREATE POLICY "Users can create their own workflows"
ON public.workflows FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own workflows"
ON public.workflows FOR UPDATE
USING (true);

CREATE POLICY "Users can delete their own workflows"
ON public.workflows FOR DELETE
USING (true);

-- Create workflow execution logs
CREATE TABLE public.workflow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  trigger_met TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('success', 'failed', 'pending')),
  transaction_hash TEXT,
  rewards_earned NUMERIC DEFAULT 0,
  details JSONB
);

-- Enable RLS
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflow executions"
ON public.workflow_executions FOR SELECT
USING (true);

CREATE POLICY "System can insert executions"
ON public.workflow_executions FOR INSERT
WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflows;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflow_executions;

-- Add trigger for updated_at
CREATE TRIGGER update_workflows_updated_at
BEFORE UPDATE ON public.workflows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();