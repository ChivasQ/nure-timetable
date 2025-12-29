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
        const selectedDeptId = req.query.dept_id;

        const teachers = await sqlManager.run('stat_teacher_workload');
        const types = await sqlManager.run('stat_distribution_of_pairs_by_type');
        const classrooms = await sqlManager.run('stat_classroom_occupancy');
        const activity = await sqlManager.run('stat_daily_activity');

        const departments = await sqlManager.run('get_departments');

        let deptStats = null;
        if (selectedDeptId) {
            deptStats = await sqlManager.run('stat_department_load', { dept_id: selectedDeptId });
        }

        res.render('stats', { 
            stats: { teachers, types, classrooms, activity },
            departments,  
            deptStats,    
            selectedDeptId
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Помилка отримання статистики');
    }
});

router.get('/report', async (req, res) => {
    try {
        const departments = await sqlManager.run('get_departments');

        let reportData = null;
        const { department_id, start_date, end_date } = req.query;

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