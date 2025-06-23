-- Create admin_users table
create table if not exists admin_users (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_id unique (user_id)
);

-- Enable RLS
alter table admin_users enable row level security;

-- Create policy to allow authenticated users to read admin_users
create policy "Allow authenticated users to read admin_users"
  on admin_users
  for select
  to authenticated
  using (true);

-- Create function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Check if email ends with @admin.com (you can modify this condition)
  if new.email like '%@admin.com' then
    insert into public.admin_users (user_id)
    values (new.id);
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 