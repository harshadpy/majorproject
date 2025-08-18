import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export const AnimatedBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const gradientAnimation = useSharedValue(0);
  const particleAnimation = useSharedValue(0);

  useEffect(() => {
    gradientAnimation.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    particleAnimation.value = withRepeat(
      withTiming(1, { duration: 15000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedGradientStyle = useAnimatedStyle(() => {
    const colors = [
      interpolate(gradientAnimation.value, [0, 0.5, 1], [0.1, 0.3, 0.1]),
      interpolate(gradientAnimation.value, [0, 0.5, 1], [0.2, 0.1, 0.2]),
      interpolate(gradientAnimation.value, [0, 0.5, 1], [0.05, 0.15, 0.05]),
    ];

    return {
      opacity: interpolate(gradientAnimation.value, [0, 1], [0.8, 1]),
    };
  });

  // Generate floating particles
  const particles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 4 + 2,
    opacity: Math.random() * 0.6 + 0.2,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.gradientContainer, animatedGradientStyle]}>
        <LinearGradient
          colors={['#001a0d', '#002d1a', '#001a0d']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Floating Particles */}
      {particles.map((particle) => (
        <FloatingParticle
          key={particle.id}
          particle={particle}
          animationValue={particleAnimation}
        />
      ))}

      {children}
    </View>
  );
};

const FloatingParticle: React.FC<{
  particle: Particle;
  animationValue: Animated.SharedValue<number>;
}> = ({ particle, animationValue }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      animationValue.value,
      [0, 1],
      [particle.y, particle.y - height - 100]
    );

    const translateX = interpolate(
      animationValue.value,
      [0, 0.5, 1],
      [particle.x, particle.x + 50, particle.x - 30]
    );

    const opacity = interpolate(
      animationValue.value,
      [0, 0.1, 0.9, 1],
      [0, particle.opacity, particle.opacity, 0]
    );

    return {
      transform: [{ translateX }, { translateY }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: particle.size,
          height: particle.size,
        },
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#00ff41',
    borderRadius: 50,
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});