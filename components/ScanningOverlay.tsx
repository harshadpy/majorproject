import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface ScanningOverlayProps {
  isScanning: boolean;
  progress?: number;
}

export const ScanningOverlay: React.FC<ScanningOverlayProps> = ({
  isScanning,
  progress = 0,
}) => {
  const scanLineAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(0);
  const gridAnimation = useSharedValue(0);

  useEffect(() => {
    if (isScanning) {
      scanLineAnimation.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );

      pulseAnimation.value = withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );

      gridAnimation.value = withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      scanLineAnimation.value = 0;
      pulseAnimation.value = 0;
      gridAnimation.value = 0;
    }
  }, [isScanning]);

  const animatedScanLineStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scanLineAnimation.value,
      [0, 1],
      [-250, 250]
    );

    const opacity = interpolate(
      scanLineAnimation.value,
      [0, 0.1, 0.9, 1],
      [0, 1, 1, 0]
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  const animatedCornerStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      pulseAnimation.value,
      [0, 0.5, 1],
      [1, 1.1, 1]
    );

    const opacity = interpolate(
      pulseAnimation.value,
      [0, 0.5, 1],
      [0.8, 1, 0.8]
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const animatedGridStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      gridAnimation.value,
      [0, 0.5, 1],
      [0.2, 0.6, 0.2]
    );

    return {
      opacity,
    };
  });

  if (!isScanning) return null;

  return (
    <View style={styles.overlay}>
      {/* Scanning Grid */}
      <Animated.View style={[styles.grid, animatedGridStyle]}>
        {Array.from({ length: 10 }).map((_, i) => (
          <View key={`h-${i}`} style={[styles.gridLine, styles.horizontalLine, { top: `${i * 10}%` }]} />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <View key={`v-${i}`} style={[styles.gridLine, styles.verticalLine, { left: `${i * 10}%` }]} />
        ))}
      </Animated.View>

      {/* Scan Frame */}
      <View style={styles.scanFrame}>
        {/* Corner Indicators */}
        <Animated.View style={[styles.corner, styles.topLeft, animatedCornerStyle]} />
        <Animated.View style={[styles.corner, styles.topRight, animatedCornerStyle]} />
        <Animated.View style={[styles.corner, styles.bottomLeft, animatedCornerStyle]} />
        <Animated.View style={[styles.corner, styles.bottomRight, animatedCornerStyle]} />

        {/* Scanning Line */}
        <Animated.View style={[styles.scanLine, animatedScanLineStyle]}>
          <LinearGradient
            colors={['transparent', '#00ff41', 'transparent']}
            style={styles.scanLineGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        </Animated.View>

        {/* Center Target */}
        <View style={styles.centerTarget}>
          <View style={styles.targetRing} />
          <View style={styles.targetDot} />
        </View>
      </View>

      {/* Scanning Text */}
      <View style={styles.textContainer}>
        <Text style={styles.scanningText}>🔍 AI ANALYZING PLANT</Text>
        <Text style={styles.progressText}>
          {Math.round(progress * 100)}% COMPLETE
        </Text>
      </View>

      {/* Digital Rain Effect */}
      <View style={styles.digitalRain}>
        {Array.from({ length: 20 }).map((_, i) => (
          <DigitalRainDrop key={i} delay={i * 100} />
        ))}
      </View>
    </View>
  );
};

const DigitalRainDrop: React.FC<{ delay: number }> = ({ delay }) => {
  const animation = useSharedValue(0);

  useEffect(() => {
    const startAnimation = () => {
      animation.value = 0;
      animation.value = withTiming(1, { duration: 2000 }, (finished) => {
        if (finished) {
          runOnJS(startAnimation)();
        }
      });
    };

    setTimeout(startAnimation, delay);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(animation.value, [0, 1], [-50, 400]);
    const opacity = interpolate(animation.value, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.rainDrop, animatedStyle]}>
      <Text style={styles.rainText}>01</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#00ff41',
  },
  horizontalLine: {
    left: 0,
    right: 0,
    height: 1,
  },
  verticalLine: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  scanFrame: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#00ff41',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    top: '50%',
  },
  scanLineGradient: {
    flex: 1,
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  centerTarget: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 40,
    height: 40,
    marginTop: -20,
    marginLeft: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00ff41',
    position: 'absolute',
  },
  targetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00ff41',
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  textContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  scanningText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00ff41',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 255, 65, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  progressText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  digitalRain: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  rainDrop: {
    position: 'absolute',
    left: `${Math.random() * 90}%`,
  },
  rainText: {
    color: '#00ff41',
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.6,
  },
});