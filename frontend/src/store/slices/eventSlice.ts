import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Event } from '../../types';
import { eventService } from '../../api/eventService';

interface EventState {
  events: Event[];
  userEvents: Event[];
  selectedEvent: Event | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: EventState = {
  events: [],
  userEvents: [],
  selectedEvent: null,
  isLoading: false,
  error: null,
};

export const fetchEvents = createAsyncThunk('events/fetchEvents', async () => {
  const response = await eventService.getEvents();
  return response;
});

export const fetchUserEvents = createAsyncThunk('events/fetchUserEvents', async (userId: string) => {
  const response = await eventService.getUserEvents(userId);
  return response;
});

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData: Omit<Event, 'id' | 'participants'>) => {
    const response = await eventService.createEvent(eventData);
    return response;
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, eventData }: { id: string; eventData: Partial<Event> }) => {
    const response = await eventService.updateEvent(id, eventData);
    return response;
  }
);

export const participateInEvent = createAsyncThunk(
  'events/participate',
  async (eventId: string) => {
    const response = await eventService.participateInEvent(eventId);
    return response;
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (eventId: string) => {
    const response = await eventService.deleteEvent(eventId);
    return { id: eventId, ...response };
  }
);

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setSelectedEvent: (state, action: PayloadAction<Event | null>) => {
      state.selectedEvent = action.payload;
    },
    clearEventError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка при загрузке событий';
      })
      .addCase(fetchUserEvents.fulfilled, (state, action) => {
        state.userEvents = action.payload;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.events.push(action.payload);
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        const index = state.events.findIndex((event) => event.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      })
      .addCase(participateInEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(participateInEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.events.findIndex((event) => event.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
        const userEventIndex = state.userEvents.findIndex((event) => event.id === action.payload.id);
        if (userEventIndex !== -1) {
          state.userEvents[userEventIndex] = action.payload;
        } else {
          state.userEvents.push(action.payload);
        }
      })
      .addCase(participateInEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка при участии в мероприятии';
      })
      .addCase(deleteEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = state.events.filter(event => event.id !== action.payload.id);
        state.userEvents = state.userEvents.filter(event => event.id !== action.payload.id);
        if (state.selectedEvent?.id === action.payload.id) {
          state.selectedEvent = null;
        }
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка при удалении мероприятия';
      });
  },
});

export const { setSelectedEvent, clearEventError } = eventSlice.actions;
export default eventSlice.reducer; 