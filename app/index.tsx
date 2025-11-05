import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, Line, Pattern, Rect } from 'react-native-svg';
import { AccessibleText } from '../components';
import { colors, spacing, typography } from '../theme';

interface CalendarDay {
  date: string;
  minutes: number;
  level: number;
}

// Helper function to calculate color level based on minutes
const calculateLevel = (minutes: number): number => {
  if (minutes === 0) return 0;
  if (minutes < 25) return 1;
  if (minutes < 50) return 2;
  if (minutes < 75) return 3;
  return 4;
};

// Process sessions array into calendar format
const processCalendarData = (sessions: any[]): CalendarDay[] => {
  if (!sessions || sessions.length === 0) return [];
  
  // Group sessions by date and sum minutes
  const dateMap = new Map<string, number>();
  
  sessions.forEach(session => {
    const date = session.date;
    const minutes = session.minutes || 0;
    
    if (dateMap.has(date)) {
      // Add to existing date's minutes
      dateMap.set(date, dateMap.get(date)! + minutes);
    } else {
      // Create new date entry
      dateMap.set(date, minutes);
    }
  });
  
  // Convert Map to CalendarDay array
  const calendarData: CalendarDay[] = [];
  
  dateMap.forEach((minutes, date) => {
    calendarData.push({
      date: date,
      minutes: minutes,
      level: calculateLevel(minutes),
    });
  });
  
  return calendarData;
};

// Manga-style speed lines component
const SpeedLines: React.FC<{ count?: number }> = ({ count = 12 }) => {
  const lines = Array.from({ length: count }, (_, i) => {
    const angle = (i * 360) / count;
    const radians = (angle * Math.PI) / 180;
    const startRadius = 150;
    const endRadius = 300;
    
    const x1 = 200 + Math.cos(radians) * startRadius;
    const y1 = 100 + Math.sin(radians) * startRadius;
    const x2 = 200 + Math.cos(radians) * endRadius;
    const y2 = 100 + Math.sin(radians) * endRadius;
    
    return { x1, y1, x2, y2, key: i };
  });

  return (
    <Svg height="200" width="400" style={styles.speedLinesContainer}>
      {lines.map(line => (
        <Line
          key={line.key}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="#000000"
          strokeWidth="2"
          opacity="0.15"
        />
      ))}
    </Svg>
  );
};

// Manga-style card border component
const MangaBorder: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  return (
    <Svg height={height} width={width} style={styles.borderOverlay}>
      <Defs>
        <Pattern id="crosshatch" patternUnits="userSpaceOnUse" width="8" height="8">
          <Line x1="0" y1="0" x2="8" y2="8" stroke="#000000" strokeWidth="0.5" opacity="0.1" />
          <Line x1="8" y1="0" x2="0" y2="8" stroke="#000000" strokeWidth="0.5" opacity="0.1" />
        </Pattern>
      </Defs>
      
      {/* Hand-drawn style border */}
      <Rect
        x="2"
        y="2"
        width={width - 4}
        height={height - 4}
        fill="none"
        stroke="#000000"
        strokeWidth="2.5"
        rx="16"
        strokeDasharray="none"
        opacity="0.2"
      />
      
      {/* Slightly offset second border for depth */}
      <Rect
        x="3"
        y="3"
        width={width - 6}
        height={height - 6}
        fill="none"
        stroke="#000000"
        strokeWidth="1.5"
        rx="16"
        opacity="0.15"
      />
    </Svg>
  );
};

