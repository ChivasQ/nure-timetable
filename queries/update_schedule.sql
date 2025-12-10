--+PARAMS: teacher_id subject_id classroom_id lesson_type_id id
UPDATE schedule
SET teacher_id = ?, 
subject_id = ?, 
classroom_id = ?, 
lesson_type_id = ?
WHERE id = ?;