--+PARAMS: department_id start_date end_date
SELECT 
    s.schedule_date,
    ts.start_time,
    ts.end_time,
    t.short_name AS teacher_name,
    sub.short_name AS subject_name,
    lt.short_name AS type_name,
    c.room_number,
    -- Отримуємо список груп через GROUP_CONCAT, щоб не дублювати рядки
    (
        SELECT GROUP_CONCAT(g.name SEPARATOR ', ')
        FROM schedulegroups sg
        JOIN studentgroups g ON sg.group_id = g.id
        WHERE sg.schedule_id = s.id
    ) AS groups_list
FROM schedule s
JOIN teachers t ON s.teacher_id = t.id
JOIN subjects sub ON s.subject_id = sub.id
JOIN lessontypes lt ON s.lesson_type_id = lt.id
JOIN timeslots ts ON s.time_slot_id = ts.id
JOIN classrooms c ON s.classroom_id = c.id
WHERE t.department_id = ? 
  AND s.schedule_date BETWEEN ? AND ?
ORDER BY s.schedule_date, ts.start_time;