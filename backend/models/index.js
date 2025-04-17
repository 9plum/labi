const User = require('./User');
const Event = require('./Event');

// Настройка связей
User.hasMany(Event, { foreignKey: 'createdBy' });
Event.belongsTo(User, { foreignKey: 'createdBy' });

module.exports = {
    User,
    Event
};