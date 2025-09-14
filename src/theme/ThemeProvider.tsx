import React, {
	useContext,
	useReducer,
	PropsWithChildren,
	createContext,
	Dispatch,
} from 'react';
import {
	DefaultTheme,
	ThemeProvider as StyledThemeProvider,
} from 'styled-components';
import { lightTheme, darkTheme } from './themes';

// REDUCER
type ThemeAction = 'toggle';

const themeReducer = (
	state: DefaultTheme,
	action: ThemeAction
): DefaultTheme => {
	if (action === 'toggle')
		return state.name === 'light' ? darkTheme : lightTheme;
	return lightTheme;
};

// CONTEXT
type ThemeContextType = [DefaultTheme, Dispatch<ThemeAction>];

export const ThemeContext = createContext<ThemeContextType>([
	lightTheme,
	() => {},
]);

const ThemeProvider = ({ children }: PropsWithChildren) => {
	const [state, dispatch] = useReducer(themeReducer, lightTheme);

	return (
		<ThemeContext.Provider value={[state, dispatch]}>
			<StyledThemeProvider theme={state}>{children}</StyledThemeProvider>
		</ThemeContext.Provider>
	);
};

export default ThemeProvider;

export const useThemeContext = (): ThemeContextType => useContext(ThemeContext);
