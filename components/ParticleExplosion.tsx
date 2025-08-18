import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-worklets';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  color: string;
  size: number;
}

interface ParticleExplosionProps {
  trigger: boolean;
  onComplete?: () => void;
  centerX?: number;
  centerY?: number;
  particleCount?: number;
  colors?: string[];
}

export const ParticleExplosion: React.FC<ParticleExplosionProps> = ({
  trigger,
  onComplete,
  centerX = width / 2,
  centerY = height / 2,
  particleCount = 30,
  colors = ['#00ff41', '#ff6b00', '#ffd700', '#00d4ff'],
}) => {
  const animationProgress = useSharedValue(0);

  const particles: Particle[] = React.useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => {
      const angle = (i / particleCount) * Math.PI * 2;
      const velocity = Math.random() * 200 + 100;
      
      return {
        id: i,
        x: centerX,
        y: centerY,
        velocityX: Math.cos(angle) * velocity,
        velocityY: Math.sin(angle) * velocity,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 4,
      };
    });
  }, [centerX, centerY, particleCount, colors]);

  useEffect(() => {
    if (trigger) {
      animationProgress.value = 0;
      animationProgress.value = withTiming(
        1,
        { duration: 1500 },
        (finished) => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        }
      );
    }
  }, [trigger]);

  if (!trigger) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle) => (
        <ParticleComponent
          key={particle.id}
          particle={particle}
          animationProgress={animationProgress}
        />
      ))}
    </View>
  );
};

const ParticleComponent: React.FC<{
  particle: Particle;
  animationProgress: Animated.SharedValue<number>;
}> = ({ particle, animationProgress }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const progress = animationProgress.value;
    
    const translateX = interpolate(
      progress,
      [0, 1],
      [0, particle.velocityX]
    );
    
    const translateY = interpolate(
      progress,
      [0, 1],
      [0, particle.velocityY + 200] // Add gravity effect
    );
    
    const opacity = interpolate(
      progress,
      [0, 0.1, 0.8, 1],
      [0, 1, 1, 0]
    );
    
    const scale = interpolate(
      progress,
      [0, 0.2, 1],
      [0, 1, 0.3]
    );

    return {
      transform: [
        { translateX: particle.x + translateX },
        { translateY: particle.y + translateY },
        { scale },
      ],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: particle.color,
          width: particle.size,
          height: particle.size,
          shadowColor: particle.color,
        },
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
});