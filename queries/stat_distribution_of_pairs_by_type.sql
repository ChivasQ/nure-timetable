SELECT 
    lt.type_name AS Тип, 
    COUNT(s.id) AS Кількість
FROM lessontypes lt
LEFT JOIN schedule s ON lt.id = s.lesson_type_id
GROUP BY lt.id, lt.type_name;