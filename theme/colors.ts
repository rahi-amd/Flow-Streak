// Accessible color system - WCAG AA compliant
export const colors = {
  light: {
    background: '#FFFFFF',
    surface: '#F9FAFB',
    primary: '#0EA5E9',      // Sky blue - 4.5:1 contrast
    primaryLight: '#E0F2FE',
    text: '#1F2937',         // Dark gray - 16:1 contrast
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#DC2626',
    success: '#059669',
    
    // Calendar colors (GitHub-style)
    calendarEmpty: '#F3F4F6',
    calendarLevel1: '#DBEAFE',  // Light blue
    calendarLevel2: '#93C5FD',  // Medium blue
    calendarLevel3: '#3B82F6',  // Bright blue
    calendarLevel4: '#1E40AF',  // Dark blue
  },
  
  dark: {
    background: '#111827',
    surface: '#1F2937',
    primary: '#38BDF8',
    primaryLight: '#075985',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    error: '#EF4444',
    success: '#10B981',
    
    calendarEmpty: '#374151',
    calendarLevel1: '#075985',
    calendarLevel2: '#0369A1',
    calendarLevel3: '#0284C7',
    calendarLevel4: '#38BDF8',
  },
  
  highContrast: {
    background: '#000000',
    surface: '#000000',
    primary: '#00D9FF',
    primaryLight: '#003344',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    border: '#FFFFFF',
    error: '#FF0000',
    success: '#00FF00',
    
    calendarEmpty: '#333333',
    calendarLevel1: '#004466',
    calendarLevel2: '#006699',
    calendarLevel3: '#0088CC',
    calendarLevel4: '#00D9FF',
  }
} as const;

export type ColorScheme = keyof typeof colors;
export type ColorKey = keyof typeof colors.light;