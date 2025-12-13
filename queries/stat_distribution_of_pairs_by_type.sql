SELECT 
    lt.type_name AS label, 
    COUNT(DISTINCT s.id) AS value
FROM lessontypes lt
LEFT JOIN schedule s ON lt.id = s.lesson_type_id
GROUP BY lt.id, lt.type_name;