-- Admin whitelist. Add an email to the array and re-run.

insert into public.admin_members (email)
select lower(btrim(e))
from unnest(array[
  'rhythm4538@gmail.com'
]) as e
on conflict (email) do nothing;
