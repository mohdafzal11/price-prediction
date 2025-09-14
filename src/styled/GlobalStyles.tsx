import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  /* Apply system font to all numbers throughout the application */
  @font-face {
    font-family: 'NumbersFont';
    src: local(-apple-system),
         local(system-ui),
         local(BlinkMacSystemFont),
         local("Segoe UI"),
         local(Roboto),
         local("Helvetica Neue"),
         local(Arial),
         local(sans-serif);
    unicode-range: U+0030-0039, U+002E, U+002C, U+0025, U+002B, U+002D; /* Numbers, decimal point, comma, percent, plus, minus */
  }
  
  /* Override all numeric values with our NumbersFont */
  * {
    font-family: 'NumbersFont', 'Bricolage Grotesque', sans-serif;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;

    ::-webkit-scrollbar{
      width: 6px;
    background-color: transparent;
    }
    ::-webkit-scrollbar-thumb {
      border-radius: 3px;
      background: ${({ theme: { colors } }) => colors.colorLightNeutral3};
    }
  }

  body {
    font-family: 'Bricolage Grotesque', sans-serif;
    background-color: ${({ theme: { colors } }) => colors.bgColor};
    color: ${({ theme: { colors } }) => colors.textColor};
    transition: background-color 0.3s ease;
    /* Ensure numbers use system font */
    -webkit-font-feature-settings: "tnum";
    font-feature-settings: "tnum";
  }

  a {
    text-decoration: none;
    color: inherit;
    color: ${({ theme: { colors } }) => colors.textColor};
  }

  ul {
    list-style: none;
  }

  button {
    border: none;
    background: none;
    outline: none;
    cursor: pointer;
    font-family: 'Bricolage Grotesque', sans-serif;
  }

  input, textarea {
    font-family: 'Bricolage Grotesque', sans-serif;
  }
  
  /* Additional rule to ensure all numbers use the system font */
  .number, span:has(> .number), div:has(> .number),
  [class*="price"], [class*="Price"],
  [class*="value"], [class*="Value"],
  [class*="amount"], [class*="Amount"],
  [class*="stat"], [class*="Stat"],
  [class*="count"], [class*="Count"],
  [class*="percent"], [class*="Percent"] {
    font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
  }
  
  /* Accessibility: Hide content visually but keep it accessible to screen readers */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;

export default GlobalStyles;
