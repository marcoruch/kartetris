import { configureStore } from '@reduxjs/toolkit';
import socketReducer from './slices/socketSlice';
import boardReducer from './slices/boardSlice';
import scoreboardReducer from './slices/scoreboardSlice'
import playerReducer from './slices/playerSlice';

const store = configureStore({
  reducer: {
    socket: socketReducer,
    board: boardReducer,
    scoreboard: scoreboardReducer,
    player: playerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const hasPickedNameAndCharacter = (state: RootState): boolean => {
  return state.player.name !== undefined && state.player.character !== undefined;
};

export type RootState = ReturnType<typeof store.getState>;
export default store;