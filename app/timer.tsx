import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Vibration, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line } from 'react-native-svg';
import { AccessibleButton, AccessibleText } from '../components';
import { colors, spacing } from '../theme';

// Manga-style action lines component (more intense than speed lines)
const ActionLines: React.FC<{ intensity?: 'low' | 'medium' | 'high' }> = ({ intensity = 'medium' }) => {
  const lineCount = intensity === 'low' ? 8 : intensity === 'medium' ? 12 : 16;
  const opacity = intensity === 'low' ? 0.1 : intensity === 'medium' ? 0.15 : 0.2;
  
  const lines = Array.from({ length: lineCount }, (_, i) => {
    const angle = (i * 360) / lineCount;
    const radians = (angle * Math.PI) / 180;
    const startRadius = 120;
    const endRadius = 250;
    
    const x1 = 200 + Math.cos(radians) * startRadius;
    const y1 = 200 + Math.sin(radians) * startRadius;
    const x2 = 200 + Math.cos(radians) * endRadius;
    const y2 = 200 + Math.sin(radians) * endRadius;
    
    return { x1, y1, x2, y2, key: i };
  });

  return (
    <Svg height="400" width="400" style={styles.actionLinesContainer}>
      {lines.map(line => (
        <Line
          key={line.key}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="#000000"
          strokeWidth="3"
          opacity={opacity}
        />
      ))}
      
      {/* Center circle for focus */}
      <Circle
        cx="200"
        cy="200"
        r="115"
        fill="none"
        stroke="#000000"
        strokeWidth="2"
        opacity="0.05"
      />
    </Svg>
  );
};

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
      
      // Update session history (this is the ONLY source of truth now)
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

  // Determine action line intensity based on timer state
  const getActionLineIntensity = () => {
    if (!isRunning) return 'low';
    if (time < 300) return 'high'; // Last 5 minutes
    if (time < 900) return 'medium'; // Last 15 minutes
    return 'low';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView 
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <AccessibleText 
            variant="heading" 
            align="center"
            style={styles.title}
          >
            FOCUS SESSION
          </AccessibleText>

          {/* Timer Display with Action Lines */}
          <View style={styles.timerContainer}>
            <ActionLines intensity={getActionLineIntensity()} />
            <View style={styles.timerCircle}>
              <AccessibleText 
                variant="title" 
                align="center"
                style={styles.timerText}
              >
                {formatTime(time)}
              </AccessibleText>
            </View>
          </View>

          {/* Main Action Button with Manga Border */}
          <View style={styles.buttonContainer}>
            <View style={styles.mainButtonWrapper}>
              <AccessibleButton
                label={isRunning ? 'PAUSE TIMER' : 'START TIMER'}
                hint={isRunning ? 'Pauses the current focus session' : 'Begins a 25 minute focus session'}
                onPress={() => {
                  if (time === 0) setTime(1500);
                  setIsRunning(!isRunning);
                }}
                variant="primary"
                size="large"
              />
            </View>

            {time !== 1500 && (
              <View style={styles.resetButton}>
                <AccessibleButton
                  label="RESET"
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
          </View>

          {/* Quick Start Actions */}
          <View style={styles.quickActions}>
            <AccessibleText variant="body" color="textSecondary" style={styles.quickLabel}>
              QUICK START:
            </AccessibleText>
            <View style={styles.quickButtons}>
              <View style={styles.quickButtonWrapper}>
                <AccessibleButton
                  label="15 min"
                  hint="Set timer to 15 minutes"
                  onPress={() => handleQuickStart(900)}
                  variant="outline"
                  size="small"
                />
              </View>
              <View style={styles.quickButtonWrapper}>
                <AccessibleButton
                  label="25 min"
                  hint="Set timer to 25 minutes"
                  onPress={() => handleQuickStart(1500)}
                  variant="outline"
                  size="small"
                />
              </View>
              <View style={styles.quickButtonWrapper}>
                <AccessibleButton
                  label="45 min"
                  hint="Set timer to 45 minutes"
                  onPress={() => handleQuickStart(2700)}
                  variant="outline"
                  size="small"
                />
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    paddingBottom: spacing.xxl + spacing.md, // Extra padding to lift content away from tab bar
  },
  title: {
    marginBottom: spacing.xl,
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  timerContainer: {
    position: 'relative',
    marginVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLinesContainer: {
    position: 'absolute',
  },
  timerCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.light.primaryLight,
    borderWidth: 3,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 0, // Hard shadow for manga effect
    elevation: 5,
  },
  timerText: {
    fontSize: 72,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  mainButtonWrapper: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 3,
  },
  resetButton: {
    marginTop: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 2,
  },
  quickActions: {
    marginTop: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  quickLabel: {
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  quickButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickButtonWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 2,
  },
});