const apicache = require('apicache');
const cache = apicache.middleware;

// Настройки кэширования
const cacheOptions = {
    defaultDuration: '5 minutes', // время жизни кэша
    statusCodes: { include: [200] }, // кэшировать только успешные ответы
    appendKey: (req) => req.user ? req.user.id : '' // добавить ID пользователя в ключ кэша
};

module.exports = {
    cache,
    cacheOptions
};