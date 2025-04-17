const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
    }
);

// Проверка подключения
sequelize.authenticate()
    .then(() => {
        console.log('Подключение к базе данных успешно установлено');
    })
    .catch(err => {
        console.error('Ошибка подключения к базе данных:', err);
    });

module.exports = sequelize;