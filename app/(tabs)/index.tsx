import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, TrendingUp, TriangleAlert as AlertTriangle, Leaf, Sun, Plus, Activity, MapPin, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { StorageService, DetectionRecord } from '@/services/StorageService';
import { StatCard } from '@/components/StatCard';
import { AnimatedCard } from '@/components/AnimatedCard';
import * as Animatable from 'react-native-animatable';

export default function HomeTab() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalScans: 0,
    diseasesDetected: 0,
    pestsDetected: 0,
    criticalIssues: 0,
    healthyPlants: 0,
    growthRate: 0,
    lastScanDate: 0,
  });
  const [recentDetections, setRecentDetections] = useState<DetectionRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const [statsData, detections] = await Promise.all([
        StorageService.getStats(),
        StorageService.getDetections()
      ]);
      
      setStats(statsData);
      setRecentDetections(detections.slice(0, 3)); // Show only 3 most recent
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Refresh data when tab comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDetectionPress = () => {
    router.push('/camera');
  };

  const handleViewAllHistory = () => {
    router.push('/history');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'weather':
        Alert.alert('Weather Info', 'Weather integration coming soon!');
        break;
      case 'calendar':
        Alert.alert('Farm Calendar', 'Calendar feature coming soon!');
        break;
      case 'map':
        Alert.alert('Field Map', 'Field mapping feature coming soon!');
        break;
      case 'activity':
        router.push('/history');
        break;
      default:
        break;
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatLastScan = () => {
    if (!stats.lastScanDate) return 'No scans yet';
    
    const now = Date.now();
    const diff = now - stats.lastScanDate;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const quickActions = [
    { title: 'Weather', icon: Sun, color: '#f59e0b', action: 'weather' },
    { title: 'Calendar', icon: Calendar, color: '#3b82f6', action: 'calendar' },
    { title: 'Field Map', icon: MapPin, color: '#8b5cf6', action: 'map' },
    { title: 'Activity', icon: Activity, color: '#10b981', action: 'activity' },
  ];

  const quickStats = [
    { 
      title: 'Total Scans', 
      value: stats.totalScans, 
      color: '#16a34a', 
      icon: Camera,
      trend: 'up' as const,
      trendValue: '+12%'
    },
    { 
      title: 'Diseases Found', 
      value: stats.diseasesDetected, 
      color: '#dc2626', 
      icon: AlertTriangle,
      trend: stats.diseasesDetected > stats.pestsDetected ? 'up' as const : 'neutral' as const,
      trendValue: '3 this week'
    },
    { 
      title: 'Pests Found', 
      value: stats.pestsDetected, 
      color: '#ea580c', 
      icon: AlertTriangle,
      trend: 'neutral' as const,
      trendValue: '1 this week'
    },
    { 
      title: 'Critical Issues', 
      value: stats.criticalIssues, 
      color: '#ef4444', 
      icon: AlertTriangle,
      trend: stats.criticalIssues > 0 ? 'up' as const : 'neutral' as const,
      trendValue: stats.criticalIssues > 0 ? 'Needs attention' : 'All good'
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <Animatable.View animation="fadeInDown" style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.farmerName}>Farmer John</Text>
            <Text style={styles.lastScan}>Last scan: {formatLastScan()}</Text>
          </View>
          <TouchableOpacity 
            style={styles.weatherContainer}
            onPress={() => handleQuickAction('weather')}
          >
            <Sun size={24} color="#f59e0b" />
            <Text style={styles.temperature}>24°C</Text>
          </TouchableOpacity>
        </Animatable.View>

        {/* Hero Section */}
        <AnimatedCard delay={200} style={styles.heroSection}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Plant Health Detection</Text>
            <Text style={styles.heroSubtitle}>AI-powered disease and pest identification</Text>
            <TouchableOpacity style={styles.scanButton} onPress={handleDetectionPress}>
              <Camera size={20} color="#ffffff" />
              <Text style={styles.scanButtonText}>Start Detection</Text>
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Animatable.View
                  key={action.action}
                  animation="fadeInUp"
                  delay={300 + (index * 100)}
                >
                  <TouchableOpacity
                    style={styles.quickActionCard}
                    onPress={() => handleQuickAction(action.action)}
                  >
                    <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                      <IconComponent size={20} color={action.color} />
                    </View>
                    <Text style={styles.quickActionText}>{action.title}</Text>
                  </TouchableOpacity>
                </Animatable.View>
              );
            })}
          </View>
        </View>

        {/* Live Stats */}
        <View style={styles.statsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Farm Overview</Text>
            <TouchableOpacity onPress={onRefresh}>
              <TrendingUp size={20} color="#16a34a" />
            </TouchableOpacity>
          </View>
          <View style={styles.statsGrid}>
            {quickStats.map((stat, index) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                color={stat.color}
                icon={stat.icon}
                delay={400 + (index * 100)}
                trend={stat.trend}
                trendValue={stat.trendValue}
              />
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Detections</Text>
            <TouchableOpacity onPress={handleViewAllHistory}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentDetections.length === 0 ? (
            <AnimatedCard delay={600}>
              <View style={styles.emptyActivity}>
                <Camera size={48} color="#9ca3af" />
                <Text style={styles.emptyTitle}>No detections yet</Text>
                <Text style={styles.emptyText}>Start scanning your plants to see results here</Text>
                <TouchableOpacity style={styles.startScanningButton} onPress={handleDetectionPress}>
                  <Plus size={16} color="#16a34a" />
                  <Text style={styles.startScanningText}>Start Scanning</Text>
                </TouchableOpacity>
              </View>
            </AnimatedCard>
          ) : (
            recentDetections.map((detection, index) => (
              <AnimatedCard key={detection.id} delay={600 + (index * 100)}>
                <View style={styles.activityCard}>
                  <Image source={{ uri: detection.image }} style={styles.activityImage} />
                  <View style={styles.activityInfo}>
                    <View style={styles.activityHeader}>
                      <Text style={styles.activityTitle}>{detection.result.name}</Text>
                      <View style={[
                        styles.severityBadge,
                        { backgroundColor: `${getSeverityColor(detection.result.severity)}20` }
                      ]}>
                        <Text style={[
                          styles.severityText,
                          { color: getSeverityColor(detection.result.severity) }
                        ]}>
                          {detection.result.severity}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.activityCrop}>
                      {detection.crop} • {detection.result.confidence}% confidence
                    </Text>
                    <Text style={styles.activityTime}>
                      {formatTimeAgo(detection.timestamp)}
                    </Text>
                  </View>
                </View>
              </AnimatedCard>
            ))
          )}
        </View>

        {/* Tips Section */}
        <AnimatedCard delay={800} style={styles.tipsSection}>
          <View style={styles.tipCard}>
            <Leaf size={20} color="#16a34a" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Today's Farming Tip</Text>
              <Text style={styles.tipText}>
                Monitor your plants daily for early signs of disease. Early detection can prevent widespread crop damage and reduce treatment costs.
              </Text>
            </View>
          </View>
        </AnimatedCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const getSeverityColor = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'high': return '#ef4444';
    case 'medium': return '#f59e0b';
    case 'low': return '#10b981';
    default: return '#6b7280';
  }
};

const formatTimeAgo = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return 'Just now';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  farmerName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 2,
  },
  lastScan: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  temperature: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  heroSection: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    height: 200,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#e5e7eb',
    textAlign: 'center',
    marginBottom: 20,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '22%',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  viewAllText: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  activitySection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  startScanningButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  startScanningText: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  activityCard: {
    flexDirection: 'row',
    padding: 16,
  },
  activityImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    textTransform: 'capitalize',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activityCrop: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '500',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  tipsSection: {
    margin: 20,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#15803d',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#15803d',
    lineHeight: 20,
  },
});