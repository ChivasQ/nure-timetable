const sqlManager = require('../utils/SqlManager');

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

        const groupsList = await sqlManager.run('get_groups');
        const timeSlots = await sqlManager.run('get_timeslots');
        const [maxDateData] = await sqlManager.run('get_max_date');
        const scheduleData = await sqlManager.run('get_schedule', {
                start_date: monday,
                end_date: maxDateData.max_date,
                group_id: selectedGroupId 
            });

        const dateDiff = 100;
        for (let i = 0; i < dateDiff; i++) { //токи так
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            weekDates.push(formatDate(d));
        }

        console.log("Знайдено занять:", scheduleData.length);

        //Маппінг даних
        const scheduleMap = {};
        
        scheduleData.forEach(row => {
            const dateKey = formatDate(row.schedule_date);

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
        console.error("Controller error:", e);
        res.send("Error: " + e.message);
    }
};

module.exports = {
    getMainPage,
};