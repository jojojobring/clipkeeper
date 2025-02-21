
select
  cron.schedule(
    'sync-sales-data-daily',
    '0 0 * * *',  -- Run at midnight every day
    $$
    select
      net.http_post(
        url:='https://vhpumxssrhitkezmrywp.supabase.co/functions/v1/sync-sales-data',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocHVteHNzcmhpdGtlem1yeXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NDkyMDAsImV4cCI6MjA1MzIyNTIwMH0.AXnNrqigLFNBnaVfQk72ajA2GQrjhC7eG8v_b3wJJXQ"}'::jsonb
      ) as request_id;
    $$
  );
