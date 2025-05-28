import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import styles from './MainPage.module.scss';

const MainPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>Event Management</h1>
        <p className={styles.subtitle}>
          Управляйте своими мероприятиями легко и эффективно
        </p>
        <div className={styles.buttons}>
          <Link to="/login" className={styles.button}>
            Войти
          </Link>
          <Link to="/register" className={styles.button}>
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MainPage;