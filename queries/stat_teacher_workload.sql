SELECT 
    t.short_name AS label, 
    COUNT(s.id) AS value
FROM teachers t
LEFT JOIN schedule s ON t.id = s.teacher_id
GROUP BY t.id, t.short_name
ORDER BY value DESC
LIMIT 10;