import axiosInstance from './axios';
import { Event } from '../types';

export const eventService = {
  getAllEvents: async () => {
    const response = await axiosInstance.get<Event[]>('/events');
    return response.data;
  },

  createEvent: async (eventData: Omit<Event, 'id'>) => {
    const response = await axiosInstance.post<Event>('/events', eventData);
    return response.data;
  },

  zapisEvent: async (id: string) => {
    const response = await axiosInstance.post<Event>(`/events/${id}`);
    return response.data;
  },

  deleteEvent: async (id: number) => {
    await axiosInstance.delete(`/events/${id}`);
  },

  uploadImage: async (id: number, formData: FormData) => {
    const response = await axiosInstance.post<{ image_url: string }>(`/events/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
}; 