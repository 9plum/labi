import React from "react";
import { Navigate, Link } from "react-router-dom";
import styles from "./MainPage.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "store";

const MainPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.currentUser);
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>Event Management</h1>
        <p className={styles.subtitle}>
          Управляйте своими мероприятиями легко и эффективно
        </p>
        <div className={styles.buttons}>
          {!user && (
            <>
              <Link to="/login" className={styles.button}>
                Войти
              </Link>
              <Link to="/register" className={styles.button}>
                Зарегистрироваться
              </Link>
            </>
          )}
          <Link to="/events" className={styles.button}>
            Мероприятия
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
