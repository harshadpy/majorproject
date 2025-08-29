import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import * as Animatable from 'react-native-animatable';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  animation?: string;
  style?: ViewStyle;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  delay = 0, 
  animation = 'fadeInUp',
  style 
}) => {
  return (
    <Animatable.View
      animation={animation}
      delay={delay}
      duration={600}
      style={[styles.card, style]}
    >
      {children}
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});