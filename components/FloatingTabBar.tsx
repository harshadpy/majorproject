import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabItem {
  key: string;
  title: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
}

interface FloatingTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabKey: string) => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const FloatingTabBar: React.FC<FloatingTabBarProps> = ({
  tabs,
  activeTab,
  onTabPress,
}) => {
  const insets = useSafeAreaInsets();
  const indicatorPosition = useSharedValue(0);

  React.useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.key === activeTab);
    indicatorPosition.value = withSpring(activeIndex, {
      damping: 20,
      stiffness: 200,
    });
  }, [activeTab, tabs]);

  const triggerHaptics = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleTabPress = (tabKey: string) => {
    runOnJS(triggerHaptics)();
    onTabPress(tabKey);
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const tabWidth = 100 / tabs.length;
    const translateX = interpolate(
      indicatorPosition.value,
      [0, tabs.length - 1],
      [0, (tabs.length - 1) * (100 / tabs.length)]
    );

    return {
      transform: [{ translateX: `${translateX}%` }],
      width: `${tabWidth}%`,
    };
  });

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 10 }]}>
      <BlurView intensity={80} style={styles.blurContainer}>
        <LinearGradient
          colors={['rgba(0, 255, 65, 0.1)', 'rgba(0, 0, 0, 0.3)']}
          style={styles.tabBar}
        >
          {/* Animated Indicator */}
          <Animated.View style={[styles.indicator, animatedIndicatorStyle]}>
            <LinearGradient
              colors={['#00ff41', '#00cc33']}
              style={styles.indicatorGradient}
            />
          </Animated.View>

          {/* Tab Items */}
          {tabs.map((tab, index) => (
            <TabButton
              key={tab.key}
              tab={tab}
              isActive={activeTab === tab.key}
              onPress={() => handleTabPress(tab.key)}
            />
          ))}
        </LinearGradient>
      </BlurView>
    </View>
  );
};

const TabButton: React.FC<{
  tab: TabItem;
  isActive: boolean;
  onPress: () => void;
}> = ({ tab, isActive, onPress }) => {
  const scale = useSharedValue(1);
  const iconScale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
    iconScale.value = withSpring(1.2);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    iconScale.value = withSpring(1);
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = withTiming(isActive ? 1 : 0.7, { duration: 200 });
    const translateY = withSpring(isActive ? 0 : 2);

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <AnimatedTouchableOpacity
      style={[styles.tabButton, animatedButtonStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
        {isActive && tab.activeIcon ? tab.activeIcon : tab.icon}
      </Animated.View>
      <Animated.Text style={[styles.tabText, animatedTextStyle]}>
        {tab.title}
      </Animated.Text>
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  blurContainer: {
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 65, 0.3)',
  },
  tabBar: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  indicatorGradient: {
    flex: 1,
    borderRadius: 20,
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    zIndex: 2,
  },
  iconContainer: {
    marginBottom: 4,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});