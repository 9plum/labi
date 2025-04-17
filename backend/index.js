const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/db');
const { User, Event } = require('./models');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Подключение маршрутов
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);

// Синхронизация моделей с базой данных
sequelize.sync({ alter: true })
    .then(() => {
        console.log('Модели синхронизированы с базой данных');
    })
    .catch(err => {
        console.error('Ошибка синхронизации моделей:', err);
    });

// Тестовый маршрут
app.get('/', (req, res) => {
    res.json({ message: 'Сервер работает!' });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});