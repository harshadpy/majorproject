import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { History as HistoryIcon, Calendar, CircleAlert as AlertCircle, CircleCheck as CheckCircle, TrendingUp, Filter, Zap, Award } from 'lucide-react-native';
import { DetectionService } from '@/services/DetectionService';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { HolographicCard } from '@/components/HolographicCard';
import { PulsingButton } from '@/components/PulsingButton';

const { width } = Dimensions.get('window');

export default function HistoryTab() {
  const [detections, setDetections] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'disease' | 'pest'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const headerAnimation = useSharedValue(0);
  const statsAnimation = useSharedValue(0);

  useEffect(() => {
    loadDetectionHistory();
    
    headerAnimation.value = withTiming(1, { duration: 800 });
    statsAnimation.value = withDelay(300, withTiming(1, { duration: 1000 }));
  }, []);

  const loadDetectionHistory = async () => {
    setIsLoading(true);
    try {
      const history = await DetectionService.getDetectionHistory();
      setDetections(history);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced mock data with futuristic styling
  const mockDetections = [
    {
      id: '1',
      timestamp: Date.now() - 86400000,
      type: 'disease',
      crop: 'tomato',
      result: {
        name: 'early blight',
        scientific_name: 'Alternaria solani',
        severity: 'Medium',
        confidence: 85,
        description: 'AI detected early blight fungal infection with 85% confidence.',
      },
      image: 'https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'treated'
    },
    {
      id: '2',
      timestamp: Date.now() - 172800000,
      type: 'pest',
      crop: 'pepper',
      result: {
        name: 'aphids',
        scientific_name: 'Aphidoidea',
        severity: 'Low',
        confidence: 92,
        description: 'Small sap-feeding insects detected on pepper plants.',
      },
      image: 'https://images.pexels.com/photos/1407305/pexels-photo-1407305.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'monitoring'
    },
    {
      id: '3',
      timestamp: Date.now() - 259200000,
      type: 'disease',
      crop: 'corn',
      result: {
        name: 'leaf rust',
        scientific_name: 'Puccinia sorghi',
        severity: 'High',
        confidence: 78,
        description: 'Critical fungal infection requiring immediate treatment.',
      },
      image: 'https://images.pexels.com/photos/2518861/pexels-photo-2518861.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'critical'
    },
  ];

  const displayDetections = detections.length > 0 ? detections : mockDetections;
  const filteredDetections = filterType === 'all' 
    ? displayDetections 
    : displayDetections.filter(detection => detection.type === filterType);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'TODAY';
    if (diffDays === 1) return 'YESTERDAY';
    return `${diffDays} DAYS AGO`;
  };

  const getSeverityColor = (severity: string) => {
    return DetectionService.getSeverityColor(severity);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'treated': return '#00ff41';
      case 'monitoring': return '#ffd700';
      case 'critical': return '#ff0040';
      default: return '#00d4ff';
    }
  };

  const getStats = () => {
    const total = displayDetections.length;
    const diseases = displayDetections.filter(d => d.type === 'disease').length;
    const pests = displayDetections.filter(d => d.type === 'pest').length;
    const critical = displayDetections.filter(d => d.result.severity.toLowerCase() === 'high').length;

    return { total, diseases, pests, critical };
  };

  const stats = getStats();

  const animatedHeaderStyle = useAnimatedStyle(() => {
    const translateY = interpolate(headerAnimation.value, [0, 1], [-50, 0]);
    const opacity = interpolate(headerAnimation.value, [0, 1], [0, 1]);

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  const animatedStatsStyle = useAnimatedStyle(() => {
    const scale = interpolate(statsAnimation.value, [0, 1], [0.8, 1]);
    const opacity = interpolate(statsAnimation.value, [0, 1], [0, 1]);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, animatedHeaderStyle]}>
        <HolographicCard style={styles.headerCard} intensity={80}>
          <View style={styles.headerContent}>
            <HistoryIcon size={28} color="#00ff41" />
            <Text style={styles.headerTitle}>🕒 DETECTION ARCHIVE</Text>
          </View>
        </HolographicCard>
      </Animated.View>

      {/* Futuristic Stats */}
      <Animated.View style={[styles.statsContainer, animatedStatsStyle]}>
        <HolographicCard style={styles.statsCard} intensity={70}>
          <View style={styles.statsGrid}>
            <StatItem title="TOTAL SCANS" value={stats.total} color="#00ff41" icon={Zap} />
            <StatItem title="DISEASES" value={stats.diseases} color="#ff0040" icon={AlertCircle} />
            <StatItem title="PESTS" value={stats.pests} color="#ff6b00" icon={AlertCircle} />
            <StatItem title="CRITICAL" value={stats.critical} color="#ffd700" icon={Award} />
          </View>
        </HolographicCard>
      </Animated.View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <HolographicCard style={styles.filterCard} intensity={60}>
          <View style={styles.filterButtons}>
            {[
              { key: 'all', label: '🌐 ALL', color: '#00d4ff' },
              { key: 'disease', label: '🦠 DISEASES', color: '#ff0040' },
              { key: 'pest', label: '🐛 PESTS', color: '#ff6b00' },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  filterType === filter.key && [styles.filterButtonActive, { borderColor: filter.color }]
                ]}
                onPress={() => setFilterType(filter.key as any)}
              >
                <Text style={[
                  styles.filterText,
                  filterType === filter.key && [styles.filterTextActive, { color: filter.color }]
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </HolographicCard>
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredDetections.length === 0 ? (
          <View style={styles.emptyState}>
            <HolographicCard style={styles.emptyCard} intensity={60}>
              <HistoryIcon size={64} color="#00ff41" />
              <Text style={styles.emptyTitle}>🚀 NO SCANS YET</Text>
              <Text style={styles.emptyText}>
                Start scanning your crops to build your AI detection archive! 🤖
              </Text>
            </HolographicCard>
          </View>
        ) : (
          filteredDetections.map((detection, index) => (
            <DetectionCard key={detection.id || index} detection={detection} index={index} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const StatItem: React.FC<{
  title: string;
  value: number;
  color: string;
  icon: any;
}> = ({ title, value, color, icon: IconComponent }) => {
  return (
    <View style={styles.statItem}>
      <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
        <IconComponent size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{title}</Text>
    </View>
  );
};

const DetectionCard: React.FC<{ detection: any; index: number }> = ({ detection, index }) => {
  const cardAnimation = useSharedValue(0);

  useEffect(() => {
    cardAnimation.value = withDelay(
      index * 150,
      withSpring(1, { damping: 15, stiffness: 200 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(cardAnimation.value, [0, 1], [width, 0]);
    const opacity = interpolate(cardAnimation.value, [0, 1], [0, 1]);

    return {
      transform: [{ translateX }],
      opacity,
    };
  });

  const getSeverityColor = (severity: string) => {
    return DetectionService.getSeverityColor(severity);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'TODAY';
    if (diffDays === 1) return 'YESTERDAY';
    return `${diffDays} DAYS AGO`;
  };

  return (
    <Animated.View style={[styles.detectionCard, animatedStyle]}>
      <HolographicCard style={styles.detectionCardInner} intensity={60}>
        <View style={styles.detectionContent}>
          <Image source={{ uri: detection.image }} style={styles.detectionImage} />
          
          <View style={styles.detectionInfo}>
            <View style={styles.detectionHeader}>
              <Text style={styles.detectionName}>
                🔬 {detection.result.name.toUpperCase()}
              </Text>
              <View style={[styles.statusIndicator, { backgroundColor: getSeverityColor(detection.result.severity) }]}>
                <Text style={styles.statusText}>{detection.result.severity.toUpperCase()}</Text>
              </View>
            </View>
            
            <Text style={styles.scientificName}>📋 {detection.result.scientific_name}</Text>
            
            <View style={styles.detectionMeta}>
              <View style={styles.metaItem}>
                <Calendar size={14} color="#00ff41" />
                <Text style={styles.metaText}>{formatDate(detection.timestamp)}</Text>
              </View>
              <View style={styles.metaItem}>
                <TrendingUp size={14} color="#ffd700" />
                <Text style={styles.metaText}>{detection.result.confidence}% ACCURACY</Text>
              </View>
            </View>
            
            <Text style={styles.cropType}>🌱 CROP: {detection.crop.toUpperCase()}</Text>
            <Text style={styles.detectionDescription} numberOfLines={2}>
              {detection.result.description}
            </Text>

            {detection.status && (
              <View style={[styles.statusBadge, { backgroundColor: `${getSeverityColor(detection.result.severity)}20` }]}>
                <Text style={[styles.statusBadgeText, { color: getSeverityColor(detection.result.severity) }]}>
                  {detection.status.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </HolographicCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerCard: {
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginLeft: 12,
    textShadowColor: 'rgba(0, 255, 65, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsCard: {
    marginTop: 0,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
    opacity: 0.8,
    letterSpacing: 1,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterCard: {
    marginTop: 0,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(0, 255, 65, 0.2)',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  filterTextActive: {
    textShadowColor: 'rgba(0, 255, 65, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  listContainer: {
    flex: 1,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyCard: {
    width: '100%',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 255, 65, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  detectionCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  detectionCardInner: {
    marginTop: 0,
  },
  detectionContent: {
    flexDirection: 'row',
  },
  detectionImage: {
    width: 100,
    height: 120,
    borderRadius: 12,
    marginRight: 16,
  },
  detectionInfo: {
    flex: 1,
  },
  detectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detectionName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00ff41',
    flex: 1,
    textShadowColor: 'rgba(0, 255, 65, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  scientificName: {
    fontSize: 14,
    color: '#ffffff',
    fontStyle: 'italic',
    marginBottom: 12,
    opacity: 0.8,
  },
  detectionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    color: '#ffffff',
    marginLeft: 6,
    fontWeight: '600',
    opacity: 0.9,
  },
  cropType: {
    fontSize: 12,
    color: '#ffd700',
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
  },
  detectionDescription: {
    fontSize: 13,
    color: '#ffffff',
    lineHeight: 18,
    opacity: 0.9,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
});