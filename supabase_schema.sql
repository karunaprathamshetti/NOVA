-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: profiles
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  email text not null,
  avatar_url text,
  bio text default '',
  stream_key text unique not null default uuid_generate_v4()::text,
  rtmp_url text default 'rtmp://live.cloudflare.com/live/',
  cloudflare_stream_id text,
  cloudflare_playback_url text,
  is_live boolean default false,
  stream_title text default 'My Stream',
  category text default 'Just Chatting',
  viewer_count int default 0,
  follower_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: follows
create table public.follows (
  id uuid primary key default uuid_generate_v4(),
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(follower_id, following_id)
);

-- Table: messages
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  stream_username text not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  username text not null,
  avatar_url text,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: streams
create table public.streams (
  id uuid primary key default uuid_generate_v4(),
  streamer_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  category text not null,
  viewer_peak int default 0,
  duration_minutes int default 0,
  thumbnail_url text,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone
);

-- Row Level Security (RLS)

alter table public.profiles enable row level security;
alter table public.follows enable row level security;
alter table public.messages enable row level security;
alter table public.streams enable row level security;

-- Policies for profiles
create policy "Anyone can read profiles" on public.profiles
  for select using (true);

create policy "Only owner can update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Policies for follows
create policy "Anyone can read follows" on public.follows
  for select using (true);

create policy "Logged in users can insert follows" on public.follows
  for insert with check (auth.uid() = follower_id);

create policy "Logged in users can delete their own follows" on public.follows
  for delete using (auth.uid() = follower_id);

-- Policies for messages
create policy "Anyone can read messages" on public.messages
  for select using (true);

create policy "Logged in users can insert messages" on public.messages
  for insert with check (auth.uid() = user_id);

-- Policies for streams
create policy "Anyone can read streams" on public.streams
  for select using (true);

create policy "Only owner can insert streams" on public.streams
  for insert with check (auth.uid() = streamer_id);

create policy "Only owner can update streams" on public.streams
  for update using (auth.uid() = streamer_id);
