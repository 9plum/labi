require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const { sequelize } = require('./models/index');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const { globalLimiter } = require('./config/rateLimit');
const { cache, cacheOptions } = require('./config/cache');
const swaggerUi = require('swagger-ui-express');
const specs = require('./config/swagger');
const path = require('path');

// Инициализация Passport
require('./config/passport');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(passport.initialize());

// Применяем глобальный rate limiter
app.use(globalLimiter);

// Настройка статических файлов для загруженных изображений
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Добавляем Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Применяем кэширование к маршрутам
app.use('/api/events', cache('5 minutes'));
app.use('/api/users', cache('5 minutes'));

// Публичные маршруты
app.use('/api/public', publicRoutes);

// Маршруты аутентификации
app.use('/api/auth', authRoutes);

// Защищенные маршруты
app.use('/api/events', passport.authenticate('jwt', { session: false }), eventRoutes);
app.use('/api/users', passport.authenticate('jwt', { session: false }), userRoutes);

// Тестовый маршрут
app.get('/', (req, res) => {
    res.json({ message: 'Сервер работает!' });
});

// Запуск сервера
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Подключение к базе данных успешно установлено.');

        await sequelize.sync();
        console.log('Модели синхронизированы с базой данных.');

        app.listen(PORT, () => {
            console.log(`Сервер запущен на порту ${PORT}`);
        });
    } catch (error) {
        console.error('Ошибка при запуске сервера:', error);
    }
};

startServer();