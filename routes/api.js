const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const sqlManager = require('../utils/SqlManager');


router.get('/free-classrooms', async (req, res) => {
    try {
        const { date, slot_id, capacity } = req.query;
        console.log(req.body);

        const rooms = await sqlManager.run('search_free_classrooms', {
            date: date,
            slot_id: slot_id,
            min_capacity: capacity || 0 
        });

        res.json({ success: true, rooms });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/check-rooms', async (req, res) => {
    try {
        const { date, slot_id } = req.query;

        const rooms = await sqlManager.run('get_rooms_status', {
            date: date,
            slot_id: slot_id
        });

        res.json({ success: true, rooms });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});


module.exports = router;