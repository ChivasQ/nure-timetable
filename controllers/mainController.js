const { executeQuery } = require('../connection');
const QueryManager = require('../repository/QueryManager');
const sqlLoader = require('../utils/SqlLoader');

function formatDate(dateInput) {
    const d = new Date(dateInput);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const getMainPage = async (req, res) => {
    try {

        let queryDate = req.query.date ? new Date(req.query.date) : new Date();

        if (isNaN(queryDate.getTime())) queryDate = new Date();

        const selectedGroupId = req.query.group_id || 1; 

        queryDate.setHours(12, 0, 0, 0);

        const today = new Date(queryDate);
        const dayOfWeek = today.getDay();
        const diffToMon = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        
        const monday = new Date(today);
        monday.setDate(diffToMon);

        const weekDates = [];

        const groupsList = await executeQuery("SELECT id, name FROM StudentGroups ORDER BY name");

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
            WHERE s.schedule_date >= '${formatDate(monday.getDate())}'
            AND g.id = ${selectedGroupId}
        `; //поки що так
        const scheduleData = await executeQuery(sql);

        const maxDate = 'SELECT MAX(s.schedule_date) FROM Schedule s'
        const [maxDateData] = await executeQuery(maxDate);
        const dateDiff = 100;
        for (let i = 0; i < dateDiff; i++) { //токи так
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            weekDates.push(formatDate(d));
        }
        console.log("Дати неділі:", weekDates);

        console.log("Знайдено занять:", scheduleData.length);

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
            scheduleMap,
            groupsList,
            selectedGroup: selectedGroupId,
            selectedDate: formatDate(queryDate)
        });

    } catch (e) {
        console.error("Помилка контроллера:", e);
        res.send("Помилка: " + e.message);
    }
};

module.exports = {
    getMainPage,
};