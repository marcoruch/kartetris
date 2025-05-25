import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface PlayerState {
    name: string | undefined;
    character: string | undefined;
}

const initialState: PlayerState = {
    name: undefined,
    character: undefined,
};

const characters = ["bonedry", "bowser", "luigi", "mario", "toad", "yoshi"];

const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        setName(state: PlayerState, action: PayloadAction<string | undefined>) {
            state.name = action.payload;
        },
        setCharacter(state: PlayerState, action: PayloadAction<string | undefined>) {
            if (action.payload === undefined) {
                state.character = undefined;
                return;
            }

            if (characters.includes(action.payload)) {
                state.character = action.payload;
            } else {
                console.warn(`Invalid character: ${action.payload}`);
            }
        },
    },
});

export const { setName, setCharacter } = playerSlice.actions;
export default playerSlice.reducer;
