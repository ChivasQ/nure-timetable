const sqlManager = require('../utils/SqlManager');

function formatDate(dateInput) {
    const d = new Date(dateInput);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const getAdminMainPage = async (req, res) => {
    try {
        let queryDate = req.query.date ? new Date(req.query.date) : new Date();
        if (isNaN(queryDate.getTime())) queryDate = new Date();
        queryDate.setHours(12, 0, 0, 0);

        const selectedGroupId = req.query.group_id || 1; 

        const today = new Date(queryDate);
        const dayOfWeek = today.getDay();
        const diffToMon = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const monday = new Date(today);
        monday.setDate(diffToMon);

        const weekDates = [];
        const dateDiff = 100;
        for (let i = 0; i < dateDiff; i++) { 
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            weekDates.push(formatDate(d));
        }

        const groupsList = await sqlManager.run('get_groups');
        const timeSlots = await sqlManager.run('get_timeslots');

        const subjects = await sqlManager.run('get_subjects');
        const teachers = await sqlManager.run('get_teachers');
        const classrooms = await sqlManager.run('get_classrooms');
        const lessonTypes = await sqlManager.run('get_lessontypes');

        const [maxDateData] = await sqlManager.run('get_max_date');
        
        const scheduleData = await sqlManager.run('get_schedule', {
            start_date: monday,
            end_date: maxDateData.max_date || new Date(),
            group_id: selectedGroupId 
        });

        const scheduleMap = {};
        scheduleData.forEach(row => {
            const dateKey = formatDate(row.schedule_date);
            if (!scheduleMap[dateKey]) scheduleMap[dateKey] = {};
            scheduleMap[dateKey][row.time_slot_id] = row;
        });

        res.render("admin-main", { 
            weekDates, timeSlots, scheduleMap, groupsList,
            subjects, teachers, classrooms, lessonTypes,
            selectedGroup: selectedGroupId,
            selectedDate: formatDate(queryDate)
        });

    } catch (e) {
        console.error("Controller error:", e);
        res.send("Error: " + e.message);
    }
};

const addLesson = async (req, res) => {
try {
        const { groups, ...scheduleData } = req.body;

        if (!groups || groups.length === 0) {
            throw new Error('Не обрано жодної групи');
        }

        const result = await sqlManager.run('add_schedule', scheduleData);

        const newScheduleId = result.insertId; 

        if (!newScheduleId) {
            throw new Error('Не вдалося створити заняття (немає ID)');
        }

        const groupPromises = groups.map(groupId => {
            return sqlManager.run('link_schedule_group', {
                schedule_id: newScheduleId,
                group_id: groupId
            });
        });

        await Promise.all(groupPromises);

        res.json({ success: true });

    } catch (err) {
        console.error('Add Schedule Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteLesson = async (req, res) => {
    try {
        const { id } = req.body;
        
        await sqlManager.run('delete_schedule', { id });

        res.json({ success: true });
    } catch (e) {
        console.error("Delete Error:", e);
        res.status(500).json({ success: false, message: e.message });
    }
};

module.exports = {
    getAdminMainPage,
    addLesson,
    deleteLesson
};