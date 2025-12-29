--+PARAMS: dept_id
SELECT 
    t.full_name,
    COUNT(s.id) as total,
    SUM(CASE WHEN lt.short_name = 'Лк' THEN 1 ELSE 0 END) as lecs,
    SUM(CASE WHEN lt.short_name = 'Пз' THEN 1 ELSE 0 END) as pracs,
    SUM(CASE WHEN lt.short_name = 'Лб' THEN 1 ELSE 0 END) as labs
FROM teachers t
LEFT JOIN schedule s ON t.id = s.teacher_id
LEFT JOIN lessontypes lt ON s.lesson_type_id = lt.id
WHERE t.department_id = ?
GROUP BY t.id, t.full_name
ORDER BY total DESC;