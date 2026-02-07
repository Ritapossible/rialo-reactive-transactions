import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkflowCondition {
  trigger_type: string;
  trigger_condition: string;
  trigger_value: number;
  trigger_token?: string;
}

interface MarketData {
  tokenPrices: Record<string, number>;
  networkActivity: number;
  newUsers: number;
  transactionCount: number;
}

// Simulated market data for demo (in production, fetch from oracles/APIs)
function getMarketData(): MarketData {
  return {
    tokenPrices: {
      RLO: 2.45 + (Math.random() - 0.5) * 0.5,
      STK: 0.85 + (Math.random() - 0.5) * 0.2,
      RWD: 1.20 + (Math.random() - 0.5) * 0.3,
      ETH: 2500 + (Math.random() - 0.5) * 200,
    },
    networkActivity: Math.floor(Math.random() * 100) + 50,
    newUsers: Math.floor(Math.random() * 20),
    transactionCount: Math.floor(Math.random() * 500) + 100,
  };
}

function evaluateCondition(condition: WorkflowCondition, marketData: MarketData, userBalance: number): boolean {
  const { trigger_type, trigger_condition, trigger_value, trigger_token } = condition;

  switch (trigger_type) {
    case 'price_threshold': {
      const price = marketData.tokenPrices[trigger_token || 'RLO'] || 0;
      if (trigger_condition === 'above') return price > trigger_value;
      if (trigger_condition === 'below') return price < trigger_value;
      if (trigger_condition === 'equals') return Math.abs(price - trigger_value) < 0.01;
      return false;
    }
    case 'balance_threshold': {
      if (trigger_condition === 'above') return userBalance > trigger_value;
      if (trigger_condition === 'below') return userBalance < trigger_value;
      return false;
    }
    case 'network_activity': {
      if (trigger_condition === 'above') return marketData.networkActivity > trigger_value;
      if (trigger_condition === 'below') return marketData.networkActivity < trigger_value;
      return false;
    }
    case 'user_onboarding': {
      return marketData.newUsers >= trigger_value;
    }
    case 'transaction_count': {
      if (trigger_condition === 'above') return marketData.transactionCount > trigger_value;
      return false;
    }
    case 'time_interval': {
      // For demo, randomly trigger time-based workflows
      return Math.random() > 0.7;
    }
    default:
      return false;
  }
}

function calculateReward(actionType: string, actionAmount: number): number {
  const rewardRates: Record<string, number> = {
    stake: 0.1,
    distribute_rewards: 0.05,
    transfer: 0.02,
    swap: 0.03,
    bridge: 0.08,
    unstake: 0,
    notify: 0,
  };
  return (actionAmount || 0) * (rewardRates[actionType] || 0);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, workflow_id, wallet_address, user_balance } = await req.json();

    if (action === 'evaluate') {
      // Fetch all active workflows for user
      const { data: workflows, error: fetchError } = await supabase
        .from('workflows')
        .select('*')
        .eq('wallet_address', wallet_address)
        .eq('status', 'active');

      if (fetchError) {
        console.error('Error fetching workflows:', fetchError);
        throw fetchError;
      }

      const marketData = getMarketData();
      const results = [];

      for (const workflow of workflows || []) {
        const conditionMet = evaluateCondition(workflow, marketData, user_balance || 0);

        if (conditionMet) {
          const reward = calculateReward(workflow.action_type, workflow.action_amount);
          
          // Log execution
          const { error: execError } = await supabase
            .from('workflow_executions')
            .insert({
              workflow_id: workflow.id,
              trigger_met: `${workflow.trigger_type}: ${workflow.trigger_condition} ${workflow.trigger_value}`,
              action_taken: `${workflow.action_type}: ${workflow.action_amount} ${workflow.action_token}`,
              result: 'success',
              rewards_earned: reward,
              details: { marketData, timestamp: new Date().toISOString() },
            });

          if (execError) console.error('Execution log error:', execError);

          // Update workflow stats
          await supabase
            .from('workflows')
            .update({
              execution_count: (workflow.execution_count || 0) + 1,
              rewards_generated: (workflow.rewards_generated || 0) + reward,
              last_executed_at: new Date().toISOString(),
            })
            .eq('id', workflow.id);

          results.push({
            workflow_id: workflow.id,
            name: workflow.name,
            executed: true,
            reward,
            action: workflow.action_type,
          });
        }
      }

      return new Response(
        JSON.stringify({ success: true, results, marketData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'create') {
      const { data, error } = await supabase
        .from('workflows')
        .insert(req.json())
        .select()
        .single();

      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true, workflow: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Workflow engine error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
