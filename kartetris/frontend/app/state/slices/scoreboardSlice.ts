import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ScoreboardState {
  won?: boolean;
  lines: number;
  score: number;
  opponentScore: number;
}

const initialState: ScoreboardState = {
  won: undefined,
  lines: 0,
  score: 0,
  opponentScore: 0,
};

const scoreboardSlice = createSlice({
  name: 'scoreboard',
  initialState,
  reducers: {
    incrementLines(state, action: PayloadAction<number>) {
      state.lines += action.payload;
      state.score += action.payload * 20;
    },
    setOpponentScore(state, action: PayloadAction<number>) {
      state.opponentScore = action.payload;
    },
    setWon(state, action: PayloadAction<{ won?: boolean }>) {
      state.won = action.payload.won;
    },
  },
});

export const { incrementLines, setOpponentScore, setWon } = scoreboardSlice.actions;
export default scoreboardSlice.reducer;