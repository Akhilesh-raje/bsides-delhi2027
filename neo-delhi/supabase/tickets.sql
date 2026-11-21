-- Run once in the Supabase SQL editor. Matches TicketRecord in src/types/ticket.ts.
create table if not exists public.tickets (
  id uuid primary key,
  ticket_number text not null unique,
  user_id uuid,
  tier_id text not null,
  tier_name text not null,
  attendee_name text not null,
  attendee_email text not null,
  attendee_phone text not null,
  organization text,
  designation text,
  tshirt_size text not null,
  dietary_preference text not null,
  order_id text not null unique, -- one ticket per Razorpay order; the verify route relies on this
  payment_id text not null,
  amount_paid numeric not null,
  currency text not null default 'INR',
  qr_payload text not null,
  qr_data_url text,
  status text not null default 'confirmed',
  checked_in_at timestamptz,
  checked_in_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS on with no policies: only the server (service role key) can read or write attendee data.
alter table public.tickets enable row level security;
