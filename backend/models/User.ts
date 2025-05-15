import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  BeforeCreate,
  AllowNull,
  Unique,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';
import bcrypt from 'bcryptjs';

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         name:
 *           type: string
 *           example: "Иван Иванов"
 *         email:
 *           type: string
 *           format: email
 *           example: "ivan@example.com"
 *         password:
 *           type: string
 *           example: "hashedpassword"
 *         failedAttempts:
 *           type: integer
 *           example: 0
 *         isLocked:
 *           type: boolean
 *           example: false
 *         lockUntil:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         deletedAt:
 *           type: string
 *           format: date-time
 */

@Table({
  tableName: 'Users',
  paranoid: true,
  timestamps: true,
})
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare name: string;

  @AllowNull(false)
  @Unique
  @Column({
    type: DataType.STRING,
    validate: { isEmail: true },
  })
  declare email: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare password: string;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare failedAttempts: number;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare isLocked: boolean;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare lockUntil: Date | null;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @DeletedAt
  @Column({ type: DataType.DATE, field: 'deleted_at' })
  declare deletedAt: Date | null;

  @BeforeCreate
  static async hashPassword(instance: User): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    instance.password = await bcrypt.hash(instance.password, salt);
  }

  /** Аутентификация пользователя с учётом блокировки */
  async authenticate(password: string): Promise<boolean> {
    if (this.isLocked && this.lockUntil && this.lockUntil > new Date()) {
      const remainingTime = Math.ceil((this.lockUntil.getTime() - Date.now()) / 1000 / 60);
      throw new Error(`Аккаунт временно заблокирован. Попробуйте через ${remainingTime} минут.`);
    }

    const isMatch = await bcrypt.compare(password, this.password);

    if (isMatch) {
      if (this.failedAttempts > 0 || this.isLocked) {
        this.failedAttempts = 0;
        this.isLocked = false;
        this.lockUntil = null;
        await this.save();
      }
      return true;
    } else {
      this.failedAttempts += 1;

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
  }

  /** Проверка статуса блокировки */
  async checkLockStatus(): Promise<void> {
    if (this.isLocked && this.lockUntil && this.lockUntil <= new Date()) {
      this.isLocked = false;
      this.lockUntil = null;
      this.failedAttempts = 0;
      await this.save();
    }
  }
}
