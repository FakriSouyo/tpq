-- Update existing bucket to be public
update storage.buckets
set public = true
where id = 'documents';

-- Drop existing policies if they exist
drop policy if exists "Allow authenticated users to upload files" on storage.objects;
drop policy if exists "Allow authenticated users to read files" on storage.objects;
drop policy if exists "Allow public to read files" on storage.objects;
drop policy if exists "Allow authenticated users to update their own files" on storage.objects;
drop policy if exists "Allow authenticated users to delete their own files" on storage.objects;
drop policy if exists "Allow public to upload files" on storage.objects;
drop policy if exists "Allow admin to manage files" on storage.objects;

-- Allow anyone to upload files (since this is a public registration form)
create policy "Allow public to upload files"
on storage.objects for insert
to public
with check (bucket_id = 'documents');

-- Allow anyone to read files
create policy "Allow public to read files"
on storage.objects for select
to public
using (bucket_id = 'documents');

-- Allow admin to manage files
create policy "Allow admin to manage files"
on storage.objects for all
to authenticated
using (bucket_id = 'documents' AND auth.role() = 'authenticated')
with check (bucket_id = 'documents' AND auth.role() = 'authenticated'); 