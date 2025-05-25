import axios from './axios';
import { Event } from '../types';

export const eventService = {
  getEvents: async () => {
    const response = await axios.get('/events');
    return response.data;
  },

  getUserEvents: async (userId: string) => {
    const response = await axios.get(`/events/user/${userId}`);
    return response.data;
  },

  createEvent: async (eventData: Omit<Event, 'id' | 'participants'>) => {
    const response = await axios.post('/events', eventData);
    return response.data;
  },

  updateEvent: async (id: string, eventData: Partial<Event>) => {
    const response = await axios.put(`/events/${id}`, eventData);
    return response.data;
  },

  zapisEvent: async (eventId: string) => {
    const response = await axios.post(`/events/${eventId}`);
    return response.data;
  },

  getEventParticipants: async (eventId: string) => {
    const response = await axios.get(`/events/${eventId}/participants`);
    return response.data;
  },

  deleteEvent: async (eventId: string) => {
    const response = await axios.delete(`/events/${eventId}`);
    return response.data;
  },
};