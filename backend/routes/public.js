const express = require('express');
const router = express.Router();
const { Event } = require('../models');

// Получение списка мероприятий (публичный маршрут)
router.get('/events', async (req, res) => {
    try {
        const events = await Event.findAll();
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении списка мероприятий', error: error.message });
    }
});

module.exports = router; 