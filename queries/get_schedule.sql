--+PARAMS: start_date end_date group_id 
SELECT 
	s.id,
	s.schedule_date,
	s.time_slot_id,
	sub.short_name as subject,
	t.short_name as teacher,
	c.room_number,
	lt.short_name as type,
	g.name as group_name
FROM Schedule s
JOIN Subjects sub ON s.subject_id = sub.id
JOIN Teachers t ON s.teacher_id = t.id
JOIN Classrooms c ON s.classroom_id = c.id
JOIN LessonTypes lt ON s.lesson_type_id = lt.id
JOIN ScheduleGroups sg ON s.id = sg.schedule_id
JOIN StudentGroups g ON sg.group_id = g.id
WHERE s.schedule_date BETWEEN ? - 1 AND ? 
AND g.id = ?