const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const sqlManager = require('../utils/SqlManager');


router.get('/', adminController.getAdminMainPage);

router.post('/add', express.json(), adminController.addLesson);
router.post('/delete', express.json(), adminController.deleteLesson);

router.get('/lesson/:id', adminController.getLessonById);

router.post('/edit', adminController.editLesson);

router.get('/stats', async (req, res) => {
    try {
        const [teachers, types, classrooms, activity] = await Promise.all([
            sqlManager.run('stat_teacher_workload'),
            sqlManager.run('stat_distribution_of_pairs_by_type'),
            sqlManager.run('stat_classroom_occupancy'),
            sqlManager.run('stat_daily_activity')
        ]);
        console.log(activity);
        res.render('stats', { 
            stats: { teachers, types, classrooms, activity } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Помилка отримання статистики');
    }
});

router.get('/report', async (req, res) => {
    try {
        // Завантажуємо список кафедр для випадаючого списку
        const departments = await sqlManager.run('get_departments');

        let reportData = null;
        const { department_id, start_date, end_date } = req.query;

        // Якщо користувач натиснув "Сформувати"
        if (department_id && start_date && end_date) {
            reportData = await sqlManager.run('report_department', {
                department_id, 
                start_date, 
                end_date
            });
        }

        res.render('report', { 
            departments, 
            reportData, 
            query: req.query 
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Помилка формування звіту');
    }
});


router.get('/teacher-schedule', adminController.getTeacherSchedulePage);

module.exports = router;