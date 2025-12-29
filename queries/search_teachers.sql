--+PARAMS: search_query
SELECT * FROM teachers 
WHERE full_name LIKE CONCAT('%', ?, '%') 
ORDER BY full_name ASC;