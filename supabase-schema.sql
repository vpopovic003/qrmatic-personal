-- QR Codes table
CREATE TABLE qrcodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('static', 'dynamic')),
  short_code TEXT UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Scan logs table
CREATE TABLE scan_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  qrcode_id UUID REFERENCES qrcodes(id) ON DELETE CASCADE,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE qrcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for qrcodes table
CREATE POLICY "Users can view their own QR codes" ON qrcodes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own QR codes" ON qrcodes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own QR codes" ON qrcodes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own QR codes" ON qrcodes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for scan_logs table
CREATE POLICY "Users can view scan logs for their QR codes" ON scan_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM qrcodes
    WHERE qrcodes.id = scan_logs.qrcode_id
    AND qrcodes.user_id = auth.uid()
  )
);

-- Allow public insert for scan logs (for tracking scans)
CREATE POLICY "Allow public scan logging" ON scan_logs FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_qrcodes_user_id ON qrcodes(user_id);
CREATE INDEX idx_qrcodes_short_code ON qrcodes(short_code);
CREATE INDEX idx_scan_logs_qrcode_id ON scan_logs(qrcode_id);
CREATE INDEX idx_scan_logs_scanned_at ON scan_logs(scanned_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_qrcodes_updated_at BEFORE UPDATE ON qrcodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();