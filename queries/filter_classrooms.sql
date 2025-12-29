--+PARAMS: min_cap max_cap building building
SELECT * FROM classrooms 
WHERE capacity >= ? 
AND capacity <= ?
AND (? = '' OR building = ?)
ORDER BY room_number;