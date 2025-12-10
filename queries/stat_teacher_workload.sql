SELECT 
    t.full_name AS Викладач, 
    COUNT(s.id) AS Кількість_пар
FROM teachers t
LEFT JOIN schedule s ON t.id = s.teacher_id
GROUP BY t.id, t.full_name
ORDER BY Кількість_пар DESC;