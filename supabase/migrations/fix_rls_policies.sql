-- Drop existing policies if any
drop policy if exists "Enable insert for all users" on pendaftar_santri;
drop policy if exists "Enable select for authenticated users only" on pendaftar_santri;

-- Disable RLS temporarily
alter table pendaftar_santri disable row level security;

-- Create new policies
create policy "Enable insert for anon and authenticated"
on pendaftar_santri
for insert
to anon, authenticated
with check (true);

create policy "Enable select for anon and authenticated"
on pendaftar_santri
for select
to anon, authenticated
using (true);

-- Enable RLS again
alter table pendaftar_santri enable row level security; 