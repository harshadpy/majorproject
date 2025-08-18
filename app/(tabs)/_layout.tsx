import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, Camera, History, Book, User, Zap, Bug, Leaf, TrendingUp, Settings } from 'lucide-react-native';
import { FloatingTabBar } from '@/components/FloatingTabBar';
import { AnimatedBackground } from '@/components/AnimatedBackground';

export default function TabLayout() {
  const tabs = [
    {
      key: 'index',
      title: 'Farm',
      icon: <Home size={24} color="#ffffff" />,
      activeIcon: <Home size={24} color="#00ff41" />,
    },
    {
      key: 'camera',
      title: 'Detect',
      icon: <Camera size={24} color="#ffffff" />,
      activeIcon: <Zap size={24} color="#00ff41" />,
    },
    {
      key: 'history',
      title: 'History',
      icon: <History size={24} color="#ffffff" />,
      activeIcon: <TrendingUp size={24} color="#00ff41" />,
    },
    {
      key: 'knowledge',
      title: 'Knowledge',
      icon: <Book size={24} color="#ffffff" />,
      activeIcon: <Leaf size={24} color="#00ff41" />,
    },
    {
      key: 'profile',
      title: 'Profile',
      icon: <User size={24} color="#ffffff" />,
      activeIcon: <Settings size={24} color="#00ff41" />,
    },
  ];

  return (
    <AnimatedBackground>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // Hide default tab bar
        }}
        tabBar={(props) => (
          <FloatingTabBar
            tabs={tabs}
            activeTab={props.state.routeNames[props.state.index]}
            onTabPress={(tabKey) => {
              const index = props.state.routeNames.indexOf(tabKey);
              if (index !== -1) {
                props.navigation.navigate(props.state.routeNames[index]);
              }
            }}
          />
        )}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="camera" />
        <Tabs.Screen name="history" />
        <Tabs.Screen name="knowledge" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </AnimatedBackground>
  );
}