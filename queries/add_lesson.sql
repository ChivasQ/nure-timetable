INSERT INTO Schedule (schedule_date, time_slot_id, teacher_id, subject_id, classroom_id, lesson_type_id) 
VALUES ('2025-09-01', 2, 1, 1, 1, 1);

SET @last_schedule_id = LAST_INSERT_ID();
INSERT INTO ScheduleGroups (schedule_id, group_id) VALUES 
(@last_schedule_id, 1), -- КН-23-1
(@last_schedule_id, 2); -- КН-23-2