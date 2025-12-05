const { executeQuery } = require('../connection');
function formatDate(dateInput) {
    const d = new Date(dateInput);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const getMainPage = async (req, res) => {
    try {
        //Хардкод дати для тесту
        const today = new Date("2025-09-01T12:00:00");
        const dayOfWeek = today.getDay(); // 0 (Вс) - 6 (Сб)
        const diffToMon = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        
        const monday = new Date(today);
        monday.setDate(diffToMon);

        const weekDates = [];
        
        for (let i = 0; i < 100; i++) { //токи так
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            weekDates.push(formatDate(d));
        }

        console.log("Даты недели:", weekDates);

        const timeSlots = await executeQuery("SELECT * FROM TimeSlots ORDER BY pair_number");

        const sql = `
            SELECT 
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
            WHERE s.schedule_date >= '${weekDates[0]}'
            AND g.name = 'КН-23-1'
        `; //поки що так
        
        const scheduleData = await executeQuery(sql);
        console.log("Найдено занятий:", scheduleData.length);

        //Маппінг даних
        const scheduleMap = {};
        
        scheduleData.forEach(row => {
            const dateKey = formatDate(row.schedule_date);
            
            console.log(`${dateKey} ${row.time_slot_id}`);

            if (!scheduleMap[dateKey]) {
                scheduleMap[dateKey] = {};
            }
            scheduleMap[dateKey][row.time_slot_id] = row;
        });

        res.render("main", { 
            weekDates, 
            timeSlots, 
            scheduleMap
        });

    } catch (e) {
        console.error("Помилка контроллера:", e);
        res.send("Помилка: " + e.message);
    }
};

module.exports = {
    getMainPage,
};