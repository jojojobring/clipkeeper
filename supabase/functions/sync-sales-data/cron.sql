select
  cron.schedule(
    'sync-sales-data-daily',
    '0 0 * * *',  -- Run at midnight every day
    $$
    select
      net.http_post(
        url:='https://vhpumxssrhitkezmrywp.supabase.co/functions/v1/sync-sales-data',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
      ) as request_id;
    $$
  );