const express = require('express');
const router = express.Router();
const { Event, User } = require('../models');
const upload = require('../config/multer');
const path = require('path');
const { uploadLimiter } = require('../config/rateLimit');
const apicache = require('apicache');

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - title
 *         - date
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         createdBy:
 *           type: integer
 *         imageUrl:
 *           type: string
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Получить список всех мероприятий
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Список мероприятий
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
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

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Получить мероприятие по ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Информация о мероприятии
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Мероприятие не найдено
 */
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

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Создать новое мероприятие
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Мероприятие создано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 */
router.post('/', async (req, res) => {
    try {
        const { title, description, date, createdBy } = req.body;
        const event = await Event.create({ title, description, date, createdBy });
        apicache.clear('events');
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Обновить мероприятие
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Мероприятие обновлено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Мероприятие не найдено
 */
router.put('/:id', async (req, res) => {
    try {
        const { title, description, date } = req.body;
        const event = await Event.findByPk(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Мероприятие не найдено' });
        }
        await event.update({ title, description, date });
        apicache.clear('events');
        res.json(event);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Удалить мероприятие
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Мероприятие удалено
 *       404:
 *         description: Мероприятие не найдено
 */
router.delete('/:id', async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Мероприятие не найдено' });
        }
        await event.destroy();
        apicache.clear('events');
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/events/{id}/image:
 *   post:
 *     summary: Загрузить изображение для мероприятия
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Изображение загружено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl:
 *                   type: string
 *       404:
 *         description: Мероприятие не найдено
 */
router.post('/:id/image', uploadLimiter, upload.single('image'), async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Мероприятие не найдено' });
        }
        
        if (!req.file) {
            return res.status(400).json({ error: 'Файл не был загружен' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        await event.update({ imageUrl });
        
        apicache.clear('events');
        res.json({ imageUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;