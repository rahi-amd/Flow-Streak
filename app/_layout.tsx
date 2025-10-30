import { Tabs } from 'expo-router';
import { Image } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '../theme';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.light.primary,
          tabBarInactiveTintColor: colors.light.textSecondary,
          headerShown: false,
          tabBarStyle: {
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: colors.light.border,
            backgroundColor: colors.light.background,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
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
                  width: 35,
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
                  width: 35,
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