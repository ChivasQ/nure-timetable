--+PARAMS: date slot_id
SELECT * FROM studentgroups g
WHERE g.id NOT IN (
    SELECT sg.group_id
    FROM schedulegroups sg
    JOIN schedule s ON sg.schedule_id = s.id
    WHERE s.schedule_date = ? 
    AND s.time_slot_id = ?
)
ORDER BY g.name;