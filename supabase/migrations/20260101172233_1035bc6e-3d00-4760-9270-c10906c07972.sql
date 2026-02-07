-- Add contract_address column to tokens table for on-chain token tracking
ALTER TABLE public.tokens ADD COLUMN contract_address TEXT;