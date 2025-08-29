import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';

interface StatCardProps {
  title: string;
  value: string | number;
  color: string;
  icon: React.ComponentType<any>;
  onPress?: () => void;
  delay?: number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  color, 
  icon: IconComponent, 
  onPress,
  delay = 0,
  trend,
  trendValue
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <Animatable.View
      animation="fadeInUp"
      delay={delay}
      duration={600}
    >
      <CardComponent style={styles.card} onPress={onPress}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <IconComponent size={20} color={color} />
        </View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
        {trend && trendValue && (
          <View style={styles.trendContainer}>
            <Text style={[
              styles.trendText,
              { color: trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#6b7280' }
            ]}>
              {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
            </Text>
          </View>
        )}
      </CardComponent>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  trendContainer: {
    marginTop: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
});