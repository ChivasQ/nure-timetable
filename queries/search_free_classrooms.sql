--+PARAMS: min_capacity date slot_id
SELECT * FROM classrooms c
WHERE (c.capacity >= ? OR c.capacity = -1) AND 
    -- Перевірка зайнятості
    (
        c.capacity = -1 -- Якщо безлімітна то вона завжди вільна
        OR 
        c.id NOT IN ( -- Якщо звичайна то перевіряємо, чи немає її в розкладі
            SELECT s.classroom_id 
            FROM schedule s
            WHERE s.schedule_date = ? 
            AND s.time_slot_id = ?
        )
    )
ORDER BY c.capacity ASC;