import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MenuState {
	isOpen: boolean;
	authOpen: 'login' | 'signup' | false;
}

const initialState: MenuState = {
	isOpen: false,
	authOpen: false,
};

const { reducer, actions } = createSlice({
	name: 'menu',
	initialState,
	reducers: {
		toggleOpen: (state) => {
			state.isOpen = !state.isOpen;
		},
		changeAuthOpen: (state, action: PayloadAction<MenuState['authOpen']>) => {
			state.authOpen = action.payload;
		},
	},
});

export const { toggleOpen, changeAuthOpen } = actions;
export default reducer;
