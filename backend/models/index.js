const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Создаем экземпляр Sequelize
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false
    }
);

// Импортируем модели
const Event = require('./Event')(sequelize);
const User = require('./User')(sequelize);

// Определяем связи между моделями
Event.belongsTo(User, { foreignKey: 'createdBy' });
User.hasMany(Event, { foreignKey: 'createdBy' });

// Экспортируем модели и sequelize
module.exports = {
    sequelize,
    Event,
    User
};