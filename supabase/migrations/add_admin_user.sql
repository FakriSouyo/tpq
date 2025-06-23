-- Add existing user as admin
insert into admin_users (user_id)
values ('894b6501-0a84-46cc-a3af-8ee4ab1357f2');

-- Optionally, modify the trigger to include your email
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Add your email to the condition
  if new.email like '%@admin.com' OR new.email = 'fakritrk@gmail.com' then
    insert into public.admin_users (user_id)
    values (new.id);
  end if;
  return new;
end;
$$ language plpgsql security definer; 