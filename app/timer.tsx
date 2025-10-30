import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Vibration, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AccessibleButton, AccessibleText } from '../components';
import { colors, spacing } from '../theme';

export default function TimerScreen() {
  const router = useRouter();
  const [time, setTime] = useState<number>(1500); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Handle timer completion - useCallback to prevent recreating on every render
  const handleComplete = useCallback(async () => {
    setIsRunning(false);
    Vibration.vibrate([0, 500, 200, 500]);
    
    try {
      // Use local date string to match calendar format
      const today = new Date();
      const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      // Load current stats
      const savedSessions = await AsyncStorage.getItem('sessions');
      const savedMinutes = await AsyncStorage.getItem('totalMinutes');
      const sessions = savedSessions ? parseInt(savedSessions) : 0;
      const minutes = savedMinutes ? parseInt(savedMinutes) : 0;
      
      // Update stats
      await AsyncStorage.setItem('sessions', (sessions + 1).toString());
      await AsyncStorage.setItem('totalMinutes', (minutes + 25).toString());
      
      // Update session history
      const historyJson = await AsyncStorage.getItem('sessionHistory');
      const history = historyJson ? JSON.parse(historyJson) : {};
      
      if (history[dateString]) {
        history[dateString] += 25;
      } else {
        history[dateString] = 25;
      }
      
      await AsyncStorage.setItem('sessionHistory', JSON.stringify(history));
      
      console.log(`✅ Session saved for ${dateString}: ${history[dateString]} minutes`);
      
    } catch (error) {
      console.log('❌ Error saving session:', error);
    }
    
    // Reset timer to 25 minutes
    setTime(1500);
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime - 1);
      }, 1000);
    } else if (time === 0 && isRunning) {
      handleComplete();
    }

    // Cleanup interval on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, time, handleComplete]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle quick start buttons
  const handleQuickStart = (seconds: number) => {
    setIsRunning(false); // Stop timer if running
    setTime(seconds);    // Set new duration
  };

  return (
    <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <AccessibleText 
            variant="heading" 
            align="center"
            style={styles.title}
          >
            Focus Session
          </AccessibleText>

          <View style={styles.timerContainer}>
            <AccessibleText 
              variant="title" 
              align="center"
              style={styles.timerText}
            >
              {formatTime(time)}
            </AccessibleText>
          </View>

          <AccessibleButton
            label={isRunning ? 'Pause Timer' : 'Start Timer'}
            hint={isRunning ? 'Pauses the current focus session' : 'Begins a 25 minute focus session'}
            onPress={() => {
              if (time === 0) setTime(1500);
              setIsRunning(!isRunning);
            }}
            variant="primary"
            size="large"
          />

          {time !== 1500 && (
            <View style={styles.resetButton}>
              <AccessibleButton
                label="Reset"
                hint="Resets timer to 25 minutes"
                onPress={() => {
                  setIsRunning(false);
                  setTime(1500);
                }}
                variant="outline"
                size="medium"
              />
            </View>
          )}

          <View style={styles.quickActions}>
            <AccessibleText variant="body" color="textSecondary" style={styles.quickLabel}>
              Quick Start:
            </AccessibleText>
            <View style={styles.quickButtons}>
              <AccessibleButton
                label="15 min"
                hint="Set timer to 15 minutes"
                onPress={() => handleQuickStart(900)}
                variant="outline"
                size="small"
              />
              <AccessibleButton
                label="25 min"
                hint="Set timer to 25 minutes"
                onPress={() => handleQuickStart(1500)}
                variant="outline"
                size="small"
              />
              <AccessibleButton
                label="45 min"
                hint="Set timer to 45 minutes"
                onPress={() => handleQuickStart(2700)}
                variant="outline"
                size="small"
              />
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  title: {
    marginBottom: spacing.xl,
  },
  timerContainer: {
    marginVertical: spacing.xxl,
  },
  timerText: {
    fontSize: 72,
    fontWeight: '700',
  },
  resetButton: {
    marginTop: spacing.md,
  },
  quickActions: {
    marginTop: spacing.xxl,
    width: '100%',
    alignItems: 'center',
  },
  quickLabel: {
    marginBottom: spacing.sm,
  },
  quickButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});