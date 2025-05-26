import { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import * as yup from 'yup';

import { useNavigate, useParams } from 'react-router-dom';
import styles from './EventFormPage.module.scss';
import { getToken } from '../../utils/localStorage';
import { createEvent, updateEvent } from '../../store/slices/eventSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store';

interface FormValues {
  title: string;
  description: string;
  date: string;
}

const schema = yup.object({
  title: yup.string().required('Название обязательно'),
  description: yup.string().required('Описание обязательно'),
  date: yup.string()
    .required('Дата обязательна')
    .test('is-future', 'Дата не может быть в прошлом', (value) => {
      if (!value) return false;
      return new Date(value) >= new Date();
    }),
}).required();

const EventFormPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { events } = useSelector((state: RootState) => state.events);
  const user = useSelector((state: RootState) => state.user.currentUser);
  const token = getToken();

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset,
    setError: setFormError 
  } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      date: new Date().toISOString().slice(0, 16),
    },
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (id) {
      const event = events.find(e => e.id === id);
      if (event) {
        reset({
          title: event.title,
          description: event.description,
          date: event.date.slice(0, 16),
        });
      } else {
        navigate('/events');
      }
    }
  }, [id, events, reset, token, navigate]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!token || !user) {
      navigate('/login');
      return;
    }
  
    try {
      const eventData = {
        title: data.title,
        description: data.description,
        date: new Date(data.date).toISOString(),
        createdBy: user.id
      };
  
      if (id) {
        await dispatch(updateEvent({ id, ...eventData })).unwrap();
      } else {
        await dispatch(createEvent(eventData)).unwrap();
      }
      navigate('/');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setFormError('root', {
        type: 'manual',
        message: errorMessage
      });
    }
  };

  return (
    <div className={styles.formContainer}>
      <h1>{id ? 'Редактирование' : 'Создание'} мероприятия</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.formGroup}>
          <label>Название</label>
          <input {...register('title')} />
          {errors.title && <span className={styles.error}>{errors.title.message}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Описание</label>
          <textarea {...register('description')} />
          {errors.description && <span className={styles.error}>{errors.description.message}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Дата</label>
          <input type="datetime-local" {...register('date')} />
          {errors.date && <span className={styles.error}>{errors.date.message}</span>}
        </div>

        {errors.root && <div className={styles.error}>{errors.root.message}</div>}

        <button type="submit">Сохранить</button>
      </form>
    </div>
  );
};

export default EventFormPage;