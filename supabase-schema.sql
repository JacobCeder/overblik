-- Create the overviews table
CREATE TABLE IF NOT EXISTS overviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the articles table
CREATE TABLE IF NOT EXISTS articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    overview_id UUID NOT NULL REFERENCES overviews(id) ON DELETE CASCADE,
    heading TEXT NOT NULL,
    subheading TEXT NOT NULL,
    media_name TEXT, -- Name/title of the media
    media_url TEXT, -- URL to image/media
    author TEXT NOT NULL,
    body TEXT NOT NULL, -- HTML content from rich text editor
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_overview_id ON articles(overview_id);
CREATE INDEX IF NOT EXISTS idx_articles_order ON articles(overview_id, order_index);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_overviews_updated_at 
    BEFORE UPDATE ON overviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at 
    BEFORE UPDATE ON articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (optional but recommended)
ALTER TABLE overviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed for your authentication requirements)
-- For now, allow all operations (you may want to restrict this later)
CREATE POLICY "Allow all operations on overviews" ON overviews
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on articles" ON articles
    FOR ALL USING (true) WITH CHECK (true);