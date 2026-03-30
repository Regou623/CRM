-- Run this in your Supabase SQL Editor

-- Create a table for customers
create table if not exists customers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  company text,
  email text,
  phone text,
  status text default 'Lead',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) for customers
alter table customers enable row level security;

-- Drop existing policies if they exist to prevent errors on re-runs
drop policy if exists "Users can view their own customers." on customers;
drop policy if exists "Users can insert their own customers." on customers;
drop policy if exists "Users can update their own customers." on customers;
drop policy if exists "Users can delete their own customers." on customers;

-- Create policies for customers
create policy "Users can view their own customers."
  on customers for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own customers."
  on customers for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own customers."
  on customers for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own customers."
  on customers for delete
  using ( auth.uid() = user_id );


-- Create a table for customer journeys (visits/interactions)
create table if not exists journeys (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references customers on delete cascade not null,
  user_id uuid references auth.users not null,
  date timestamp with time zone not null,
  type text not null, -- e.g., 'Meeting', 'Call', 'Email'
  notes text,
  next_step text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) for journeys
alter table journeys enable row level security;

-- Drop existing policies if they exist to prevent errors on re-runs
drop policy if exists "Users can view their own journeys." on journeys;
drop policy if exists "Users can insert their own journeys." on journeys;
drop policy if exists "Users can update their own journeys." on journeys;
drop policy if exists "Users can delete their own journeys." on journeys;

-- Create policies for journeys
create policy "Users can view their own journeys."
  on journeys for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own journeys."
  on journeys for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own journeys."
  on journeys for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own journeys."
  on journeys for delete
  using ( auth.uid() = user_id );
