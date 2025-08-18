import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-worklets';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface HolographicCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  animated?: boolean;
}

export const HolographicCard: React.FC<HolographicCardProps> = ({
  children,
  style,
  intensity = 80,
  animated = true,
}) => {
  const shimmerAnimation = useSharedValue(0);
  const hoverAnimation = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      shimmerAnimation.value = withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [animated]);

  const animatedShimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerAnimation.value,
      [0, 1],
      [-200, 200]
    );

    return {
      transform: [{ translateX }],
    };
  });

  const animatedCardStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      hoverAnimation.value,
      [0, 1],
      [1, 1.02]
    );

    return {
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View style={[styles.container, style, animatedCardStyle]}>
      {/* Holographic Border */}
      <LinearGradient
        colors={['#00ff41', '#ff6b00', '#00d4ff', '#ffd700']}
        style={styles.borderGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <BlurView intensity={intensity} style={styles.blurContainer}>
          <LinearGradient
            colors={[
              'rgba(0, 255, 65, 0.1)',
              'rgba(255, 107, 0, 0.05)',
              'rgba(0, 212, 255, 0.1)',
            ]}
            style={styles.innerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.content}>
              {children}
            </View>

            {/* Shimmer Effect */}
            {animated && (
              <Animated.View style={[styles.shimmer, animatedShimmerStyle]}>
                <LinearGradient
                  colors={[
                    'transparent',
                    'rgba(255, 255, 255, 0.3)',
                    'transparent',
                  ]}
                  style={styles.shimmerGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </Animated.View>
            )}
          </LinearGradient>
        </BlurView>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  borderGradient: {
    padding: 2,
    borderRadius: 20,
  },
  blurContainer: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  innerGradient: {
    borderRadius: 18,
    position: 'relative',
  },
  content: {
    padding: 20,
    position: 'relative',
    zIndex: 2,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  shimmerGradient: {
    flex: 1,
    width: 100,
  },
});