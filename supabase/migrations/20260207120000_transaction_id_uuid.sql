-- Change transactions.transaction_id from bigint to uuid.
-- New rows get gen_random_uuid(); existing rows get a new uuid.

ALTER TABLE public.transactions
  ADD COLUMN transaction_id_new uuid NOT NULL DEFAULT gen_random_uuid();

ALTER TABLE public.transactions
  DROP CONSTRAINT transactions_pkey;

ALTER TABLE public.transactions
  DROP COLUMN transaction_id;

ALTER TABLE public.transactions
  RENAME COLUMN transaction_id_new TO transaction_id;

ALTER TABLE public.transactions
  ADD PRIMARY KEY (transaction_id);

-- Allow authenticated users to insert, update, and delete their own transactions.
-- (SELECT already allowed by "Enable read access for all users" in remote_schema.)

create policy "Users can insert own transactions"
  on public.transactions
  as permissive
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions
  as permissive
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions
  as permissive
  for delete
  to authenticated
  using (auth.uid() = user_id);
