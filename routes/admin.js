const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/', adminController.getAdminMainPage);

router.post('/add', express.json(), adminController.addLesson);
router.post('/delete', express.json(), adminController.deleteLesson);

module.exports = router;