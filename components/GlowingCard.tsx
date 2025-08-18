import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-worklets';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface GlowingCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glowColor?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export const GlowingCard: React.FC<GlowingCardProps> = ({
  children,
  style,
  glowColor = '#00ff41',
  intensity = 'medium',
}) => {
  const glowAnimation = useSharedValue(0);

  React.useEffect(() => {
    glowAnimation.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedGlowStyle = useAnimatedStyle(() => {
    const glowOpacity = interpolate(
      glowAnimation.value,
      [0, 0.5, 1],
      [0.3, 0.8, 0.3]
    );

    const scale = interpolate(
      glowAnimation.value,
      [0, 0.5, 1],
      [1, 1.02, 1]
    );

    return {
      opacity: glowOpacity,
      transform: [{ scale }],
    };
  });

  const getIntensityValues = () => {
    switch (intensity) {
      case 'low':
        return { shadowRadius: 8, blurRadius: 4 };
      case 'high':
        return { shadowRadius: 20, blurRadius: 12 };
      default:
        return { shadowRadius: 12, blurRadius: 8 };
    }
  };

  const { shadowRadius, blurRadius } = getIntensityValues();

  return (
    <View style={[styles.container, style]}>
      {/* Glow Effect */}
      <Animated.View style={[styles.glowContainer, animatedGlowStyle]}>
        <LinearGradient
          colors={[`${glowColor}40`, `${glowColor}20`, `${glowColor}10`]}
          style={[
            styles.glow,
            {
              shadowColor: glowColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius,
            },
          ]}
        />
      </Animated.View>

      {/* Glass Morphism Card */}
      <BlurView intensity={blurRadius * 10} style={styles.blurContainer}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
          style={styles.glassMorphism}
        >
          <View style={styles.content}>
            {children}
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  glowContainer: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
  },
  glow: {
    flex: 1,
    borderRadius: 20,
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  glassMorphism: {
    flex: 1,
    borderRadius: 16,
  },
  content: {
    padding: 16,
  },
});