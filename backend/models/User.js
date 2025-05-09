const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        failedAttempts: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        isLocked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        lockUntil: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        deletedAt: {
            type: DataTypes.DATE,
        },
    },
    {
        paranoid: true,
    }
);

// Хеширование пароля перед созданием
User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
});

// Метод для проверки пароля с учетом блокировки
User.prototype.authenticate = async function(password) {
    // Проверяем, не заблокирован ли аккаунт
    if (this.isLocked && this.lockUntil > new Date()) {
        const remainingTime = Math.ceil((this.lockUntil - new Date()) / 1000 / 60);
        throw new Error(`Аккаунт временно заблокирован. Попробуйте через ${remainingTime} минут.`);
    }
    
    const isMatch = await bcrypt.compare(password, this.password);
    
    if (isMatch) {
        // Сброс счетчика неудачных попыток при успешном входе
        if (this.failedAttempts > 0 || this.isLocked) {
            this.failedAttempts = 0;
            this.isLocked = false;
            this.lockUntil = null;
            await this.save();
        }
        return true;
    } else {
        // Увеличиваем счетчик неудачных попыток
        this.failedAttempts += 1;
        
        // Блокировка после 5 неудачных попыток на 30 минут
        if (this.failedAttempts >= 5) {
            this.isLocked = true;
            const lockTime = new Date();
            lockTime.setMinutes(lockTime.getMinutes() + 30);
            this.lockUntil = lockTime;
        }
        
        await this.save();
        
        const remainingAttempts = 5 - this.failedAttempts;
        if (remainingAttempts > 0) {
            throw new Error(`Неверный пароль. Осталось попыток: ${remainingAttempts}`);
        } else {
            throw new Error(`Аккаунт временно заблокирован из-за слишком большого количества неудачных попыток. Попробуйте через 30 минут.`);
        }
    }
};

// Метод для проверки, истекло ли время блокировки
User.prototype.checkLockStatus = function() {
    if (this.isLocked && this.lockUntil <= new Date()) {
        this.isLocked = false;
        this.lockUntil = null;
        this.failedAttempts = 0;
        return this.save();
    }
    return Promise.resolve();
};

module.exports = User;