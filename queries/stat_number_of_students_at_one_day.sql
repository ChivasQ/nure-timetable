SELECT 
    s.schedule_date AS Дата,
    SUM(sg_grp.student_count) AS Всього_студентів
FROM schedule s
JOIN schedulegroups sg ON s.id = sg.schedule_id
JOIN studentgroups sg_grp ON sg.group_id = sg_grp.id
GROUP BY s.schedule_date
ORDER BY s.schedule_date;