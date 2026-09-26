# Project Architecture Rules

- Keep Results diagnosis presentation in focused components under `src/components/results`; this preserves hook ordering in the route and keeps KPI history visualization reusable.
- Keep Action Plan KPI-link presentation in focused components under `src/components/action-plan`; this preserves all action workflow and Kanban behavior while sharing timeline visuals.