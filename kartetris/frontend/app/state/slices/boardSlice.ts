import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CurrentTetrisFigure, GameBoard } from '../../../../shared/types';

interface BoardState {
  selfBoard: GameBoard;
  opponentBoard: GameBoard;
  opponentCurrentFigure: CurrentTetrisFigure | undefined;
  opponent: { name: string; character: string } | undefined;
  roomId: string;
  step: number;
}

const initialState: BoardState = {
  selfBoard: [],
  opponentBoard: [],
  opponentCurrentFigure: undefined,
  opponent: undefined,
  roomId: '',
  step: 0
};

interface BoardPayLoad {
    boardTetris: GameBoard;
    currentFigureTetris: CurrentTetrisFigure | undefined;
    roomId: string;
    step: number;
}

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    setSelfBoard(state: BoardState, { payload} ) {
      return {
      ...state,
      selfBoard: payload
      }
    },
    setOpponentBoard(state: BoardState, action: PayloadAction<BoardPayLoad>) {
      return {
        ...state,
        opponentBoard: action.payload?.boardTetris,
        roomId: action.payload?.roomId,
        opponentCurrentFigure: action.payload?.currentFigureTetris,
        step: action.payload?.step
      };
    },
    setOpponent(state: BoardState, action: PayloadAction<{ name: string; character: string } | undefined>) {
      return {
        ...state,
        opponent: action.payload
      };
    },
  },
});

export const { setOpponentBoard, setOpponent } = boardSlice.actions;
export default boardSlice.reducer;