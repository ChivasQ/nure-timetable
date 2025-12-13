SELECT CONCAT(c.room_number, ' (', c.building, ')') AS label, COUNT(s.id) AS value
FROM classrooms c
JOIN schedule s ON c.id = s.classroom_id
GROUP BY c.id, c.room_number, c.building
ORDER BY value DESC
LIMIT 10;