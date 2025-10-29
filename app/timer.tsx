import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Vibration, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AccessibleButton, AccessibleText } from '../components';
import { colors, spacing } from '../theme';

export default function TimerScreen() {
  const [time, setTime] = useState<number>(1500);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime - 1);
      }, 1000);
    } else if (time === 0 && isRunning) {
      handleComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, time]);

  const handleComplete = async () => {
    setIsRunning(false);
    Vibration.vibrate([0, 500, 200, 500]);
    
    // Save session
    try {
      const savedSessions = await AsyncStorage.getItem('sessions');
      const savedMinutes = await AsyncStorage.getItem('totalMinutes');
      const sessions = savedSessions ? parseInt(savedSessions) : 0;
      const minutes = savedMinutes ? parseInt(savedMinutes) : 0;
      
      await AsyncStorage.setItem('sessions', (sessions + 1).toString());
      await AsyncStorage.setItem('totalMinutes', (minutes + 25).toString());
    } catch (error) {
      console.log('Error saving:', error);
    }
    
    setTime(1500);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
              onPress={() => setTime(900)}
              variant="outline"
              size="small"
            />
            <AccessibleButton
              label="25 min"
              onPress={() => setTime(1500)}
              variant="outline"
              size="small"
            />
            <AccessibleButton
              label="45 min"
              onPress={() => setTime(2700)}
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