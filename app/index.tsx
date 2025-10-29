import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AccessibleText } from '../components';
import { colors, spacing } from '../theme';

export default function HomeScreen() {
  const [sessions, setSessions] = useState<number>(0);
  const [totalMinutes, setTotalMinutes] = useState<number>(0);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const savedSessions = await AsyncStorage.getItem('sessions');
      const savedMinutes = await AsyncStorage.getItem('totalMinutes');
      
      if (savedSessions) setSessions(parseInt(savedSessions));
      if (savedMinutes) setTotalMinutes(parseInt(savedMinutes));
    } catch (error) {
      console.log('Error loading data:', error);
    }
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
            🔥 {sessions > 0 ? 1 : 0}
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
          <AccessibleText variant="caption" color="textSecondary" align="center">
            GitHub-style calendar coming next! 📊
          </AccessibleText>
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
    minHeight: 200,
    justifyContent: 'center',
  },
  calendarTitle: {
    marginBottom: spacing.md,
  },
});
