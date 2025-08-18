import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, TrendingUp, TriangleAlert as AlertTriangle, Leaf, Sun, Zap, Award, Target, Activity } from 'lucide-react-native';
import { useRouter } from 'expo-router';
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
import { HolographicCard } from '@/components/HolographicCard';
import { PulsingButton } from '@/components/PulsingButton';
import { ParticleExplosion } from '@/components/ParticleExplosion';

const { width } = Dimensions.get('window');

export default function HomeTab() {
  const router = useRouter();
  const [showExplosion, setShowExplosion] = useState(false);
  const floatAnimation = useSharedValue(0);
  const statsAnimation = useSharedValue(0);

  useEffect(() => {
    floatAnimation.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    statsAnimation.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.exp) });
  }, []);

  const handleDetectionPress = () => {
    setShowExplosion(true);
    setTimeout(() => {
      router.push('/camera');
      setShowExplosion(false);
    }, 800);
  };

  const quickStats = [
    { title: 'AI Scans', value: '127', color: '#00ff41', icon: Zap, trend: '+23%' },
    { title: 'Healthy Plants', value: '89', color: '#ffd700', icon: Leaf, trend: '+15%' },
    { title: 'Issues Detected', value: '12', color: '#ff0040', icon: AlertTriangle, trend: '-8%' },
    { title: 'Success Rate', value: '94%', color: '#00d4ff', icon: Target, trend: '+5%' },
  ];

  const animatedHeroStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      floatAnimation.value,
      [0, 0.5, 1],
      [0, -10, 0]
    );

    return {
      transform: [{ translateY }],
    };
  });

  const animatedStatsStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      statsAnimation.value,
      [0, 1],
      [50, 0]
    );

    const opacity = interpolate(
      statsAnimation.value,
      [0, 0.5, 1],
      [0, 0.5, 1]
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Futuristic Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>🌅 GOOD MORNING</Text>
            <Text style={styles.farmerName}>CYBER FARMER</Text>
          </View>
          <HolographicCard style={styles.weatherCard} intensity={60}>
            <View style={styles.weatherContent}>
              <Sun size={20} color="#ffd700" />
              <Text style={styles.temperature}>24°C</Text>
              <Text style={styles.weatherStatus}>OPTIMAL</Text>
            </View>
          </HolographicCard>
        </View>

        {/* Hero Detection Section */}
        <Animated.View style={[styles.heroSection, animatedHeroStyle]}>
          <HolographicCard style={styles.heroCard} intensity={100}>
            <LinearGradient
              colors={['rgba(0, 255, 65, 0.2)', 'rgba(255, 107, 0, 0.1)']}
              style={styles.heroGradient}
            >
              <Image
                source={{ uri: 'https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&cs=tinysrgb&w=800' }}
                style={styles.heroImage}
              />
              <View style={styles.heroOverlay}>
                <View style={styles.heroContent}>
                  <Text style={styles.heroTitle}>🚀 AI PLANT DETECTIVE</Text>
                  <Text style={styles.heroSubtitle}>NEXT-GEN DISEASE & PEST DETECTION</Text>
                  
                  <PulsingButton
                    title="🔥 SCAN NOW"
                    onPress={handleDetectionPress}
                    variant="primary"
                    size="large"
                    style={styles.scanButton}
                    icon={<Camera size={24} color="#ffffff" />}
                  />
                </View>
              </View>
            </LinearGradient>
          </HolographicCard>
        </Animated.View>

        {/* Insane Stats Grid */}
        <Animated.View style={[styles.statsSection, animatedStatsStyle]}>
          <Text style={styles.sectionTitle}>⚡ FARM INTELLIGENCE</Text>
          <View style={styles.statsGrid}>
            {quickStats.map((stat, index) => (
              <StatCard key={index} stat={stat} index={index} />
            ))}
          </View>
        </Animated.View>

        {/* Mission Control Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>🎯 MISSION CONTROL</Text>
          <HolographicCard style={styles.activityCard} intensity={70}>
            <View style={styles.activityHeader}>
              <View style={styles.activityIconContainer}>
                <AlertTriangle size={20} color="#ff0040" />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>🚨 THREAT DETECTED</Text>
                <Text style={styles.activityTime}>⏰ 2 HOURS AGO</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>CRITICAL</Text>
              </View>
            </View>
            <Text style={styles.activityDescription}>
              🍅 Tomato Blight identified in Sector 7. AI recommends immediate organic treatment protocol.
            </Text>
            <PulsingButton
              title="VIEW TREATMENT"
              onPress={() => router.push('/history')}
              variant="danger"
              size="small"
              style={styles.treatmentButton}
            />
          </HolographicCard>
        </View>

        {/* Futuristic Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>🧠 AI FARMING WISDOM</Text>
          <HolographicCard style={styles.tipCard} intensity={60}>
            <View style={styles.tipContent}>
              <View style={styles.tipIcon}>
                <Leaf size={24} color="#00ff41" />
              </View>
              <View style={styles.tipText}>
                <Text style={styles.tipTitle}>💡 DAILY INSIGHT</Text>
                <Text style={styles.tipDescription}>
                  Monitor your crops with AI precision. Early detection prevents 90% of crop losses. 
                  Your digital farming assistant is always watching! 🤖
                </Text>
              </View>
            </View>
          </HolographicCard>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>⚡ QUICK ACTIONS</Text>
          <View style={styles.actionsGrid}>
            <QuickActionButton
              title="📚 KNOWLEDGE"
              subtitle="Browse Database"
              onPress={() => router.push('/knowledge')}
              color="#00d4ff"
            />
            <QuickActionButton
              title="📊 ANALYTICS"
              subtitle="View Reports"
              onPress={() => router.push('/history')}
              color="#ff6b00"
            />
          </View>
        </View>
      </ScrollView>

      <ParticleExplosion
        trigger={showExplosion}
        centerX={width / 2}
        centerY={400}
        particleCount={50}
        colors={['#00ff41', '#ffd700', '#00d4ff', '#ff6b00']}
      />
    </SafeAreaView>
  );
}

const StatCard: React.FC<{ stat: any; index: number }> = ({ stat, index }) => {
  const animation = useSharedValue(0);
  const IconComponent = stat.icon;

  useEffect(() => {
    setTimeout(() => {
      animation.value = withSpring(1, { damping: 15, stiffness: 200 });
    }, index * 200);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(animation.value, [0, 1], [0.5, 1]);
    const opacity = interpolate(animation.value, [0, 1], [0, 1]);
    const translateY = interpolate(animation.value, [0, 1], [30, 0]);

    return {
      transform: [{ scale }, { translateY }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.statCard, animatedStyle]}>
      <HolographicCard intensity={60}>
        <View style={styles.statContent}>
          <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
            <IconComponent size={24} color={stat.color} />
          </View>
          <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
          <Text style={styles.statTitle}>{stat.title}</Text>
          <Text style={[styles.statTrend, { color: stat.trend.startsWith('+') ? '#00ff41' : '#ff0040' }]}>
            {stat.trend}
          </Text>
        </View>
      </HolographicCard>
    </Animated.View>
  );
};

const QuickActionButton: React.FC<{
  title: string;
  subtitle: string;
  onPress: () => void;
  color: string;
}> = ({ title, subtitle, onPress, color }) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.quickActionCard, animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <HolographicCard intensity={70}>
          <View style={styles.quickActionContent}>
            <Text style={[styles.quickActionTitle, { color }]}>{title}</Text>
            <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
          </View>
        </HolographicCard>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 100, // Space for floating tab bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#00ff41',
    fontWeight: '700',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 255, 65, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  farmerName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  weatherCard: {
    minWidth: 120,
  },
  weatherContent: {
    alignItems: 'center',
  },
  temperature: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 4,
  },
  weatherStatus: {
    fontSize: 10,
    color: '#00ff41',
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
  heroSection: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  heroCard: {
    height: 240,
  },
  heroGradient: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  heroImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 255, 65, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#00ff41',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
    letterSpacing: 1,
  },
  scanButton: {
    minWidth: 180,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 255, 65, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 16,
  },
  statContent: {
    alignItems: 'center',
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statTitle: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.9,
  },
  statTrend: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  activitySection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  activityCard: {
    marginTop: 0,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 0, 64, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  activityTime: {
    fontSize: 12,
    color: '#00ff41',
    marginTop: 2,
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 0, 64, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff0040',
  },
  statusText: {
    fontSize: 10,
    color: '#ff0040',
    fontWeight: '700',
    letterSpacing: 1,
  },
  activityDescription: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.9,
  },
  treatmentButton: {
    alignSelf: 'flex-start',
  },
  tipsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  tipCard: {
    marginTop: 0,
  },
  tipContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0, 255, 65, 0.2)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tipText: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00ff41',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
    opacity: 0.9,
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
  },
  quickActionContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
  },
});