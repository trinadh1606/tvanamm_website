-- Enable realtime for invoices table
ALTER TABLE invoices REPLICA IDENTITY FULL;

-- Add invoices to the realtime publication (only if not already added)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'invoices'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE invoices;
    END IF;
END $$;