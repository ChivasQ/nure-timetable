--+PARAMS: date slot_id min_capacity
SELECT * FROM classrooms c
WHERE c.capacity >= ? 
AND c.id NOT IN (
    -- Виключаємо аудиторії, які зайняті в цей час
    SELECT s.classroom_id 
    FROM schedule s
    WHERE s.schedule_date = ? 
    AND s.time_slot_id = ?
);