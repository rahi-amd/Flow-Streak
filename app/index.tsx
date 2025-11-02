import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AccessibleText, ContributionCalendar } from '../components';
import { colors, spacing } from '../theme';

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
      const savedSessions = await AsyncStorage.getItem('sessions');
      const savedMinutes = await AsyncStorage.getItem('totalMinutes');
      
      // Load session count and total minutes
      if (savedSessions) setSessions(parseInt(savedSessions));
      if (savedMinutes) setTotalMinutes(parseInt(savedMinutes));
      
      // Load and process session history for calendar
      const historyJson = await AsyncStorage.getItem('sessionHistory');
      if (historyJson) {
        const history = JSON.parse(historyJson);
        
        // Convert history object to array format
        const historyArray = Object.keys(history).map(date => ({
          date: date,
          minutes: history[date]
        }));
        
        // Process into calendar format with levels
        const processedData = processCalendarData(historyArray);
        setCalendarData(processedData);
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <AccessibleText 
          variant="heading" 
          align="center"
          style={styles.title}
        >
          FlowStreak
        </AccessibleText>

        <View style={styles.streakBadge}>
          <AccessibleText 
            variant="title" 
            align="center"
          >
            🔥 {calculateStreak()}
          </AccessibleText>
          <AccessibleText 
            variant="caption" 
            color="textSecondary"
            align="center"
          >
            Day Streak
          </AccessibleText>
        </View>

        <View style={styles.statsCard}>
          <AccessibleText variant="body" weight="semibold">
            Today's Progress
          </AccessibleText>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <AccessibleText variant="heading" color="primary">
                {totalMinutes}
              </AccessibleText>
              <AccessibleText variant="caption" color="textSecondary">
                minutes
              </AccessibleText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <AccessibleText variant="heading" color="primary">
                {sessions}
              </AccessibleText>
              <AccessibleText variant="caption" color="textSecondary">
                sessions
              </AccessibleText>
            </View>
          </View>
        </View>

        <View style={styles.calendarCard}>
          <AccessibleText variant="body" weight="semibold" style={styles.calendarTitle}>
            Activity
          </AccessibleText>
          
          <ContributionCalendar data={calendarData} />
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
    paddingBottom: spacing.xxl + spacing.md, 

  },
  title: {
    marginBottom: spacing.xl,
  },
  streakBadge: {
    alignSelf: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.light.primaryLight,
    borderRadius: 20,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  statsCard: {
    backgroundColor: colors.light.surface,
    padding: spacing.lg,
    borderRadius: 16,
    marginBottom: spacing.lg,
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
  statDivider: {
    width: 1,
    backgroundColor: colors.light.border,
    marginHorizontal: spacing.md,
  },
  calendarCard: {
    backgroundColor: colors.light.surface,
    padding: spacing.lg,
    borderRadius: 16,
  },
  calendarTitle: {
    marginBottom: spacing.md,
  },
});