import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface SocketState {
  status: ConnectionStatus;
  error?: string;
}

const initialState: SocketState = {
  status: 'disconnected',
  error: undefined,
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setConnectionStatus(state, action: PayloadAction<ConnectionStatus>) {
      state.status = action.payload;
      if (state.status !== 'error') {
        state.error = undefined;
      }
    },
    setConnectionError(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.error = action.payload;
    },
  },
});

export const { setConnectionStatus, setConnectionError } = socketSlice.actions;
export default socketSlice.reducer;
