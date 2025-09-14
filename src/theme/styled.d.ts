import 'styled-components';

declare module 'styled-components' {
	export interface DefaultTheme {
		name: string;
		colors: {
      border: Interpolation<ThemeProps<DefaultTheme>>;
      primary: Interpolation<ThemeProps<DefaultTheme>>;
      text: Interpolation<ThemeProps<DefaultTheme>>;
      background: Interpolation<ThemeProps<DefaultTheme>>;
      textSecondary: Interpolation<ThemeProps<DefaultTheme>>;
      cardBackground: Interpolation<ThemeProps<DefaultTheme>>;
      error: Interpolation<ThemedStyledProps<{ negative: boolean; }, DefaultTheme>>;
      success: Interpolation<ThemedStyledProps<{ negative: boolean; }, DefaultTheme>>;
      backgroundHover: Interpolation<ThemeProps<DefaultTheme>>;
			white: string;
			controlBorderColor: string;
			controlBackgroundColor: string;
			controlCaretColor: string;
			controlDropdownBackgroundColor: string;
			themeColor: string;
			themeLightColor: string;
			themeLightBlueColor: string;
			themeLightBlue: string;
			themeLightBlueFont: string;
			textColor: string;
			infoIconColor: string;
			textColorSub: string;
			textColorSub1: string;
			textColorError: string;
			btLightBlue: string;
			upColor: string;
			downColor: string;
			borderColor: string;
			borderColor1: string;
			bgColor: string;
			colorPrimaryBlack: string;
			colorPrimaryWhite: string;
			colorPrimaryBlue: string;
			colorNeutral1: string;
			colorNeutral2: string;
			colorNeutral3: string;
			colorNeutral4: string;
			colorNeutral5: string;
			colorNeutral6: string;
			colorNeutral7: string;
			colorLightNeutral1: string;
			colorLightNeutral2: string;
			colorLightNeutral3: string;
			colorLightNeutral4: string;
			colorLightNeutral5: string;
			colorLightNeutral6: string;
			colorLightNeutral7: string;
			star: string;
			modal: string;
		};
	}
}
