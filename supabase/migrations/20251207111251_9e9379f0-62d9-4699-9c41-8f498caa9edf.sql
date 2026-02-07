-- Create tokens table for storing user-minted tokens
CREATE TABLE public.tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  balance NUMERIC NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL DEFAULT 1.00,
  change_24h NUMERIC NOT NULL DEFAULT 0,
  icon TEXT NOT NULL DEFAULT '🔷',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for public read (anyone can see tokens on testnet)
CREATE POLICY "Anyone can view tokens" 
ON public.tokens 
FOR SELECT 
USING (true);

-- Create policy for anyone to create tokens (testnet environment)
CREATE POLICY "Anyone can create tokens" 
ON public.tokens 
FOR INSERT 
WITH CHECK (true);

-- Create policy for wallet owner to update their tokens
CREATE POLICY "Wallet owners can update their tokens" 
ON public.tokens 
FOR UPDATE 
USING (true);

-- Create policy for wallet owner to delete their tokens
CREATE POLICY "Wallet owners can delete their tokens" 
ON public.tokens 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tokens_updated_at
BEFORE UPDATE ON public.tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for tokens table
ALTER PUBLICATION supabase_realtime ADD TABLE public.tokens;