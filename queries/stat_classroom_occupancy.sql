SELECT 
    c.room_number, 
    c.building, 
    COUNT(s.id) AS Всього_пар
FROM classrooms c
JOIN schedule s ON c.id = s.classroom_id
GROUP BY c.id
ORDER BY Всього_пар DESC
LIMIT 5;