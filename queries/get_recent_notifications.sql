--+PARAMS: group_id
SELECT * FROM notifications 
WHERE group_id = ? 
AND created_at >= NOW() - INTERVAL 3 DAY
ORDER BY created_at DESC;