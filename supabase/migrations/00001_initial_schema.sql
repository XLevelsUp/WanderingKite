-- ============================================================================
-- Rental Management System - Complete Database Schema
-- ============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- User roles for RBAC
create type user_role as enum ('SUPER_ADMIN', 'ADMIN', 'STAFF');

-- Equipment availability and condition status
create type equipment_status as enum ('AVAILABLE', 'RENTED', 'MAINTENANCE', 'LOST');

-- Rental lifecycle status
create type rental_status as enum ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'OVERDUE');

-- ============================================================================
-- TABLES
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Branches Table
-- Supports multi-branch operations
-- -----------------------------------------------------------------------------
create table if not exists public.branches (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  location text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- -----------------------------------------------------------------------------
-- User Profiles Table
-- Extends Supabase auth.users with application-specific profile data
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  role user_role default 'STAFF' not null,
  branch_id uuid references public.branches(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- -----------------------------------------------------------------------------
-- Categories Table
-- Equipment categorization (e.g., Cameras, Lenses, Lighting)
-- -----------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  description text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- -----------------------------------------------------------------------------
-- Equipment Table
-- Core inventory management with serial number tracking
-- -----------------------------------------------------------------------------
create table if not exists public.equipment (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  serial_number text unique not null,
  category_id uuid references public.categories(id) on delete set null,
  branch_id uuid references public.branches(id) on delete set null,
  status equipment_status default 'AVAILABLE' not null,
  rental_price decimal(10, 2) not null check (rental_price >= 0),
  description text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Create index for faster status queries
create index if not exists idx_equipment_status on public.equipment(status);
create index if not exists idx_equipment_branch on public.equipment(branch_id);

-- -----------------------------------------------------------------------------
-- Clients Table
-- Customer information with government ID for verification
-- -----------------------------------------------------------------------------
create table if not exists public.clients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text unique not null,
  phone text,
  address text,
  govt_id text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Create index for client search
create index if not exists idx_clients_email on public.clients(email);

-- -----------------------------------------------------------------------------
-- Rentals Table
-- Rental transactions with dates and status tracking
-- -----------------------------------------------------------------------------
create table if not exists public.rentals (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.clients(id) on delete restrict not null,
  staff_id uuid references auth.users(id) on delete set null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  actual_return_date timestamptz,
  status rental_status default 'PENDING' not null,
  total_amount decimal(10, 2) not null check (total_amount >= 0),
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- Ensure end date is after start date
  constraint valid_rental_dates check (end_date > start_date)
);

-- Create indexes for rental queries
create index if not exists idx_rentals_status on public.rentals(status);
create index if not exists idx_rentals_client on public.rentals(client_id);
create index if not exists idx_rentals_dates on public.rentals(start_date, end_date);

-- -----------------------------------------------------------------------------
-- Rental Items Table
-- Line items for each rental - tracks which equipment was rented
-- -----------------------------------------------------------------------------
create table if not exists public.rental_items (
  id uuid default gen_random_uuid() primary key,
  rental_id uuid references public.rentals(id) on delete cascade not null,
  equipment_id uuid references public.equipment(id) on delete restrict not null,
  price decimal(10, 2) not null check (price >= 0), -- Snapshot of price at rental time
  created_at timestamptz default now() not null
);

-- Create index for rental item queries
create index if not exists idx_rental_items_rental on public.rental_items(rental_id);
create index if not exists idx_rental_items_equipment on public.rental_items(equipment_id);

-- -----------------------------------------------------------------------------
-- Audit Logs Table
-- Comprehensive audit trail for all critical operations
-- -----------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  action text not null, -- e.g., 'CREATE_RENTAL', 'UPDATE_EQUIPMENT', 'DELETE_CLIENT'
  table_name text not null,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz default now() not null
);

-- Create indexes for audit log queries
create index if not exists idx_audit_logs_user on public.audit_logs(user_id);
create index if not exists idx_audit_logs_table on public.audit_logs(table_name);
create index if not exists idx_audit_logs_created on public.audit_logs(created_at);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Updated At Trigger Function
-- Automatically updates the updated_at timestamp
-- -----------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to relevant tables
create trigger set_updated_at before update on public.branches
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.categories
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.equipment
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.clients
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.rentals
  for each row execute function public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- Profile Creation Trigger
-- Automatically creates a profile when a new user signs up
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'STAFF');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
alter table public.branches enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.equipment enable row level security;
alter table public.clients enable row level security;
alter table public.rentals enable row level security;
alter table public.rental_items enable row level security;
alter table public.audit_logs enable row level security;

-- -----------------------------------------------------------------------------
-- Helper function to get current user's role
-- -----------------------------------------------------------------------------
create or replace function public.get_user_role(user_id uuid)
returns user_role as $$
  select role from public.profiles where id = user_id;
$$ language sql security definer;

-- -----------------------------------------------------------------------------
-- Profiles Policies
-- -----------------------------------------------------------------------------
-- Users can read all profiles
create policy "Users can view all profiles"
  on public.profiles for select
  using (auth.uid() is not null);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Only SUPER_ADMIN can insert/delete profiles
create policy "Only SUPER_ADMIN can insert profiles"
  on public.profiles for insert
  with check (public.get_user_role(auth.uid()) = 'SUPER_ADMIN');

create policy "Only SUPER_ADMIN can delete profiles"
  on public.profiles for delete
  using (public.get_user_role(auth.uid()) = 'SUPER_ADMIN');

-- -----------------------------------------------------------------------------
-- Equipment Policies
-- -----------------------------------------------------------------------------
-- All authenticated users can view equipment
create policy "Authenticated users can view equipment"
  on public.equipment for select
  using (auth.uid() is not null);

-- ADMIN and SUPER_ADMIN can manage equipment
create policy "ADMIN can manage equipment"
  on public.equipment for all
  using (public.get_user_role(auth.uid()) in ('ADMIN', 'SUPER_ADMIN'));

-- -----------------------------------------------------------------------------
-- Clients Policies
-- -----------------------------------------------------------------------------
-- All authenticated users can view clients
create policy "Authenticated users can view clients"
  on public.clients for select
  using (auth.uid() is not null);

-- All staff can create/update clients
create policy "Staff can manage clients"
  on public.clients for all
  using (auth.uid() is not null);

-- -----------------------------------------------------------------------------
-- Rentals Policies
-- -----------------------------------------------------------------------------
-- All authenticated users can view rentals
create policy "Authenticated users can view rentals"
  on public.rentals for select
  using (auth.uid() is not null);

-- All staff can create/update rentals
create policy "Staff can manage rentals"
  on public.rentals for all
  using (auth.uid() is not null);

-- -----------------------------------------------------------------------------
-- Rental Items Policies
-- -----------------------------------------------------------------------------
-- All authenticated users can view rental items
create policy "Authenticated users can view rental items"
  on public.rental_items for select
  using (auth.uid() is not null);

-- All staff can manage rental items
create policy "Staff can manage rental items"
  on public.rental_items for all
  using (auth.uid() is not null);

-- -----------------------------------------------------------------------------
-- Branches Policies
-- -----------------------------------------------------------------------------
-- All authenticated users can view branches
create policy "Authenticated users can view branches"
  on public.branches for select
  using (auth.uid() is not null);

-- Only ADMIN and SUPER_ADMIN can manage branches
create policy "ADMIN can manage branches"
  on public.branches for all
  using (public.get_user_role(auth.uid()) in ('ADMIN', 'SUPER_ADMIN'));

-- -----------------------------------------------------------------------------
-- Categories Policies
-- -----------------------------------------------------------------------------
-- All authenticated users can view categories
create policy "Authenticated users can view categories"
  on public.categories for select
  using (auth.uid() is not null);

-- Only ADMIN and SUPER_ADMIN can manage categories
create policy "ADMIN can manage categories"
  on public.categories for all
  using (public.get_user_role(auth.uid()) in ('ADMIN', 'SUPER_ADMIN'));

-- -----------------------------------------------------------------------------
-- Audit Logs Policies
-- -----------------------------------------------------------------------------
-- Only SUPER_ADMIN can view audit logs
create policy "Only SUPER_ADMIN can view audit logs"
  on public.audit_logs for select
  using (public.get_user_role(auth.uid()) = 'SUPER_ADMIN');

-- All authenticated users can insert audit logs (system-generated)
create policy "Authenticated users can create audit logs"
  on public.audit_logs for insert
  with check (auth.uid() is not null);

-- ============================================================================
-- SEED DATA (Optional - for development/testing)
-- ============================================================================

-- Insert default branch
insert into public.branches (name, location)
values ('Main Studio', 'Downtown Location')
on conflict do nothing;

-- Insert default categories
insert into public.categories (name, description)
values 
  ('Cameras', 'Digital cameras and DSLRs'),
  ('Lenses', 'Camera lenses and accessories'),
  ('Lighting', 'Studio lighting equipment'),
  ('Audio', 'Microphones and audio recording'),
  ('Accessories', 'Tripods, bags, and other accessories')
on conflict do nothing;
