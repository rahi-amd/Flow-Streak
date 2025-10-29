import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../theme';

export default function Layout() {
  return (
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
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 24 }}>{focused ? '🏠' : '🏡'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: 'Timer',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 24 }}>{focused ? '⏱️' : '⏲️'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="+not-found"
        options={{
          href: null, // This hides it from tabs!
        }}
      />
    </Tabs>

  );
}