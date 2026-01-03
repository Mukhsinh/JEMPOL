-- Game Scores Table
CREATE TABLE IF NOT EXISTS public.game_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_name TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    mode TEXT NOT NULL, -- 'single' or 'multiplayer'
    level INTEGER DEFAULT 1,
    duration INTEGER DEFAULT 0, -- in seconds
    device_type TEXT DEFAULT 'desktop',
    played_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Game scores viewable by everyone" ON public.game_scores
    FOR SELECT USING (true);

CREATE POLICY "Game scores insertable by everyone" ON public.game_scores
    FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX idx_game_scores_score ON public.game_scores(score DESC);
CREATE INDEX idx_game_scores_mode ON public.game_scores(mode);
