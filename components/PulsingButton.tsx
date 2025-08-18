import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-worklets';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface PulsingButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  disabled?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const PulsingButton: React.FC<PulsingButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  variant = 'primary',
  size = 'medium',
  icon,
  disabled = false,
}) => {
  const scale = useSharedValue(1);
  const pulseAnimation = useSharedValue(0);
  const pressAnimation = useSharedValue(0);

  React.useEffect(() => {
    if (!disabled) {
      pulseAnimation.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        true
      );
    }
  }, [disabled]);

  const triggerHaptics = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
    pressAnimation.value = withTiming(1, { duration: 100 });
    runOnJS(triggerHaptics)();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    pressAnimation.value = withTiming(0, { duration: 200 });
  };

  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return ['#00ff41', '#00cc33'];
      case 'secondary':
        return ['#ff6b00', '#cc5500'];
      case 'danger':
        return ['#ff0040', '#cc0033'];
      case 'success':
        return ['#ffd700', '#ccaa00'];
      default:
        return ['#00ff41', '#00cc33'];
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: 16, paddingVertical: 8, fontSize: 14 };
      case 'large':
        return { paddingHorizontal: 32, paddingVertical: 16, fontSize: 18 };
      default:
        return { paddingHorizontal: 24, paddingVertical: 12, fontSize: 16 };
    }
  };

  const colors = getVariantColors();
  const sizeStyles = getSizeStyles();

  const animatedButtonStyle = useAnimatedStyle(() => {
    const pulseScale = interpolate(
      pulseAnimation.value,
      [0, 0.5, 1],
      [1, 1.05, 1]
    );

    const glowOpacity = interpolate(
      pulseAnimation.value,
      [0, 0.5, 1],
      [0.5, 1, 0.5]
    );

    return {
      transform: [{ scale: scale.value * pulseScale }],
      shadowOpacity: disabled ? 0 : glowOpacity * 0.8,
    };
  });

  const animatedGradientStyle = useAnimatedStyle(() => {
    const pressOpacity = interpolate(
      pressAnimation.value,
      [0, 1],
      [1, 0.8]
    );

    return {
      opacity: disabled ? 0.5 : pressOpacity,
    };
  });

  return (
    <AnimatedTouchableOpacity
      style={[
        styles.button,
        {
          shadowColor: colors[0],
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 12,
          elevation: 8,
        },
        animatedButtonStyle,
        style,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.9}
    >
      <AnimatedLinearGradient
        colors={colors}
        style={[
          styles.gradient,
          {
            paddingHorizontal: sizeStyles.paddingHorizontal,
            paddingVertical: sizeStyles.paddingVertical,
          },
          animatedGradientStyle,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {icon && <Animated.View style={styles.icon}>{icon}</Animated.View>}
        <Text style={[styles.text, { fontSize: sizeStyles.fontSize }, textStyle]}>
          {title}
        </Text>
      </AnimatedLinearGradient>
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});