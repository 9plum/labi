const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

// Регистрация пользователя
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Проверка существования пользователя
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        // Создание нового пользователя
        const user = await User.create({
            name,
            email,
            password
        });

        res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при регистрации пользователя', error: error.message });
    }
});

// Вход пользователя
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Поиск пользователя
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Проверка блокировки аккаунта
        if (user.isLocked) {
            if (user.lockUntil && user.lockUntil > new Date()) {
                return res.status(403).json({ message: 'Аккаунт заблокирован. Попробуйте позже.' });
            } else {
                // Разблокировка аккаунта если время блокировки истекло
                user.isLocked = false;
                user.failed_attempts = 0;
                user.lockUntil = null;
                await user.save();
            }
        }

        // Проверка пароля
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            // Увеличение счетчика неудачных попыток
            user.failed_attempts += 1;
            if (user.failed_attempts >= 5) {
                user.isLocked = true;
                user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Блокировка на 30 минут
            }
            await user.save();
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Сброс счетчика неудачных попыток при успешном входе
        user.failed_attempts = 0;
        user.isLocked = false;
        user.lockUntil = null;
        await user.save();

        // Генерация JWT токена
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при входе', error: error.message });
    }
});

module.exports = router; 