const rateLimit = require('express-rate-limit');

// Ограничение для всех маршрутов
const globalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 минута
    max: 100, // максимум 100 запросов в минуту
    message: 'Слишком много запросов, попробуйте позже',
    standardHeaders: true, // Возвращает информацию об ограничениях в заголовках
    legacyHeaders: false, // Отключает устаревшие заголовки
});

// Ограничение для загрузки изображений
const uploadLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 минута
    max: 10, // максимум 10 загрузок в минуту
    message: 'Слишком много загрузок изображений, попробуйте позже',
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    globalLimiter,
    uploadLimiter
};