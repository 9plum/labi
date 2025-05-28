import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './Navigation.module.scss';
import { getCurrentUser } from '@api/auth';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../store/slices/userSlice';
import { RootState } from '../../store';

interface User {
  id: string;
  email: string;
  name?: string;
}

const Navigation = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.currentUser)

  const handleOpenProfile = () => {
    navigate('/profile');
  }

  const handleLogout = async () => {
    navigate('/');
    localStorage.removeItem("auth_token")
    dispatch(setUser(null))
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      navigate('/');
    }
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'Пользователь';

  return (
    <nav className={styles.navigation}>
      <div className={styles.logo}>
        <Link to={"/"} onClick={handleLogoClick}>
          Webi
        </Link>
      </div>
      <div className={styles.logo}>

      {user && <Link to={"/events"} onClick={handleLogoClick}>
          Мероприятия
        </Link>}
      </div>
      <div className={styles.links}>
        {user ? (
          <>
            <button onClick={handleOpenProfile} className={styles.welcome}>{displayName}</button>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Войти</Link>
            <Link to="/register">Регистрация</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation; 