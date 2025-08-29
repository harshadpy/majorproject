export const Colors = {
  // Primary brand colors
  primary: '#A6F23F',
  primaryDark: '#8FD633',
  primaryLight: '#B8F55C',
  
  // Background colors
  background: {
    dark: '#263020',
    light: '#F8FAF6',
    card: {
      dark: '#2F3B28',
      light: '#FFFFFF',
    },
    surface: {
      dark: '#3A4A32',
      light: '#F1F5ED',
    }
  },
  
  // Accent color
  accent: '#F2633F',
  accentDark: '#E54A28',
  accentLight: '#F47A5C',
  
  // Text colors
  text: {
    primary: {
      dark: '#FFFFFF',
      light: '#1A1A1A',
    },
    secondary: {
      dark: '#B8C5B0',
      light: '#6B7B63',
    },
    muted: {
      dark: '#8A9682',
      light: '#9CA89A',
    }
  },
  
  // Status colors
  success: '#4ADE80',
  warning: '#FCD34D',
  error: '#F87171',
  info: '#60A5FA',
  
  // Severity colors
  severity: {
    low: '#4ADE80',
    medium: '#FCD34D',
    high: '#F87171',
  },
  
  // Border colors
  border: {
    dark: '#3A4A32',
    light: '#E5E7EB',
  },
  
  // Tab bar colors
  tabBar: {
    background: {
      dark: '#1F2B1A',
      light: '#FFFFFF',
    },
    active: '#A6F23F',
    inactive: {
      dark: '#8A9682',
      light: '#6B7B63',
    }
  }
};

export const getThemeColors = (isDark: boolean) => ({
  primary: Colors.primary,
  accent: Colors.accent,
  background: isDark ? Colors.background.dark : Colors.background.light,
  card: isDark ? Colors.background.card.dark : Colors.background.card.light,
  surface: isDark ? Colors.background.surface.dark : Colors.background.surface.light,
  text: isDark ? Colors.text.primary.dark : Colors.text.primary.light,
  textSecondary: isDark ? Colors.text.secondary.dark : Colors.text.secondary.light,
  textMuted: isDark ? Colors.text.muted.dark : Colors.text.muted.light,
  border: isDark ? Colors.border.dark : Colors.border.light,
  tabBarBackground: isDark ? Colors.tabBar.background.dark : Colors.tabBar.background.light,
  tabBarInactive: isDark ? Colors.tabBar.inactive.dark : Colors.tabBar.inactive.light,
});