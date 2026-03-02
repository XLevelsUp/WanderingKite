-- Run this in Supabase SQL Editor to fix the Super Admin account

insert into public.profiles (id, email, full_name, role)
select id, email, raw_user_meta_data->>'full_name', 'SUPER_ADMIN'
from auth.users
where email = 'admin@wanderingkite.com'
on conflict (id) do update
set role = 'SUPER_ADMIN';
