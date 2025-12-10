const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const sqlManager = require('../utils/SqlManager');


router.get('/', adminController.getAdminMainPage);

router.post('/add', express.json(), adminController.addLesson);
router.post('/delete', express.json(), adminController.deleteLesson);

router.get('/admin/lesson/:id', async (req, res) => {
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
});

router.post('/admin/edit', async (req, res) => {
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
    }
});


module.exports = router;