--+PARAMS: date time_slot_id teacher_id subject_id classroom_id lesson_type_id
INSERT INTO Schedule (schedule_date, time_slot_id, teacher_id, subject_id, classroom_id, lesson_type_id) 
VALUES (?, ?, ?, ?, ?, ?);
