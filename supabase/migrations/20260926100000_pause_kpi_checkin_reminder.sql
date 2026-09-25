-- Paused until the check-in UI ships (Task 10 re-enables: UPDATE cron.job SET active = true WHERE jobname = 'kpi-checkin-reminder').
-- Direct UPDATE on cron.job is not permitted for this role, so cron.alter_job() is used instead.
SELECT cron.alter_job(job_id := (SELECT jobid FROM cron.job WHERE jobname = 'kpi-checkin-reminder'), active := false);
