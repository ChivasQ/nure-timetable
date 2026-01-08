const sqlManager = require('../utils/SqlManager');
const bcrypt = require('bcrypt');

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

const getLessonById = async (req, res) => {
        try {
        const lessonId = req.params.id;
        
        // Отримуємо інфо про пару
        const [lesson] = await sqlManager.run('get_schedule_by_id', { id: lessonId });
        
        // Отримуємо список груп цієї пари
        const groupsResult = await sqlManager.run('get_schedule_groups', { schedule_id: lessonId });
        const groupIds = groupsResult.map(row => row.group_id);

        res.json({ success: true, lesson, groupIds });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}


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
        console.log('scheduleData:', scheduleData);
        const msg = `📅 Зміни в розкладі! Додано пару на ${scheduleData.date}. Перевірте розклад.`;
        
        // Для кожної групи, яку торкнулася зміна, створюємо запис
        const notifyPromises = groups.map(groupId => {
            return sqlManager.run('add_notification', {
                group_id: groupId,
                message: msg
            });
        });
        await Promise.all(notifyPromises);

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

const editLesson = async (req, res) => {
    try {
        const { id, groups, ...scheduleData } = req.body;

        if (!groups || groups.length === 0) throw new Error('Не обрано жодної групи');

        // Оновлюємо основну таблицю schedule
        await sqlManager.run('update_schedule', { 
            ...scheduleData, 
            id: id 
        });

        // Видаляємо старі зв'язки
        await sqlManager.run('delete_schedule_groups', { schedule_id: id });

        // Записуємо нові (паралельно)
        const groupPromises = groups.map(groupId => {
            return sqlManager.run('add_schedule_group', {
                schedule_id: id,
                group_id: groupId
            });
        });
        await Promise.all(groupPromises);

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
        await sqlManager.run('delete_trash');
    }
}

const getTeacherSchedulePage = async (req, res) => {
    try {
        let queryDate = req.query.date ? new Date(req.query.date) : new Date();
        if (isNaN(queryDate.getTime())) queryDate = new Date();
        queryDate.setHours(12, 0, 0, 0);

        const today = new Date(queryDate);
        const dayOfWeek = today.getDay();
        
        const diffToMon = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const monday = new Date(today);
        monday.setDate(diffToMon);

        const weekDates = [];
        const dateDiff = 7; 
        
        for (let i = 0; i < dateDiff; i++) { 
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            weekDates.push(formatDate(d));
        }

        const teachers = await sqlManager.run('get_teachers');
        const timeSlots = await sqlManager.run('get_timeslots');

        let scheduleMap = {};
        const selectedTeacherId = req.query.teacher_id;

        if (selectedTeacherId) {
            const startDate = weekDates[0];
            const endDate = weekDates[weekDates.length - 1];

            const lessons = await sqlManager.run('get_teacher_schedule', {
                teacher_id: selectedTeacherId,
                start_date: startDate,
                end_date: endDate
            });

            lessons.forEach(row => {
                const dateKey = formatDate(row.schedule_date);
                if (!scheduleMap[dateKey]) scheduleMap[dateKey] = {};
                
                scheduleMap[dateKey][row.time_slot_id] = row;
            });
        }

        res.render("teacher_schedule", { 
            weekDates,
            timeSlots,
            scheduleMap,
            teachers,
            
            query: { 
                teacher_id: selectedTeacherId,
                date: formatDate(queryDate) 
            }
        });

    } catch (e) {
        console.error("Controller error:", e);
        res.send("Error: " + e.message);
    }
};

const getAddUserPage = (req, res) => {
    res.render('admin-register', { 
        error: null,
        user: req.session.user
    });
};

const addUser = async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        // Хешуємо пароль
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await sqlManager.run('auth_register', {
            username,
            email,
            password_hash: hashedPassword
        });

        res.redirect('/admin'); 
    } catch (err) {
        console.error(err);
        res.render('admin-register', { 
            error: 'Помилка: користувач з таким логіном або поштою вже існує',
            user: req.session.user
        });
    }
};
module.exports = {
    getTeacherSchedulePage,
    getAdminMainPage,
    addLesson,
    deleteLesson,
    getLessonById,
    editLesson,
    getAddUserPage,
    addUser
};