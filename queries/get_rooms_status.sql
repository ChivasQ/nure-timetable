--+PARAMS: date slot_id
SELECT 
    c.id, 
    c.room_number, 
    c.building, 
    c.capacity,
    -- Якщо є запис у розкладі та це не DL (-1), то 1 (зайнято), інакше 0 (вільно)
    CASE 
        WHEN c.capacity = -1 THEN 0
        WHEN s.id IS NOT NULL THEN 1 
        ELSE 0 
    END AS is_occupied
FROM classrooms c
LEFT JOIN schedule s ON c.id = s.classroom_id 
    AND s.schedule_date = ? 
    AND s.time_slot_id = ?
ORDER BY c.room_number;