--+PARAMS: teacher_id start_date end_date
SELECT 
    s.id,
    s.schedule_date,
    s.time_slot_id,
    sub.short_name AS subject,
    lt.short_name AS type,
    c.room_number,
    c.building,
    -- Збираємо групи в один рядок через GROUP_CONCAT
    (
        SELECT GROUP_CONCAT(g.name SEPARATOR ', ')
        FROM schedulegroups sg
        JOIN studentgroups g ON sg.group_id = g.id
        WHERE sg.schedule_id = s.id
    ) AS group_names
FROM schedule s
JOIN subjects sub ON s.subject_id = sub.id
JOIN lessontypes lt ON s.lesson_type_id = lt.id
JOIN classrooms c ON s.classroom_id = c.id
WHERE s.teacher_id = ?
  AND s.schedule_date BETWEEN ? AND ?
ORDER BY s.schedule_date, s.time_slot_id;