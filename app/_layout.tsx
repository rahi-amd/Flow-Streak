import { Bangers_400Regular } from '@expo-google-fonts/bangers';
import { useFonts } from 'expo-font';
import { Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Image } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors, spacing } from '../theme';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  // Load manga-style font
  const [fontsLoaded] = useFonts({
    Bangers_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.light.primary,
          tabBarInactiveTintColor: colors.light.textSecondary,
          headerShown: false,
          tabBarStyle: {
            height: 60, // Reduced from 60 for compact design
           paddingBottom: 0, // Remove bottom padding to shift content up
           paddingTop: 0, // Remove top padding to eliminate space above border
           marginBottom: spacing.md, // 16px (0.5cm) lift from bottom
           borderTopWidth: 1,
           borderTopColor: colors.light.border,
          backgroundColor: colors.light.background,
          position: 'absolute', // Position absolutely to control placement
           bottom: spacing.md, // Lift 16px from bottom
            left: 0,
            right: 0,
          },
          tabBarLabelStyle: {
            fontSize: 13, // Smaller font for compact design
            fontWeight: '500',
            marginTop: 2, // Tighter spacing
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused, color }) => (
              <Image
                source={require('../assets/icons/home-icon.png')}
                style={{
                  width: 35, // Reduced from 35 for compact design
                  height: 35,
                  tintColor: color,
                }}
                resizeMode="contain"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="timer"
          options={{
            title: 'Timer',
            tabBarIcon: ({ focused, color }) => (
              <Image
                source={require('../assets/icons/timer-icon.png')}
                style={{
                  width: 35, // Reduced from 35 for compact design
                  height: 35,
                  tintColor: color,
                }}
                resizeMode="contain"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="+not-found"
          options={{
            href: null, // This hides it from tabs
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}