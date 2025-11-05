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
      dateMap.set(date, dateMap.get(date)! + minutes);
    } else {
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

export default function ActivityScreen() {
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const historyJson = await AsyncStorage.getItem('sessionHistory');
      if (historyJson) {
        const history = JSON.parse(historyJson);
        
        // Convert to array format
        const historyArray = Object.keys(history).map(date => ({
          date: date,
          minutes: history[date]
        }));
        
        // Process calendar data
        const processedData = processCalendarData(historyArray);
        setCalendarData(processedData);
      }
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <AccessibleText 
          variant="heading" 
          align="center"
          style={styles.title}
        >
          Activity
        </AccessibleText>

        {/* Calendar Card - ONLY THIS */}
        <View style={styles.calendarCard}>
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
  calendarCard: {
    backgroundColor: colors.light.surface,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.light.border,
  },
});