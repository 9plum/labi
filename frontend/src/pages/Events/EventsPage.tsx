import { useEffect, useState } from 'react';
import styles from './EventsPage.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents } from '../../store/slices/eventSlice';
import { RootState } from 'store';
import { eventService } from '@api/eventService';

type EventType = {
  id: string;
  title: string;
  description: string;
  date: string;
  deletedAt?: string;
  users: string[]; // или массив объектов пользователей, если есть полные данные
  createdBy: string;
};

const EventsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector((state: RootState) => state.events.loading);
  const events = useSelector((state: RootState) => state.events.events);
  const user = useSelector((state: RootState) => state.user.currentUser);

  const [modalEvent, setModalEvent] = useState<EventType | null>(null);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const handleZapis = async (id: string) => {
    await eventService.zapisEvent(id);
    await dispatch(fetchEvents());
  };

  const openModal = (event: EventType) => {
    setModalEvent(event);
  };

  const closeModal = () => {
    setModalEvent(null);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка мероприятий...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {events.length === 0 ? (
        <div className={styles.noEvents}>Нет мероприятий</div>
      ) : (
        <div className={styles.grid}>
          {events.map((event) => (
            <div
              key={event.id}
              className={`${styles.card} ${event.deletedAt ? styles.deleted : ''}`}
              onClick={() => openModal(event)}
            >
              <h3>{event.title}</h3>
              <img
                src='https://www.bigfootdigital.co.uk/wp-content/uploads/2020/07/image-optimisation-scaled.jpg'
                className={styles.image}
              />
              <p className={styles.description}>{event.description}</p>
              <div className={styles.date}>
                <span className={styles.icon}>📅</span>
                {new Date(event.date).toLocaleString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {event.deletedAt && (
                  <span className={styles.deletedLabel}>
                    удалено {new Date(event.deletedAt).toLocaleDateString()}
                  </span>
                )}
                <br />
                {event?.users && event?.users?.find((uId: string) => uId === user?.id) ? (
                  <>Уже записались: {event?.users.length}</>
                ) : (
                  <>
                    {user && user.id !== event.createdBy && (
                      <button onClick={(e) => { e.stopPropagation(); handleZapis(event.id); }}>
                        Записаться
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно */}
      {modalEvent && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Пользователи, записавшиеся на "{modalEvent.title}"</h2>
            {modalEvent?.users?.length > 0 ? (
              <ul>
                {modalEvent?.users?.map((userId) => (
                  <li key={userId}>{userId}</li>
                ))}
              </ul>
            ) : (
              <p>Нет записавшихся пользователей</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
