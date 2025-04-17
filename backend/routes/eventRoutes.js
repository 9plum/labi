const express = require('express');
const router = express.Router();
const { Event, User } = require('../models');

// Получение всех мероприятий
router.get('/', async (req, res) => {
    try {
        const events = await Event.findAll({
            include: [{
                model: User,
                attributes: ['name', 'email']
            }]
        });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Получение мероприятия по ID
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id, {
            include: [{
                model: User,
                attributes: ['name', 'email']
            }]
        });
        if (!event) {
            return res.status(404).json({ error: 'Мероприятие не найдено' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Создание нового мероприятия
router.post('/', async (req, res) => {
    try {
        const { title, description, date, createdBy } = req.body;
        const event = await Event.create({ title, description, date, createdBy });
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Обновление мероприятия
router.put('/:id', async (req, res) => {
    try {
        const { title, description, date } = req.body;
        const event = await Event.findByPk(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Мероприятие не найдено' });
        }
        await event.update({ title, description, date });
        res.json(event);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Удаление мероприятия
router.delete('/:id', async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Мероприятие не найдено' });
        }
        await event.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;