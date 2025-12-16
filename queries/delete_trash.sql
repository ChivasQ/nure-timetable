DELETE s
FROM schedule s
LEFT JOIN schedulegroups sg ON s.id = sg.schedule_id
WHERE sg.schedule_id IS NULL;