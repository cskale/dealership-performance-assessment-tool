-- Resume the monthly KPI check-in reminder cron job (previously paused).
SELECT cron.alter_job(job_id := (SELECT jobid FROM cron.job WHERE jobname = 'kpi-checkin-reminder'), active := true);
