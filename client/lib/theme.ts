// Enhanced VS Code Color Schemes

export const themes = {
  // Dark+ (default dark)
  darkPlus: {
    name: 'Dark+',
    colors: {
      background: '#1e1e1e',
      backgroundDarker: '#181818',
      backgroundLighter: '#252526',
      sidebarBackground: '#1e1e1e',
      activityBar: '#181818',
      editorBackground: '#1e1e1e',
      statusBar: '#007acc',
      border: '#2b2b2b',
      borderLight: '#454545',
      text: '#cccccc',
      textMuted: '#858585',
      textBright: '#ffffff',
      accent: '#007acc',
      accentHover: '#005a9e',
      success: '#4ec9b0',
      warning: '#dcdcaa',
      error: '#f48771',
      info: '#75beff',
      folder: '#dcb67a',
      file: '#519aba',
    }
  },

  // Monokai inspired
  monokai: {
    name: 'Monokai',
    colors: {
      background: '#272822',
      backgroundDarker: '#1e1f1c',
      backgroundLighter: '#3e3d32',
      sidebarBackground: '#272822',
      activityBar: '#1e1f1c',
      editorBackground: '#272822',
      statusBar: '#75715e',
      border: '#3e3d32',
      borderLight: '#49483e',
      text: '#f8f8f2',
      textMuted: '#75715e',
      textBright: '#ffffff',
      accent: '#66d9ef',
      accentHover: '#52c5df',
      success: '#a6e22e',
      warning: '#e6db74',
      error: '#f92672',
      info: '#66d9ef',
      folder: '#e6db74',
      file: '#66d9ef',
    }
  },

  // GitHub Dark
  githubDark: {
    name: 'GitHub Dark',
    colors: {
      background: '#0d1117',
      backgroundDarker: '#010409',
      backgroundLighter: '#161b22',
      sidebarBackground: '#0d1117',
      activityBar: '#010409',
      editorBackground: '#0d1117',
      statusBar: '#1f6feb',
      border: '#30363d',
      borderLight: '#484f58',
      text: '#e6edf3',
      textMuted: '#8b949e',
      textBright: '#ffffff',
      accent: '#1f6feb',
      accentHover: '#1a56db',
      success: '#3fb950',
      warning: '#d29922',
      error: '#f85149',
      info: '#58a6ff',
      folder: '#c69026',
      file: '#58a6ff',
    }
  },

  // One Dark Pro
  oneDark: {
    name: 'One Dark Pro',
    colors: {
      background: '#282c34',
      backgroundDarker: '#21252b',
      backgroundLighter: '#2c313c',
      sidebarBackground: '#282c34',
      activityBar: '#21252b',
      editorBackground: '#282c34',
      statusBar: '#61afef',
      border: '#181a1f',
      borderLight: '#3e4451',
      text: '#abb2bf',
      textMuted: '#5c6370',
      textBright: '#ffffff',
      accent: '#61afef',
      accentHover: '#528bff',
      success: '#98c379',
      warning: '#e5c07b',
      error: '#e06c75',
      info: '#61afef',
      folder: '#e5c07b',
      file: '#61afef',
    }
  },

  // Dracula
  dracula: {
    name: 'Dracula',
    colors: {
      background: '#282a36',
      backgroundDarker: '#21222c',
      backgroundLighter: '#343746',
      sidebarBackground: '#282a36',
      activityBar: '#21222c',
      editorBackground: '#282a36',
      statusBar: '#bd93f9',
      border: '#191a21',
      borderLight: '#44475a',
      text: '#f8f8f2',
      textMuted: '#6272a4',
      textBright: '#ffffff',
      accent: '#bd93f9',
      accentHover: '#a971ec',
      success: '#50fa7b',
      warning: '#f1fa8c',
      error: '#ff5555',
      info: '#8be9fd',
      folder: '#f1fa8c',
      file: '#8be9fd',
    }
  },
};

export type ThemeName = keyof typeof themes;
export type Theme = typeof themes.darkPlus;

// Default theme
export const defaultTheme: ThemeName = 'darkPlus';

// Get theme by name
export function getTheme(name: ThemeName = defaultTheme): Theme {
  return themes[name] || themes.darkPlus;
}

// Export color utilities
export function getCssVariables(theme: Theme) {
  return Object.entries(theme.colors).reduce((acc, [key, value]) => {
    acc[`--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = value;
    return acc;
  }, {} as Record<string, string>);
}
