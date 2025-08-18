import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Bell, Shield, CircleHelp as HelpCircle, Settings, ChevronRight, Mail, Phone, MapPin, Award, LogOut, Zap, Target, Activity } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  withDelay,
  withRepeat,
  Easing,
} from 'react-native-worklets';
import { LinearGradient } from 'expo-linear-gradient';
import { HolographicCard } from '@/components/HolographicCard';
import { PulsingButton } from '@/components/PulsingButton';

const { width } = Dimensions.get('window');

export default function ProfileTab() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoDetectionEnabled, setAutoDetectionEnabled] = useState(false);
  const [aiModeEnabled, setAiModeEnabled] = useState(true);
  
  const profileAnimation = useSharedValue(0);
  const statsAnimation = useSharedValue(0);
  const glowAnimation = useSharedValue(0);

  useEffect(() => {
    profileAnimation.value = withTiming(1, { duration: 1000 });
    statsAnimation.value = withDelay(400, withTiming(1, { duration: 800 }));
    
    glowAnimation.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const profileStats = [
    { label: 'AI SCANS', value: '247', icon: Zap, color: '#00ff41', trend: '+47%' },
    { label: 'THREATS DETECTED', value: '23', icon: Target, color: '#ff0040', trend: '-12%' },
    { label: 'SUCCESS RATE', value: '96%', icon: Award, color: '#ffd700', trend: '+8%' },
    { label: 'CROPS SAVED', value: '189', icon: Activity, color: '#00d4ff', trend: '+23%' },
  ];

  const menuSections = [
    {
      title: '👤 CYBER PROFILE',
      items: [
        { title: 'Edit Profile', icon: User, onPress: () => {}, color: '#00ff41' },
        { title: 'Contact Info', icon: Mail, onPress: () => {}, color: '#00d4ff' },
        { title: 'Farm Location', icon: MapPin, onPress: () => {}, color: '#ffd700' },
      ]
    },
    {
      title: '⚙️ AI SETTINGS',
      items: [
        { 
          title: 'Push Notifications', 
          icon: Bell, 
          color: '#ff6b00',
          rightComponent: (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#374151', true: '#00ff41' }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#9ca3af'}
            />
          )
        },
        { 
          title: 'Auto Detection', 
          icon: Settings, 
          color: '#00d4ff',
          rightComponent: (
            <Switch
              value={autoDetectionEnabled}
              onValueChange={setAutoDetectionEnabled}
              trackColor={{ false: '#374151', true: '#00ff41' }}
              thumbColor={autoDetectionEnabled ? '#ffffff' : '#9ca3af'}
            />
          )
        },
        { 
          title: 'AI Enhanced Mode', 
          icon: Zap, 
          color: '#ffd700',
          rightComponent: (
            <Switch
              value={aiModeEnabled}
              onValueChange={setAiModeEnabled}
              trackColor={{ false: '#374151', true: '#00ff41' }}
              thumbColor={aiModeEnabled ? '#ffffff' : '#9ca3af'}
            />
          )
        },
      ]
    },
    {
      title: '🛡️ SUPPORT MATRIX',
      items: [
        { title: 'Help Center', icon: HelpCircle, onPress: () => {}, color: '#00ff41' },
        { title: 'Privacy Shield', icon: Shield, onPress: () => {}, color: '#ff0040' },
        { title: 'Terms Protocol', icon: Settings, onPress: () => {}, color: '#00d4ff' },
      ]
    }
  ];

  const animatedProfileStyle = useAnimatedStyle(() => {
    const scale = interpolate(profileAnimation.value, [0, 1], [0.8, 1]);
    const opacity = interpolate(profileAnimation.value, [0, 1], [0, 1]);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const animatedStatsStyle = useAnimatedStyle(() => {
    const translateY = interpolate(statsAnimation.value, [0, 1], [50, 0]);
    const opacity = interpolate(statsAnimation.value, [0, 1], [0, 1]);

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  const animatedGlowStyle = useAnimatedStyle(() => {
    const glowIntensity = interpolate(
      glowAnimation.value,
      [0, 0.5, 1],
      [0.5, 1, 0.5]
    );

    return {
      shadowOpacity: glowIntensity,
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Futuristic Profile Header */}
        <Animated.View style={[styles.profileHeader, animatedProfileStyle]}>
          <HolographicCard style={styles.profileCard} intensity={100}>
            <LinearGradient
              colors={['rgba(0, 255, 65, 0.2)', 'rgba(255, 107, 0, 0.1)']}
              style={styles.profileGradient}
            >
              <Animated.View style={[styles.avatarContainer, animatedGlowStyle]}>
                <LinearGradient
                  colors={['#00ff41', '#00cc33']}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>CF</Text>
                </LinearGradient>
              </Animated.View>
              <Text style={styles.profileName}>🚀 CYBER FARMER</Text>
              <Text style={styles.profileEmail}>cyber.farmer@agrishield.ai</Text>
              <Text style={styles.profileLocation}>📍 SMART FARM SECTOR 7, CALIFORNIA</Text>
              <View style={styles.levelBadge}>
                <Award size={16} color="#ffd700" />
                <Text style={styles.levelText}>LEVEL 12 FARMER</Text>
              </View>
            </LinearGradient>
          </HolographicCard>
        </Animated.View>

        {/* Insane Stats */}
        <Animated.View style={[styles.statsContainer, animatedStatsStyle]}>
          <Text style={styles.sectionTitle}>⚡ FARMING ANALYTICS</Text>
          <View style={styles.statsGrid}>
            {profileStats.map((stat, index) => (
              <StatCard key={index} stat={stat} index={index} />
            ))}
          </View>
        </Animated.View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <MenuSection key={sectionIndex} section={section} index={sectionIndex} />
        ))}

        {/* Futuristic Logout */}
        <View style={styles.logoutSection}>
          <HolographicCard style={styles.logoutCard} intensity={70}>
            <PulsingButton
              title="🚪 DISCONNECT FROM MATRIX"
              onPress={() => {}}
              variant="danger"
              size="large"
              style={styles.logoutButton}
              icon={<LogOut size={24} color="#ffffff" />}
            />
          </HolographicCard>
        </View>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <HolographicCard style={styles.versionCard} intensity={50}>
            <Text style={styles.versionText}>🤖 AGRISHIELD AI v2.0.25</Text>
            <Text style={styles.versionSubtext}>POWERED BY QUANTUM AGRICULTURE</Text>
          </HolographicCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const StatCard: React.FC<{ stat: any; index: number }> = ({ stat, index }) => {
  const animation = useSharedValue(0);
  const IconComponent = stat.icon;

  useEffect(() => {
    animation.value = withDelay(
      index * 200,
      withSpring(1, { damping: 15, stiffness: 200 })
    );
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
          <Text style={styles.statTitle}>{stat.label}</Text>
          <Text style={[styles.statTrend, { color: stat.trend.startsWith('+') ? '#00ff41' : '#ff0040' }]}>
            {stat.trend}
          </Text>
        </View>
      </HolographicCard>
    </Animated.View>
  );
};

const MenuSection: React.FC<{ section: any; index: number }> = ({ section, index }) => {
  const sectionAnimation = useSharedValue(0);

  useEffect(() => {
    sectionAnimation.value = withDelay(
      600 + index * 200,
      withTiming(1, { duration: 600 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(sectionAnimation.value, [0, 1], [width, 0]);
    const opacity = interpolate(sectionAnimation.value, [0, 1], [0, 1]);

    return {
      transform: [{ translateX }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.menuSection, animatedStyle]}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <HolographicCard style={styles.menuCard} intensity={60}>
        {section.items.map((item: any, itemIndex: number) => (
          <MenuItem key={itemIndex} item={item} isLast={itemIndex === section.items.length - 1} />
        ))}
      </HolographicCard>
    </Animated.View>
  );
};

const MenuItem: React.FC<{ item: any; isLast: boolean }> = ({ item, isLast }) => {
  const scale = useSharedValue(1);
  const IconComponent = item.icon;

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.menuItem, !isLast && styles.menuItemBorder, animatedStyle]}>
      <TouchableOpacity
        style={styles.menuItemContent}
        onPress={item.onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.menuItemLeft}>
          <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}20` }]}>
            <IconComponent size={20} color={item.color} />
          </View>
          <Text style={styles.menuItemText}>{item.title}</Text>
        </View>
        <View style={styles.menuItemRight}>
          {item.rightComponent || <ChevronRight size={16} color="#00ff41" />}
        </View>
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
    paddingBottom: 100,
  },
  profileHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  profileCard: {
    marginTop: 0,
  },
  profileGradient: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 10,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 255, 65, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  profileEmail: {
    fontSize: 16,
    color: '#00ff41',
    marginBottom: 8,
    fontWeight: '600',
  },
  profileLocation: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
    marginBottom: 16,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  levelText: {
    fontSize: 12,
    color: '#ffd700',
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 1,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 255, 65, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
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
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statTitle: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
    opacity: 0.9,
    letterSpacing: 1,
  },
  statTrend: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  menuCard: {
    marginTop: 0,
  },
  menuItem: {
    paddingVertical: 4,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 65, 0.2)',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  menuItemRight: {
    marginLeft: 12,
  },
  logoutSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  logoutCard: {
    marginTop: 0,
  },
  logoutButton: {
    width: '100%',
  },
  versionContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  versionCard: {
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#00ff41',
    fontWeight: '700',
    letterSpacing: 1,
  },
  versionSubtext: {
    fontSize: 12,
    color: '#ffffff',
    marginTop: 4,
    opacity: 0.7,
    letterSpacing: 1,
  },
});