export default function HomeScreen() {
  const [sessions, setSessions] = useState<number>(0);
  const [totalMinutes, setTotalMinutes] = useState<number>(0);
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000); // Reload every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      // Get today's date string
      const today = new Date();
      const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      // Load and process session history for calendar
      const historyJson = await AsyncStorage.getItem('sessionHistory');
      if (historyJson) {
        const history = JSON.parse(historyJson);
        
        // Get TODAY's data specifically
        const todayMinutes = history[todayString] || 0;
        const todaySessions = todayMinutes > 0 ? Math.ceil(todayMinutes / 25) : 0;
        
        // Update today's stats
        setSessions(todaySessions);
        setTotalMinutes(todayMinutes);
        
        // Convert history object to array format for calendar
        const historyArray = Object.keys(history).map(date => ({
          date: date,
          minutes: history[date]
        }));
        
        // Process into calendar format with levels
        const processedData = processCalendarData(historyArray);
        setCalendarData(processedData);
      } else {
        // No history yet, set to zero
        setSessions(0);
        setTotalMinutes(0);
      }
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const calculateStreak = (): number => {
    if (calendarData.length === 0) return 0;
    
    const sortedDates = calendarData
      .filter(d => d.minutes > 0) // Only count days with activity
      .map(d => d.date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    if (sortedDates.length === 0) return 0;
    
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    let streak = 0;
    
    // Check if there's activity today or yesterday (to allow for streaks to continue)
    const mostRecentDate = sortedDates[0];
    const daysSinceRecent = Math.floor(
      (new Date(todayString).getTime() - new Date(mostRecentDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceRecent > 1) {
      return 0; // Streak broken
    }
    
    if (mostRecentDate === todayString) {
      streak = 1;
      
      // Count consecutive days going backwards
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const daysDiff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          streak++;
        } else {
          break;
        }
      }
    }
    
    return streak;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* New Header: Title Left, Date Right */}
        <View style={styles.header}>
          <AccessibleText 
            variant="body" 
            weight="bold"
            style={styles.smallTitle}
          >
            FlowStreak
          </AccessibleText>
          
          <AccessibleText 
            variant="caption" 
            color="textSecondary"
            style={styles.dateText}
          >
            {new Date().toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </AccessibleText>
        </View>

        {/* Dramatic Centered Streak Badge with Manga Effects */}
        <View style={styles.streakSection}>
          <SpeedLines count={20} />
          <View style={styles.streakBadgeContainer}>
            <View style={styles.streakBadge}>
              <MangaBorder width={240} height={200} />
              <AccessibleText 
                variant="title" 
                align="center"
                style={styles.streakNumber}
              >
                🔥 {calculateStreak()}
              </AccessibleText>
              <AccessibleText 
                variant="body" 
                color="textSecondary"
                align="center"
                style={styles.streakLabel}
              >
                DAY STREAK
              </AccessibleText>
            </View>
          </View>
        </View>

        {/* Today's Progress Card with Manga Border */}
        <View style={styles.cardContainer}>
          <View style={styles.statsCard}>
            <MangaBorder width={380} height={180} />
            <AccessibleText variant="body" weight="semibold" style={styles.cardTitle}>
              Today's Progress
            </AccessibleText>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <AccessibleText variant="heading" color="primary" style={styles.statNumber}>
                  {totalMinutes}
                </AccessibleText>
                <AccessibleText variant="caption" color="textSecondary" style={styles.statLabel}>
                  minutes
                </AccessibleText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <AccessibleText variant="heading" color="primary" style={styles.statNumber}>
                  {sessions}
                </AccessibleText>
                <AccessibleText variant="caption" color="textSecondary" style={styles.statLabel}>
                  sessions
                </AccessibleText>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    paddingBottom: spacing.xxl + spacing.md, // Extra padding to accommodate lifted tab bar
  },
  // New Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  smallTitle: {
    fontSize: typography.sizes.lg,
    textTransform: 'none',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  dateText: {
    fontSize: typography.sizes.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Dramatic Streak Section
  streakSection: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: spacing.xxl,
    marginTop: spacing.lg,
  },
  speedLinesContainer: {
    position: 'absolute',
    top: -50,
    left: '50%',
    marginLeft: -200,
  },
  streakBadgeContainer: {
    alignItems: 'center',
  },
  streakBadge: {
    width: 240,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.light.primaryLight,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'rgba(0, 0, 0, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 0, // Hard shadow for manga effect
    elevation: 5,
  },
  streakNumber: {
    fontSize: 64,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  streakLabel: {
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '700',
    fontSize: typography.sizes.base,
  },
  cardContainer: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  statsCard: {
    width: '100%',
    backgroundColor: colors.light.surface,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 0, // Hard shadow for manga effect
    elevation: 3,
  },
  cardTitle: {
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  statLabel: {
    textTransform: 'lowercase',
  },
  statDivider: {
    width: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    marginHorizontal: spacing.md,
  },
  borderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
  },
});