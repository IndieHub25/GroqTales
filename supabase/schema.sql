-- Initial Database Setup for GroqTales Supabase Migration

-- This assumes you have Supabase Auth enabled.
-- All users created through NextAuth will need to be re-created in auth.users, or you can use Supabase's migration tools to import them.

create table public.stories (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    content text not null,
    creator_wallet_address text,
    created_by uuid references auth.users(id),
    likes_count integer default 0,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    is_published boolean default false,
    ipfs_hash text,
    story_type text,
    cover_image text,
    tags text[]
);

create table public.mint_intents (
    id uuid default gen_random_uuid() primary key,
    story_id uuid references public.stories(id),
    user_id uuid references auth.users(id),
    wallet_address text not null,
    status text default 'pending',
    created_at timestamp with time zone default now(),
    tx_hash text
);

create table public.creator_earnings (
    id uuid default gen_random_uuid() primary key,
    creator_id uuid references auth.users(id),
    wallet_address text not null,
    total_earned decimal default 0,
    available_to_claim decimal default 0,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create table public.royalty_configs (
    id uuid default gen_random_uuid() primary key,
    story_id uuid references public.stories(id),
    creator_percentage decimal not null,
    platform_percentage decimal not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create table public.user_interactions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id),
    story_id uuid references public.stories(id),
    interaction_type text not null, -- 'like', 'view', 'read'
    created_at timestamp with time zone default now()
);

create table public.royalty_transactions (
    id uuid default gen_random_uuid() primary key,
    story_id uuid references public.stories(id),
    amount decimal not null,
    currency text default 'MON',
    type text not null, -- 'mint', 'tip', 'secondary_sale'
    status text default 'pending',
    tx_hash text,
    created_at timestamp with time zone default now()
);

-- RLS Policies
alter table public.stories enable row level security;
alter table public.mint_intents enable row level security;
alter table public.creator_earnings enable row level security;
alter table public.royalty_configs enable row level security;
alter table public.user_interactions enable row level security;
alter table public.royalty_transactions enable row level security;

-- Story Policies
create policy "Stories are viewable by everyone." on public.stories for select using (true);
create policy "Users can insert their own stories." on public.stories for insert with check (auth.uid() = created_by);
create policy "Users can update their own stories." on public.stories for update using (auth.uid() = created_by);
create policy "Users can delete their own stories." on public.stories for delete using (auth.uid() = created_by);

-- Enable realtime for stories
alter publication supabase_realtime add table public.stories;
