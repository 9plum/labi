const { User } = require('../models');

const checkAccountLock = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);
        
        if (user.isLocked) {
            if (user.lockUntil && user.lockUntil > new Date()) {
                const minutesLeft = Math.ceil((user.lockUntil - new Date()) / 1000 / 60);
                return res.status(403).json({ 
                    message: 'Аккаунт заблокирован', 
                    details: `Попробуйте через ${minutesLeft} минут`
                });
            } else {
                // Разблокировка аккаунта если время блокировки истекло
                user.isLocked = false;
                user.failed_attempts = 0;
                user.lockUntil = null;
                await user.save();
            }
        }
        
        next();
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при проверке статуса аккаунта', error: error.message });
    }
};

module.exports = checkAccountLock; 