// Theme configuration with manga-style font

export const colors = {
  light: {
    primary: '#4A90E2',
    primaryLight: '#E3F2FD',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
    
    // Calendar colors
    calendarEmpty: '#EBEDF0',
    calendarLevel1: '#C6E48B',
    calendarLevel2: '#7BC96F',
    calendarLevel3: '#239A3B',
    calendarLevel4: '#196127',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  fonts: {
    // Manga font for headings and titles
    heading: 'Bangers_400Regular',
    // System font for body text (better readability)
    body: 'System',
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const theme = {
  colors,
  spacing,
  typography,
};

export type Theme = typeof theme;